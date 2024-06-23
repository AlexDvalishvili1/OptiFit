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
import {GoogleGenerativeAI} from "@google/generative-ai";
import {authOptions} from "@/app/authOptions";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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
        const model = genAI.getGenerativeModel({model: "gemini-pro"});
        const history = await getChatHistory(today, session.user.id);
        const chat = model.startChat({
            history: history,
        });
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
            msg = `I am ${userData.age} years old ${userData.gender}, my height is ${userData.height}, my weight is ${userData.weight}kg and my goal is ${userData.goal}. My physical activity level is (${userData.goal}). I have allergies to (${allergiesList}). Based on my information and goal, calculate my daily protein, fat, and carbohydrate needs to reach this goal, and create a meal plan. Provide the meal plan in JSON format only, without any preceding JSON tags or additional text. Ensure that macros like calories, protein, fat, and carbohydrates are provided as exact numbers, not ranges (e.g., "2700" and not "2600-2800"). Use "g" as the unit for grams.

JSON Structure for Meal Plan:
{
  "calories": "Total daily calories (integer or float as string)",
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
        // Add more foods as necessary
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
        // Add more foods as necessary
      ]
    }
    // Add more meals as necessary
  ]
}
`;
        }
        const result = await chat.sendMessage(msg);
        const text = result.response.text();
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
        return new Response(JSON.stringify({message: "Something went wrong..."}));
    }
}