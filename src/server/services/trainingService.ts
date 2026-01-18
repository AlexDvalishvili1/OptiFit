export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {connectDB} from "@/server/db/connect";
import {updateUserById} from "@/server/repositories/userRepo";

type Role = "system" | "user" | "assistant";
export type HistoryMessage = { role: Role; content: string };

type TrainingEntry = { history: HistoryMessage[]; plan: unknown[]; date?: Date };

const SYSTEM_SEED: HistoryMessage = {
    role: "system",
    content: `
You are Workout Program JSON Generator.

CRITICAL OUTPUT CONTRACT:
- Output MUST be valid JSON and NOTHING ELSE.
- Output MUST be a JSON array that starts with "[" and ends with "]".
- No markdown, no prose, no headings, no comments, no code fences.
- Use ASCII only. No emojis.
- The response MUST be parsable by JSON.parse() without preprocessing.

If the user's message is NOT about workout/training plan generation or modification, return EXACTLY:
[{"error":true}]

REQUIRED STRUCTURE (DO NOT CHANGE KEYS):
[
  {
    "day": "Monday",
    "rest": false,
    "muscles": "Chest / Triceps",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": "3",
        "reps": "6-8",
        "instructions": "Concise cues. Use only \\\\n for line breaks.",
        "video": "https://www.youtube.com/watch?v=..."
      }
    ]
  }
]

STRUCTURAL RULES:
- Provide EXACTLY 7 objects in this exact order:
  Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
- Rest days MUST have: "rest": true, "muscles": "Rest", "exercises": [].
- Training days MUST have: "rest": false, and at least 2 exercises.
- "day" must be exactly one of: Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday.
- "sets" and "reps" are strings (as required by schema).
- "video" MUST start with "https://". No spaces.

QUALITY & SAFETY:
- Age-appropriate volume and intensity.
- Prefer compounds before isolations.
- Avoid unsafe or contradictory programming.
- Ensure weekly balance (push/pull/legs or similar) and recovery.

FINAL:
Return ONLY the JSON array.`,
};

export async function getProgramChatHistory(
    reqBody: { regenerate?: boolean; modifying?: boolean },
    user: { training?: TrainingEntry[]; _id: unknown }
) {
    const history = user?.training?.[0]?.history;

    const newHistory: HistoryMessage[] = [SYSTEM_SEED];
    const object: TrainingEntry = reqBody?.regenerate
        ? {history: newHistory, plan: [], date: new Date()}
        : {history: newHistory, plan: []};

    await connectDB();

    if (!reqBody?.modifying) {
        await updateUserById(String(user._id), {$unset: {training: ""}});
        await updateUserById(String(user._id), {$push: {training: object}});
    }

    return history ?? newHistory;
}

export async function addWorkoutUserMessage(id: string, message: string) {
    await connectDB();
    await updateUserById(id, {$push: {"training.0.history": {role: "user", content: message}}}, {
        new: true,
        upsert: false
    });
}

export async function addWorkoutAiMessage(id: string, message: string) {
    await connectDB();
    const program = JSON.parse(message) as unknown;

    await updateUserById(id, {$unset: {"training.0.plan": ""}});
    await updateUserById(
        id,
        {$push: {"training.0.history": {role: "assistant", content: message}, "training.0.plan": program}},
        {new: true, upsert: false}
    );
}