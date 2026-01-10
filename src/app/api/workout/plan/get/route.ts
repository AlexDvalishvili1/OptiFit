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

type TrainingItem = {
    plan?: unknown;
};

type UserWithTraining = {
    training: TrainingItem[];
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

        const user = (await findUserLeanById(userId)) as UserWithTraining | null | undefined;

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        let plan: unknown;

        if (user?.training.length > 0) {
            plan = user?.training[0]?.plan;
        }

        if (plan) {
            return new Response(JSON.stringify({result: plan}));
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
