export const maxDuration = 60;
export const dynamic = "force-dynamic";

import OpenAI from "openai";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import type {ChatCompletionMessageParam} from "openai/resources/chat/completions";
import {findUserLeanById} from "@/server/repositories/userRepo";
import {verifyToken} from "@/lib/auth/jwt";
import {calculateAge} from "@/hooks/calculateAge";
import {
    addMistake,
    clearBan,
    clearMistakes,
    extendBan,
    getMistakes,
    setBan
} from "@/server/services/banService";
import {
    addWorkoutAiMessage,
    addWorkoutUserMessage,
    getProgramChatHistory
} from "@/server/services/trainingService";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type BanInfo = {
    date: string | number | Date;
    minutes?: number; // needed for extendBan typing; does not change runtime logic
};

type TrainingItem = {
    date?: unknown;
};

type UserDetails = {
    _id?: unknown; // getProgramChatHistory may require it
    gender: unknown;
    dob: unknown;
    goal: unknown;
    ban?: BanInfo;
    training?: TrainingItem[];
};

type ReqBody = {
    regenerate?: boolean;
    modifying?: boolean;
    [key: string]: unknown;
};

const genAI = new OpenAI({
    apiKey: process.env.OPENAI_API as string,
});

function toChatRole(role: unknown): "system" | "user" | "assistant" {
    if (role === "system" || role === "assistant" || role === "user") return role;
    return "user";
}

function toStringOrEmpty(v: unknown): string {
    return typeof v === "string" ? v : "";
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

        const reqBody = (await req.json()) as ReqBody;

        // ✅ Get user + ban info from DB (cast through unknown to satisfy TS)
        const user = ((await findUserLeanById(userId)) as unknown) as UserDetails | null;

        if (!user) {
            return NextResponse.json({error: "Finding User Error"}, {status: 400});
        }

        const ban = user?.ban;

        function toDateSafe(v: unknown): Date | null {
            if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
            if (typeof v === "string" || typeof v === "number") {
                const d = new Date(v);
                return isNaN(d.getTime()) ? null : d;
            }
            return null;
        }

        // If user is currently banned, block request
        const banDate = toDateSafe(ban?.date);

        if (banDate && banDate > new Date()) {
            return new Response(
                JSON.stringify({
                    error: `You are banned until ${banDate.toDateString()} ${banDate.toLocaleTimeString()}`,
                })
            );
        }

        // Regeneration cooldown: allow regenerate once per week
        if (reqBody?.regenerate) {
            const previousGenerating = user?.training?.[0]?.date;
            if (previousGenerating) {
                const oneWeekLater =
                    new Date(previousGenerating as unknown as string).getTime() + 7 * 24 * 60 * 60 * 1000;

                if (Date.now() < oneWeekLater) {
                    return new Response(
                        JSON.stringify({
                            error: `Regenerating is available once per week. You must wait until ${new Date(oneWeekLater).toLocaleString()}`,
                        }),
                        {status: 429}
                    );
                }
            }
        }

        const userData = {
            gender: user.gender,
            age: await calculateAge(user.dob as unknown as string),
            goal: user.goal,
        };

        const historyRaw = (await getProgramChatHistory(
            reqBody,
            user as unknown as Parameters<typeof getProgramChatHistory>[1]
        )) as unknown;

        const history: ChatCompletionMessageParam[] = Array.isArray(historyRaw)
            ? historyRaw
                .map((m): ChatCompletionMessageParam | null => {
                    const mm = m as { role?: unknown; content?: unknown };
                    const content = toStringOrEmpty(mm.content);
                    if (!content) return null;

                    return {
                        role: toChatRole(mm.role),
                        content, // <- string
                    };
                })
                .filter((x): x is ChatCompletionMessageParam => x !== null)
            : [];

        let msg: string;

        if (reqBody?.modifying) {
            msg = `
Modify the most recent workout plan in the conversation.

Rules:
- Keep the SAME JSON schema and keys.
- Return the FULL updated 7-day plan (not a diff).
- Keep days Monday-Sunday in order, exactly 7 objects.
- Rest day format must remain valid.
- Maintain weekly balance, recovery, and safety.

Return ONLY the JSON array.

ATTENTION! This is user Input that you need to process:
"${String((reqBody as { modifying?: unknown }).modifying)}"`;
        } else {
            msg = `
Generate a complete 7-day weekly gym training program.

User profile:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Goal: ${userData.goal}

Requirements:
- EXACTLY 7 days Monday-Sunday in order.
- Include 2-5 training days and 2-3 rest days (choose appropriate split).
- Each training day: 4-7 exercises total, at least 1 compound lift.
- Keep it realistic for a normal gym.
- Return ONLY the JSON array described in system instructions.`;
        }

        const messages: ChatCompletionMessageParam[] = [...history, {role: "user", content: msg}];

        const result = await genAI.chat.completions.create({
            model: "gpt-5.2",
            messages,
            temperature: 0.2,
        });

        const text = result.choices?.[0]?.message?.content || "";

        const trimmed = text.trim();

        if (reqBody.modifying && trimmed === '[{"error":true}]') {
            let message: string;

            if (ban) {
                const date = (await extendBan(
                    userId,
                    ban as unknown as Parameters<typeof extendBan>[1]
                )) as Date;
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
            } else {
                await addMistake(userId);
                message = "Type only about training plan";
            }

            if ((await getMistakes(userId)) === 2) {
                const date = (await setBan(userId)) as Date;
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
                await clearMistakes(userId);
            }

            return new Response(JSON.stringify({error: message}), {status: 400});
        }

        await Promise.all([
            clearMistakes(userId),
            clearBan(userId),
            addWorkoutUserMessage(userId, msg),
            addWorkoutAiMessage(userId, text),
        ]);

        return new Response(JSON.stringify({result: text}));
    } catch (error: unknown) {
        console.error(error);
        return new Response(JSON.stringify({error: "Something went wrong..."}), {status: 500});
    }
}