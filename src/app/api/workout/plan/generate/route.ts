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
    modifyingInput?: unknown;
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
            msg = `You are an AI specialized in workout program design and modification.
You are NOT a conversational assistant.

Your task is to interpret the use's message and intelligently modify the workout plan while considering volume, recovery, balance, and safety.

GENERAL RULE
If the message is related to the workout plan, modify it intelligently and return the FULL updated workout plan.
If the message is not related to the workout plan, return ONLY this exact text:
"Error: Please provide a plan-related request."

Never explain reasoning.
Never ask follow-up questions.
Never output anything except the full plan or the exact error message.

PLAN MODIFICATION RULES

If the user explicitly asks to change, update, regenerate, or replace the plan:
Rebuild the affected part, ensure weekly balance, adjust exercises, sets, and reps, and return the FULL updated plan.

If the user mentions unavailable, busy, or missing equipment:
Remove all dependent exercises, replace them with biomechanically similar alternatives, adjust volume if needed, and return the FULL updated plan.

If the user mentions time limits, unavailable days, or scheduling conflicts:
Redistribute workouts across available days, keep all muscle groups trained, convert unavailable days to rest if needed, manage fatigue, and return the FULL updated plan.

If the user mentions injuries or medical conditions:
Prioritize safety, remove risky movements, use joint-friendly alternatives, reduce load or volume if needed, and return the FULL updated plan.

INVALID INPUT

If the message is casual, social, unrelated, nonsensical, or unreadable, return ONLY:
"Error: Please provide a plan-related request."

EXPECTED BEHAVIOR

Never return partial updates.
Never explain changes.
Output ONLY one of the following:
A FULL updated workout plan
OR
The exact error message

SAMPLE BEHAVIOR

User: "No Friday."
AI: FULL updated workout plan

User: "I have scoliosis."
AI: FULL updated workout plan with safe alternatives

User: "Hello."
AI: "Error: Please provide a plan-related request."

ATTENTION! This is user Input that you need to process:
"${String((reqBody as { modifying?: unknown }).modifying)}"`;
        } else {
            msg = `
Generate a COMPLETE 7-day weekly gym training program in PURE JSON format for a ${userData.age}-year-old ${userData.gender} whose goal is ${userData.goal}.

You are an AI that generates structured workout programs.

CRITICAL OUTPUT RULES
Output MUST be valid JSON only.
Output MUST start with [ and end with ].
Do NOT include markdown, explanations, comments, headings, or extra text.
Do NOT include trailing commas.
All strings must use valid JSON escapes only (\\n, \\", \\\\, \\t, \\b, \\f, \\r).
Do NOT include emojis or non-ASCII characters.
Strings MUST NOT contain unescaped quotes.
The output MUST be parsable by JSON.parse() without preprocessing.

URL RULES
All video URLs must be valid, contain no spaces, and start with https://.

REQUIRED STRUCTURE (DO NOT CHANGE KEYS)

[
{
"day": "Monday through Sunday",
"rest": true or false,
"muscles": "Targeted muscles or 'Rest'",
"exercises": [
{
"name": "Exercise name",
"sets": "number as string",
"reps": "rep range or time as string",
"instructions": "Use ONLY \n for line breaks",
"video": "YouTube URL"
}
]
}
]

STRUCTURAL RULES
Provide EXACTLY 7 objects: Monday to Sunday.
Rest days MUST have "rest": true, "muscles": "Rest", and "exercises": [].
Training days MUST have "rest": false and at least 2 exercises.
Exercise names must be realistic gym exercises.
Instructions must be clear, concise, and actionable.
Never include unescaped backslashes.

QUALITY RULES
The program must match the stated goal (${userData.goal}).
Intensity, volume, and exercise selection must be age-appropriate.
Avoid unsafe, redundant, or contradictory exercises.
Prefer compound movements before isolation exercises.
Ensure logical balance and progression across the week.

FINAL COMMAND
Return ONLY pure JSON.
No explanations.
No extra characters.
No markdown.

`;
        }

        const messages: ChatCompletionMessageParam[] = [...history, {role: "user", content: msg}];

        const result = await genAI.chat.completions.create({
            model: "gpt-5.2",
            messages,
            temperature: 0.2,
        });

        const text = result.choices?.[0]?.message?.content || "";

        if (reqBody.modifying && text.toLowerCase().includes("error")) {
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