export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {cookies} from "next/headers";
import {findUserLeanById} from "@/server/repositories/userRepo";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type WorkoutItem = {
    active?: boolean;
    date?: unknown;
    workout?: unknown;
};

type UserWithWorkouts = {
    workouts: WorkoutItem[];
};

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Session Error"}, {status: 400});

        const payload = (await verifyToken(token)) as TokenPayload;

        if (!payload) {
            return NextResponse.json({error: "Session Error"}, {status: 400});
        }

        const userId = payload.sub;

        const user = (await findUserLeanById(userId)) as UserWithWorkouts | null | undefined;

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        const workouts = user?.workouts ?? [];

        if (workouts[workouts.length - 1]?.active) {
            const last = workouts[workouts.length - 1];
            return new Response(
                JSON.stringify({
                    result: {
                        date: last.date,
                        workout: last.workout,
                    },
                })
            );
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error: unknown) {
        console.error("GET USER DATA FAILED:", error);
        return NextResponse.json(
            {error: "Getting user data failed"},
            {status: 500}
        );
    }
}