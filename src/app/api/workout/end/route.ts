export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";
import type {NextRequest} from "next/server";
import {endWorkout} from "@/server/services/workoutService";
import {findUserLeanById} from "@/server/repositories/userRepo";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type WorkoutSet = Record<string, unknown>;

type WorkoutExercise = {
    data: WorkoutSet[];
};

type WorkoutDay = {
    exercises: WorkoutExercise[];
};

type ReqBody = {
    day?: WorkoutDay;
    timer?: unknown;
};

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Session Error"}, {status: 400});

        const payload = (await verifyToken(token)) as TokenPayload;

        if (!payload) {
            return NextResponse.json({error: "Session Error"}, {status: 400});
        }

        const userId = payload.sub;

        const user = await findUserLeanById(userId);
        const reqBody = (await req?.json()) as ReqBody;

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        if (reqBody?.day) {
            const exercises = reqBody.day.exercises;
            for (const exercise of exercises) {
                for (const set of exercise.data) {
                    const keys = Object.keys(set);
                    for (const value of keys) {
                        const v = (set as Record<string, unknown>)[value];
                        const asNumber = typeof v === "number" ? v : Number(v);

                        if (
                            v?.toString() === "" ||
                            Number.isNaN(asNumber) ||
                            asNumber < 0
                        ) {
                            return new Response(JSON.stringify({error: "Invalid input"}));
                        }
                    }
                }
            }
        }

        await endWorkout(userId, reqBody?.day, reqBody?.timer);

        return new Response(JSON.stringify({result: "Saved Successfully"}));
    } catch (error: unknown) {
        return new Response(JSON.stringify({error: "Saving Error"}));
    }
}