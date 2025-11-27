export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import {
    addMistake, addTrainingAiMessage, addTrainingUserMessage,
    calculateAge, clearBan, clearMistakes, extendBan,
    getBan,
    getGoal, getMistakes, getProgramChatHistory,
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

        if (!session?.user?.id) {
            return new Response(JSON.stringify({error: `Session error`}), {status: 400});
        }

        const reqBody = await req?.json();
        const userPromise = getUserDetails(session.user.id);
        const banPromise = getBan(session.user.id);

        let [user, ban] = await Promise.all([userPromise, banPromise]);

        if (ban?.date > new Date()) {
            const banDate = new Date(ban.date);
            return new Response(JSON.stringify({error: `You are banned until ${banDate.toDateString()} ${banDate.toLocaleTimeString()}`}), {status: 403});
        }

        if (reqBody.regenerate) {
            const previousGenerating = user?.training[0]?.date;
            if (previousGenerating) {
                const givenDate = new Date(previousGenerating);
                const fiveMinutesLater = new Date(givenDate.getTime() + 5 * 60000);
                const now = new Date();
                if (now < fiveMinutesLater) {
                    return new Response(JSON.stringify({error: `Regenerating is available once every five minute. You must wait until ${fiveMinutesLater.toDateString()} ${fiveMinutesLater.toLocaleTimeString()}`}), {status: 429});
                }
            }
        }

        const userData = {
            gender: user.gender ? "male" : "female",
            age: await calculateAge(user.dob),
            goal: getGoal(user.goal),
        };

        const history = await getProgramChatHistory(reqBody, session.user.id);

        let msg;
        if (reqBody?.userModifications) {
            msg = `Hi AI, Please follow these Instructions for Processing User Messages Related to Plan Modifications:

            Training Plan-Related Messages:
            
            Explicit Modification Requests:
            
            Action: Modify the plan and return the full updated workout plan.
            
            Examples:
            
            "I don't have machines and dumbbells. Change to home workout."
            "Change my Tuesday plan."
            "I need a new workout plan."
            "Can you update my Sunday options?"
            Implicit Cues about Unavailable Items:
            
            Action: Modify the plan to exclude the mentioned item and include a suitable alternative. Return the full updated training plan.
            
            Examples:
            
            "I don't have an incline bench press machine in the gym."
            "I'm out of leg press."
            "All cables for exercise are busy or not available."
            Implicit Cues about Scheduling Conflicts:
            
            Action: Modify the plan to adjust for the scheduling conflict. Ensure all muscle groups are still covered by redistributing the workouts. All days should be present in the plan, with rest days as needed. Return the full updated training plan without any explanatory text.
            
            Examples:
            
            "I have no time on Monday," (redistribute the workout to another day and ensure all other workouts are still covered. Keep Monday as a rest day).
            "I'm busy on Thursday evening," (adjust the plan to fit their schedule while maintaining the overall workout balance).
            "I can only work out in the mornings," (adjust the plan to fit morning workouts and redistribute as needed).
            "No Friday" (redistribute the workout to another day and ensure all other workouts are still covered).
            Medical Conditions or Special Requirements:
            
            Action: Modify the plan to accommodate the user's medical condition or special requirement. Return the full updated training plan.
            
            Examples:
            
            "I have scoliosis." (modify the plan to include safe exercises for scoliosis and avoid exercises that might exacerbate the condition).
            "I need exercises for scoliosis." (provide exercises tailored for scoliosis without additional questions).
            "I have a knee injury." (adjust the plan to avoid exercises that put strain on the knees).
            Non-Plan Related Messages:
            
            Action: Return an error message.
            
            Examples:
            
            "Hello."
            "Thank you."
            "What's the weather today?"
            "Cool."
            Error Message Example:
            "Error: Please provide a plan-related request."
            
            Handling Nonsensical or Unrelated Inputs:
            
            Action: Return an error message.
            
            Examples:
            
            "safasfsaasg"
            "dasf'sal''lpls[pakfs"
            Error Message Example:
            "Error: Please provide a plan-related request."
            
            Sample Interaction Flow:
            
            User: "There is no bench press machine."
            AI: [Updated Workout Plan]
            
            User: "Change my Friday plan."
            AI: [Updated Workout Plan]
            
            User: "Hello."
            AI: "Error: Please provide a plan-related request."
            
            User: "Thank you."
            AI: "Error: Please provide a plan-related request."
            
            User: "Cool."
            AI: "Error: Please provide a plan-related request."
            
            User: "I have no time on Monday."
            AI: [Updated Workout Plan]
            
            User: "No Friday."
            AI: [Updated Workout Plan]
            
            User: "I have scoliosis."
            AI: [Updated Workout Plan tailored for scoliosis]

            **ATTENTION! This is user Input that you need to process: "${reqBody.userModifications}"`;
        } else {
            msg = `
            Generate a FULL 7-day weekly gym training program in pure JSON format for a ${userData.age}-year-old ${userData.gender} with the goal of ${userData.goal}.

===========================
STRICT OUTPUT RULES (READ CAREFULLY)
===========================
1. OUTPUT MUST BE VALID JSON ONLY.
2. OUTPUT MUST START WITH '[' AND END WITH ']'.
3. DO NOT include markdown fences like \`\`\`json or \`\`\` anywhere.
4. DO NOT include explanations, comments, natural language, or any text outside the JSON.
5. All strings must use ONLY valid JSON escapes: \n, \", \\, \t, \b, \f, \r.
6. DO NOT include any invalid escape sequences such as \s, \P, \q, \_, or any unsupported sequences.
7. DO NOT include emoji or non-ASCII characters.
8. URLs MUST contain NO spaces.
9. Strings MUST NOT contain unescaped quotes.
10. The JSON MUST parse with JSON.parse() WITHOUT any cleaning or preprocessing.

===========================
REQUIRED JSON STRUCTURE
===========================
[
  {
    "day": "Day name",
    "rest": true or false,
    "muscles": "Targeted muscle groups",
    "exercises": [
      {
        "name": "Exercise name",
        "sets": "number as string",
        "reps": "string",
        "instructions": "Use ONLY '\\n' for line breaks. No other escape sequences.",
        "video": "Valid URL string"
      }
    ]
  }
]

===========================
ADDITIONAL RULES
===========================
- Provide EXACTLY 7 objects (Monday through Sunday).
- For rest days: "rest": true and "exercises": [].
- For training days: "rest": false.
- All exercise instructions MUST NOT contain unescaped backslashes.
- If a literal backslash is needed, escape it as "\\\\".
- No empty strings for "muscles"—use a meaningful description or set it to "Rest".

===========================
SHORT VALID EXAMPLE (FOLLOW THIS SHAPE)
===========================
[
  {
    "day": "Monday",
    "rest": false,
    "muscles": "Chest, Triceps",
    "exercises": [
      {
        "name": "Barbell Bench Press",
        "sets": "3",
        "reps": "8-12",
        "instructions": "Lie on a weight bench with feet flat on the floor.\\nGrip the barbell with an overhand grip.\\nLower the barbell to your chest.\\nPress the barbell back up.\\nMaintain core tightness and control.",
        "video": "https://youtu.be/o9x41-xQ51Y"
      },
      {
        "name": "Incline Dumbbell Press",
        "sets": "3",
        "reps": "8-12",
        "instructions": "Sit on an incline bench.\\nHold dumbbells at chest level.\\nPress the dumbbells upward.\\nLower with control.\\nKeep your back flat.",
        "video": "https://youtu.be/7b_H22k6t0c"
      }
    ]
  },
  {
    "day": "Tuesday",
    "rest": false,
    "muscles": "Legs",
    "exercises": [
      {
        "name": "Squats",
        "sets": "3",
        "reps": "8-12",
        "instructions": "Stand with feet shoulder-width apart.\\nSquat down while keeping your core tight.\\nReturn to standing by pushing through your heels.",
        "video": "https://youtu.be/Uja_w8g9N5w"
      }
    ]
  },
  {
    "day": "Wednesday",
    "rest": true,
    "muscles": "Rest",
    "exercises": []
  }
]
===========================
FINAL REMINDER
===========================
RETURN ONLY PURE JSON. NO EXTRA CHARACTERS. NO MARKDOWN.
            `}

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                ...history,
                { role: "user", parts: [{ text: msg }] }
            ]
        });

        const text = result.text;


        console.log(text)

        if (text.toLowerCase().includes("error")) {
            let message;
            if (ban) {
                const date = await extendBan(session.user.id, ban);
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
            } else {
                await addMistake(session.user.id);
                message = `Type only about training plan`;
            }
            if (await getMistakes(session.user.id) === 2) {
                const date = await setBan(session.user.id);
                message = `You got banned until ${date.toDateString()} ${date.toLocaleTimeString()}`;
                await clearMistakes(session.user.id);
            }
            return new Response(JSON.stringify({error: message}), {status: 400});
        }

        const program = JSON.parse(text);
        await Promise.all([
            clearMistakes(session.user.id),
            clearBan(session.user.id),
            addTrainingUserMessage(session.user.id, msg),
            addTrainingAiMessage(session.user.id, text)
        ]);

        return new Response(JSON.stringify({result: [program]}));
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({error: "Something went wrong..."}), {status: 500});
    }
}
