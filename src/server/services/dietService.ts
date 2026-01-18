import {connectDB} from "@/server/db/connect";
import {findUserLeanById, updateUserById} from "@/server/repositories/userRepo";

type Role = "system" | "user" | "assistant";
export type HistoryMessage = { role: Role; content: string };

type DietDay = { date: Date; history: HistoryMessage[] };

const SYSTEM_SEED: HistoryMessage = {
    role: "system",
    content: `
You are Diet JSON Generator.

CRITICAL OUTPUT CONTRACT:
- Output MUST be a single valid JSON object and NOTHING ELSE.
- No markdown. No code fences. No prose. No explanations. No comments.
- The response MUST start with "{" and end with "}".
- All numbers MUST be JSON numbers (no "g", "kcal", strings).

If the user's message is NOT about diet / nutrition / meal planning, return EXACTLY:
{"error": true}

REQUIRED JSON SCHEMA (must match exactly):
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

STRICT RULES:
- Always include ALL top-level totals: calories, protein, fat, carbohydrates.
- Always include meals (array) with at least 3 meals (Breakfast/Lunch/Dinner). You may add snacks.
- Every meal MUST have: name, time, foods.
- Every food MUST have: name, serving, calories, protein, fat, carbohydrates.
- Use 24h time "HH:MM".
- Meals and foods must be realistic, consistent with the totals.
- No additional top-level keys.`,
};

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export async function getChatHistory(date: Date, user: { diets?: DietDay[]; _id: unknown }) {
    const diets = user?.diets ?? [];
    const day = diets.find((d) => isSameDay(date, d.date));
    if (day?.history?.length) return day.history;

    const newHistory: HistoryMessage[] = [SYSTEM_SEED];
    const newDay: DietDay = {date, history: newHistory};

    await connectDB();
    await updateUserById(String(user._id), {$push: {diets: newDay}});
    return newHistory;
}

export async function addUserMessage(date: Date, id: string, message: string) {
    await connectDB();
    const user = (await findUserLeanById(id)) as { diets?: DietDay[] } | null;
    const diets = user?.diets ?? [];
    const today = diets.findIndex((d) => isSameDay(date, d.date));
    if (today < 0) return;

    const path = `diets.${today}.history`;
    await updateUserById(id, {$push: {[path]: {role: "user", content: message}}}, {new: true, upsert: false});
}

export async function addAiMessage(date: Date, id: string, message: string) {
    await connectDB();
    const user = (await findUserLeanById(id)) as { diets?: DietDay[] } | null;
    const diets = user?.diets ?? [];
    const today = diets.findIndex((d) => isSameDay(date, d.date));
    if (today < 0) return;

    const path = `diets.${today}.history`;
    await updateUserById(id, {$push: {[path]: {role: "assistant", content: message}}}, {new: true, upsert: false});
}