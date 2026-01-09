export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";
import type {NextRequest} from "next/server";
import {findUserLeanById} from "@/server/repositories/userRepo";
import {startWorkout} from "@/server/services/workoutService";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type ReqBody = {
    day?: unknown;
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

        const reqBody = (await req?.json()) as ReqBody;
        const user = await findUserLeanById(userId);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        if (reqBody?.day) {
            await startWorkout(userId, reqBody?.day);
        }

        return new Response(JSON.stringify({result: "Saved Successfully"}));
    } catch (error: unknown) {
        return new Response(JSON.stringify({error: "Saving Error"}));
    }
}