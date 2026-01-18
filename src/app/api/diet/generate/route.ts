export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {cookies} from "next/headers";
import OpenAI from "openai";
import type {ChatCompletionMessageParam} from "openai/resources/chat/completions";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";
import {calculateAge} from "@/hooks/calculateAge";
import {addAiMessage, addUserMessage, getChatHistory} from "@/server/services/dietService";
import {
    addMistake,
    clearBan,
    clearMistakes,
    extendBan,
    getMistakes,
    setBan
} from "@/server/services/banService";
import {findUserLeanById} from "@/server/repositories/userRepo";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type ReqBody = {
    modifying?: boolean;
    userModifications?: string;
};

type BanInfo = {
    date: string | number | Date;
    minutes?: number; // needed for extendBan typing; does not change runtime logic
};

type Allergy = {
    title: string;
};

type UserDetails = {
    _id?: unknown; // required by getChatHistory; exists in DB user doc
    gender: unknown;
    dob: unknown;
    height: unknown;
    weight: unknown;
    activity: unknown;
    goal: unknown;
    allergies: Allergy[];
    ban?: BanInfo;
};

// ✅ OpenAI client using API key from .env (OPENAI_API)
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

        const userId: string = payload.sub;

        const reqBody = (await req?.json()) as ReqBody;

        // ✅ Get user + ban info from DB
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

        // ✅ If banned, return ban message
        const banDate = toDateSafe(ban?.date);

        if (banDate && banDate > new Date()) {
            return new Response(
                JSON.stringify({
                    error: `You are banned until ${banDate.toDateString()} ${banDate.toLocaleTimeString()}`,
                })
            );
        }

        // ✅ Build user data for prompt
        const userData = {
            gender: user.gender,
            age: await calculateAge(user.dob as unknown as string),
            height: user.height,
            weight: user.weight,
            activity: user.activity,
            goal: user.goal,
            allergies: user.allergies,
        };

        // ✅ Build allergies list
        let allergiesList = "";
        if (userData.allergies.length !== 0) {
            userData.allergies.forEach((allergy) => {
                allergiesList += allergy.title + ",";
            });
        } else {
            allergiesList = "empty";
        }

        // ✅ Load today + chat history
        const today = new Date();
        const historyRaw = (await getChatHistory(
            today,
            user as unknown as Parameters<typeof getChatHistory>[1]
        )) as unknown;

        const history: ChatCompletionMessageParam[] = Array.isArray(historyRaw)
            ? historyRaw
                .map((m): ChatCompletionMessageParam | null => {
                    const mm = m as { role?: unknown; content?: unknown };
                    const content = toStringOrEmpty(mm.content);
                    if (!content) return null;

                    return {
                        role: toChatRole(mm.role),
                        content,
                    };
                })
                .filter((x): x is ChatCompletionMessageParam => x !== null)
            : [];

        // ✅ Build message prompt
        let msg: string;

        if (reqBody?.modifying) {
            msg = `
Modify the most recent meal plan in the conversation.

Rules:
- Keep the SAME JSON schema (same keys, same structure).
- Return the FULL updated plan (not a diff).
- Totals (calories/macros) must match the updated foods.
- Keep times in HH:MM.
- Respect allergies strictly.

Return ONLY the JSON object.

ATTENTION! This is user Input that you need to process:
"${reqBody.userModifications}"
`;
        } else {
            msg = `
Create a 1-day meal plan for me.

User profile:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Activity level: ${userData.activity}
- Goal: ${userData.goal}
- Allergies: ${allergiesList}

Requirements:
- Compute appropriate daily calories and macros for the goal.
- Make meals practical and globally common (no obscure foods).
- Respect allergies strictly (do not include them).
- Keep totals consistent with foods (reasonable accuracy).

Return ONLY the JSON object described in the system instructions.`;
        }

        // ✅ Convert DB history into OpenAI "messages"
        const messages: ChatCompletionMessageParam[] = [...history, {role: "user", content: msg}];

        // ✅ OpenAI call
        const result = await genAI.chat.completions.create({
            model: "gpt-5.2",
            messages,
            temperature: 0.2,
        });

        // ✅ Extract text output
        const text = result.choices?.[0]?.message?.content || "";

        // ✅ Your existing error / ban logic
        const trimmed = text.trim();

        if (reqBody.modifying && trimmed === '{"error": true}') {
            let message: string;

            if (ban) {
                const date = (await extendBan(
                    userId,
                    ban as unknown as Parameters<typeof extendBan>[1]
                )) as Date;
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
            } else {
                await addMistake(userId);
                message = `Type only about diet`;
            }

            if ((await getMistakes(userId)) === 2) {
                const date = (await setBan(userId)) as Date;
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
                await clearMistakes(userId);
            }

            return new Response(JSON.stringify({error: message}));
        }

        // ✅ Clear mistakes/ban if success
        await clearMistakes(userId);
        await clearBan(userId);

        // ✅ Save chat messages
        await addUserMessage(today, userId, msg);
        await addAiMessage(today, userId, text);

        // ✅ Return result
        return new Response(JSON.stringify({result: text}));
    } catch (error: unknown) {
        console.log("Error: " + String(error));
        return new Response(JSON.stringify({message: "Something went wrong..."}));
    }
}