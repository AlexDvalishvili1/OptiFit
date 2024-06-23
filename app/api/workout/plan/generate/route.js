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
import {GoogleGenerativeAI} from "@google/generative-ai";
import {authOptions} from "@/app/authOptions";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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

        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
        const history = await getProgramChatHistory(reqBody, session.user.id);
        const chat = model.startChat({ history: history });

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
            msg = `Create a gym training program in JSON format for a ${userData.age} years old ${userData.gender} with the goal of ${userData.goal}. The program should include a full week's plan with resistance and cardio exercises, specifying targeted muscle groups each day and rest days. Use this structure:
[
    {
        "day": "Day of the week",
        "rest": true / false,
        "muscles": "Targeted muscle groups",
        "exercises": [
            {
                "name": "Exercise name",
                "sets": "Number of sets as string",
                "reps": "Repetition range as string",
                "instructions": "Step-by-step instructions for the exercise, including form, breathing, and common mistakes to avoid",
                "video": "Shortest tutorial video link"
            }
        ]
    }
]
Keep instructions concise. Add step-by-step instructions without break lines, only using '\\n' after each step. ATTENTION!!! RETURN ONLY JSON FORMAT WITHOUT ANY JSON OR OTHER TAGS AND TEXT`;
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
