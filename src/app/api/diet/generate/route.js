export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {
    addAiMessage,
    addMistake, addUserMessage, clearBan,
    clearMistakes,
    extendBan,
    getChatHistory,
    getMistakes,
    getUserDetails, setBan
} from "../../../../utils/db-actions.js";
import {cookies} from "next/headers";

// ✅ OpenAI SDK (replaces Gemini)
import OpenAI from "openai";
import {NextResponse} from "next/server";
import {verifyToken} from "../../../../lib/auth/jwt.ts";
import {calculateAge} from "../../../../hooks/calculateAge.ts";

// ✅ OpenAI client using API key from .env (OPENAI_API_KEY)
const genAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Session Error"}, {status: 400});

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({error: "Session Error"}, {status: 400});
        }

        const userId = payload.sub;

        const reqBody = await req?.json();
        let user;
        let ban;

        // ✅ Get user + ban info from DB
        user = await getUserDetails(userId);

        if (!user) {
            return NextResponse.json({error: "Finding User Error"}, {status: 400});
        }

        ban = user?.ban;

        // ✅ If banned, return ban message
        if (ban?.date > new Date()) {
            const banDate = new Date(ban.date);
            return new Response(
                JSON.stringify({
                    error: `You are banned until ${banDate.toDateString()} ${banDate.toLocaleTimeString()}`
                })
            );
        }

        // ✅ Build user data for prompt
        const userData = {
            gender: user.gender,
            age: await calculateAge(user.dob),
            height: user.height,
            weight: user.weight,
            activity: user.activity,
            goal: user.goal,
            allergies: user.allergies
        };

        // ✅ Build allergies list
        let allergiesList = "";
        userData.allergies.length !== 0
            ? userData.allergies.map((allergy) => (allergiesList += allergy.title + ","))
            : (allergiesList = "empty");

        // ✅ Load today + chat history
        const today = new Date();
        const history = await getChatHistory(today, user);

        // ✅ Build message prompt
        let msg;

        // ✅ Unified JSON schema (TOP-LEVEL TOTALS ALWAYS)
        const unifiedSchema = `
JSON Structure (MUST follow exactly):
{
  "calories": 2200,
  "protein": 160,
  "fat": 70,
  "carbohydrates": 240,
  "meals": [
    {
      "name": "Breakfast",
      "time": "08:00",
      "foods": [
        {
          "name": "Greek yogurt",
          "serving": "200 g",
          "calories": 140,
          "protein": 20,
          "fat": 0,
          "carbohydrates": 10
        }
      ]
    }
  ]
}

RULES:
- calories/protein/fat/carbohydrates MUST be NUMBERS (no "g" strings).
- Always include these 4 totals at the TOP LEVEL.
- Always include meals array.
- No markdown, no code fences, no extra text, JSON ONLY.
If the conversation is not about diet or closely related to diet topics return the object "Error: True"
If the conversation is unrelated to diet or nutrition return the object "Error: True"
If the user message is not diet-related or nutrition-focused return the object "Error: True"
If the discussion is outside the scope of diet or nutrition return the object "Error: True"
If the conversation does not concern diet planning or nutrition return the object "Error: True"
If the input is not about diet food or nutrition topics return the object "Error: True"
If the message is not directly or indirectly related to diet return the object "Error: True"
If the conversation topic is not diet or a closely connected nutrition subject return the object "Error: True"
If the user request is outside the diet or nutrition domain return the object "Error: True"
If the conversation does not involve diet nutrition or meal planning return the object "Error: True"
If the message is unrelated to diet nutrition or eating habits return the object "Error: True"
If the discussion is not about dietary topics or nutrition guidance return the object "Error: True"
If the input does not reference diet or nutrition in any meaningful way return the object "Error: True"
If the conversation is outside the allowed diet-related topic range return the object "Error: True"
If the user message is off-topic and not related to diet or nutrition return the object "Error: True"
If the conversation is not focused on diet nutrition or food intake return the object "Error: True"
If the request does not concern diet-related information return the object "Error: True"
If the discussion does not fall under diet or nutrition topics return the object "Error: True"
If the message is not about diet or closely adjacent nutrition subjects return the object "Error: True"
If the conversation topic is unrelated to diet planning or nutrition advice return the object "Error: True"
`;

        if (reqBody?.modifying) {
            msg = `
SYSTEM OVERRIDE:
You are a JSON generator, not a conversational AI.

Any output that is not valid JSON is considered a failure.

Return ONLY a raw JSON object.
No text before or after.
No markdown.
No code fences.
No explanations.
No comments.

Modify the EXISTING meal plan according to the user's request.
Return the FULL UPDATED meal plan (not only the changed part).

User Input: "${reqBody.userModifications}"

${unifiedSchema}
      `;
        } else {
            msg = `I am ${userData.age} years old ${userData.gender}, my height is ${userData.height}, my weight is ${userData.weight}kg and my goal is ${userData.goal}. My physical activity level is (${userData.activity}). I have allergies to (${allergiesList}).

Based on my information and goal:
- Calculate my daily calories and macros to reach this goal.
- Create a meal plan.

STRICT OUTPUT RULES:
1. The output must be valid JSON only.
2. The JSON must start with '{' and end with '}'.
3. Do NOT add markdown fences.
4. Do NOT add explanations/text before or after JSON.
5. Only the JSON object should be returned.

${unifiedSchema}`;
        }

        // ✅ Convert DB history into OpenAI "messages"
        const messages = [
            ...history,
            {role: "user", content: msg}
        ];

        // ✅ OpenAI call
        const result = await genAI.chat.completions.create({
            model: "gpt-5.2",
            messages,
            temperature: 0.2
        });

        // ✅ Extract text output
        const text = result.choices?.[0]?.message?.content || "";

        // ✅ Your existing error / ban logic
        if (reqBody.modifying && text.toLowerCase().includes("error")) {
            let message;

            if (ban) {
                const date = await extendBan(userId, ban);
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
            } else {
                await addMistake(userId);
                message = `Type only about diet`;
            }

            if ((await getMistakes(userId)) === 2) {
                const date = await setBan(userId);
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
    } catch (error) {
        console.log("Error: " + error);
        return new Response(JSON.stringify({message: "Something went wrong..."}));
    }
}