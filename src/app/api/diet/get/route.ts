export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {findUserLeanById} from "@/server/repositories/userRepo";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";
import type {NextRequest} from "next/server";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type ReqBody = {
    date?: unknown;
};

type DietHistoryItem = {
    content: string;
};

type DietDay = {
    date: Date;
    history: DietHistoryItem[];
};

type UserWithDiets = {
    diets: DietDay[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

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

        const rawBody: unknown = await req?.json();
        const reqBody: ReqBody = isRecord(rawBody) ? (rawBody as ReqBody) : {};

        const user = (await findUserLeanById(userId)) as (UserWithDiets | null | undefined);

        const date = new Date(reqBody.date as unknown as string);

        const diets = user?.diets ?? [];
        let lastDiet: string | undefined;

        diets.map((day) => {
            if (
                date.getFullYear() === day.date.getFullYear() &&
                date.getMonth() === day.date.getMonth() &&
                date.getDate() === day.date.getDate()
            ) {
                lastDiet = day.history[day.history.length - 1].content;
            }
        });

        if (lastDiet) {
            return new Response(JSON.stringify({result: lastDiet}));
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error: unknown) {
        return new Response(JSON.stringify({error: "Getting user data failed"}));
    }
}