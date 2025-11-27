export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {
    addAiMessage, addMistake,
    addUserMessage,
    calculateAge, clearBan, clearMistakes, extendBan, getActivity,
    getBan,
    getChatHistory, getGoal, getMistakes,
    getUserDetails, setBan
} from "@/actions/db-actions";
import {getServerSession} from "next-auth/next";
import { GoogleGenAI } from "@google/genai";
import {authOptions} from "@/app/authOptions";

const genAI =  new GoogleGenAI({
    apiKey: process.env.API_KEY
});

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        const reqBody = await req?.json();
        let user;
        let ban;

        if (!session?.user?.id) {
            return new Response(JSON.stringify({error: `Session error`}));
        }

        user = await getUserDetails(session.user.id);
        ban = await getBan(session.user.id);

        if (ban?.date > new Date()) {
            const banDate = new Date(ban.date);
            return new Response(JSON.stringify({error: `You are banned until ${banDate.toDateString()} ${banDate.toLocaleTimeString()}`}));
        }

        const userData = {
            gender: user.gender ? "male" : "female",
            age: await calculateAge(user.dob),
            height: user.height,
            weight: user.weight,
            activity: getActivity(user.activity),
            goal: getGoal(user.goal),
            allergies: user.allergies,
        }
        let allergiesList = "";
        userData.allergies.length !== 0 ? userData.allergies.map((allergy) => allergiesList += allergy.title + ",") : allergiesList = "empty";
        const today = new Date();
        const history = await getChatHistory(today, session.user.id);

        let msg;
        if (reqBody?.userModifications) {
            msg = `Hi AI, Please follow these rules for processing user messages related to diet modifications:

            1. Diet-Related Messages:
                Explicit Modification Requests:
                - Action: Modify the diet and return the full updated diet plan in JSON format.
                - Examples:
                    "Change my breakfast plan."
                    "I need a new meal plan."
                    "Can you update my dinner options?"

                Implicit Cues about Unavailable Items:
                - Action: Modify the diet to exclude the mentioned item and include a suitable alternative. Return the full updated diet plan in JSON format.
                - Examples:
                    "I don't have Greek yogurt."
                    "I'm out of chicken."
                    "No bananas left."
                    "I don't have a protein shake."

            2. Non-Diet Related Messages:
                - Action: Return an error message in plain text.
                - Examples:
                    "Hello."
                    "Thank you."
                    "What's the weather today?"
                    "Cool."
                - Error Message Example:
                    Error: Please provide a diet-related request.

            Sample Interaction Flow:
            User: "I don't have Greek yogurt."
            AI: [Updated Diet Plan in JSON]

            User: "Change my lunch plan."
            AI: [Updated Diet Plan in JSON]

            User: "Oh no, I have Greek yogurt."
            AI: [Original Diet Plan in JSON]

            User: "Hello."
            AI: Error: Please provide a diet-related request.

            User: "Thank you."
            AI: Error: Please provide a diet-related request.

            User: "Cool."
            AI: Error: Please provide a diet-related request.

            User Input: "${reqBody.userModifications}"

            JSON Structure for Meal Plan:
            {
                "calories": "Total daily calories (integer or float)",
                "protein": "Total daily protein intake (string with unit)",
                "fat": "Total daily fat intake (string with unit)",
                "carbohydrates": "Total daily carbohydrate intake (string with unit)",
                "meals": [
                    {
                        "name": "Meal name (string)",
                        "foods": [
                            {
                                "name": "Food name (string)",
                                "serving": "Serving size (string)",
                                "calories": "Calories per serving (integer or float)",
                                "protein": "Protein per serving (string with unit)",
                                "fat": "Fat per serving (string with unit)",
                                "carbohydrates": "Carbohydrates per serving (string with unit)"
                            },
                            {
                                "name": "Another food name (string)",
                                "serving": "Another serving size (string)",
                                "calories": "Calories per serving (integer or float)",
                                "protein": "Protein per serving (string with unit)",
                                "fat": "Fat per serving (string with unit)",
                                "carbohydrates": "Carbohydrates per serving (string with unit)"
                            }
                        ]
                    },
                    {
                        "name": "Next meal name (string)",
                        "foods": [
                            {
                                "name": "Food name (string)",
                                "serving": "Serving size (string)",
                                "calories": "Calories per serving (integer or float)",
                                "protein": "Protein per serving (string with unit)",
                                "fat": "Fat per serving (string with unit)",
                                "carbohydrates": "Carbohydrates per serving (string with unit)"
                            }
                        ]
                    }
                ]
            }
`;
        } else {
            msg = `I am ${userData.age} years old ${userData.gender}, my height is ${userData.height}, my weight is ${userData.weight}kg and my goal is ${userData.goal}. My physical activity level is (${userData.activity}). I have allergies to (${allergiesList}).

Based on my information and goal:
- Calculate my daily protein, fat, and carbohydrate needs to reach this goal.
- Create a meal plan.

STRICT OUTPUT RULES:
1. The output must be **valid JSON only**.
2. The JSON must start directly with '{' and end with '}'.
3. Do NOT add markdown fences like \`\`\`json or \`\`\`.
4. Do NOT add explanations, text, comments, or natural language before or after the JSON.
5. Only the JSON object should be returned.

❌ Incorrect Example (NOT allowed):
\`\`\`json
{ "calories": "2700", "protein": "150g", ... }
\`\`\`

✅ Correct Example (allowed):
{
  "calories": "2700",
  "protein": "150g",
  "fat": "80g",
  "carbohydrates": "350g",
  "meals": [
    {
      "name": "Breakfast",
      "foods": [
        {
          "name": "Oats",
          "serving": "100g",
          "calories": 389,
          "protein": "13g",
          "fat": "7g",
          "carbohydrates": "68g"
        }
      ]
    }
  ]
}

JSON Structure you must follow:
{
  "calories": "Total daily calories (string, integer or float)",
  "protein": "Total daily protein intake (string with unit)",
  "fat": "Total daily fat intake (string with unit)",
  "carbohydrates": "Total daily carbohydrate intake (string with unit)",
  "meals": [
    {
      "name": "Meal name (string)",
      "foods": [
        {
          "name": "Food name (string)",
          "serving": "Serving size (string)",
          "calories": Number (integer or float, no quotes),
          "protein": "Protein per serving (string with unit)",
          "fat": "Fat per serving (string with unit)",
          "carbohydrates": "Carbohydrates per serving (string with unit)"
        }
      ]
    }
  ]
}`;
        }
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                ...history,
                { role: "user", parts: [{ text: msg }] }
            ]
        });

        const text = result.text;

        if (text.toLowerCase().includes("error")) {
            let message;
            if (ban) {
                const date = await extendBan(session.user.id, ban);
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
            } else {
                await addMistake(session.user.id);
                message = `Type only about diet`;
            }
            if (await getMistakes(session.user.id) === 2) {
                const date = await setBan(session.user.id);
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
                await clearMistakes(session.user.id);
            }
            return new Response(JSON.stringify({error: message}));
        }
        await clearMistakes(session.user.id);
        await clearBan(session.user.id);
        await addUserMessage(today, session.user.id, msg);
        await addAiMessage(today, session.user.id, text);

        return new Response(JSON.stringify({result: text}));
    } catch (error) {
        console.log("Error: " + error)
        return new Response(JSON.stringify({message: "Something went wrong..."}));
    }
}