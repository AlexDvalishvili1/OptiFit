export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";
import {findUserLeanById} from "@/server/repositories/userRepo";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type UserWithWorkouts = {
    workouts: unknown[];
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

        // keep same behavior as `toReversed()` but compatible everywhere
        const reversed = [...(user?.workouts ?? [])].reverse();

        return new Response(JSON.stringify({result: reversed}));
    } catch (error: unknown) {
        console.error("GET USER DATA FAILED:", error);
        return NextResponse.json(
            {error: "Getting user data failed"},
            {status: 500}
        );
    }
}