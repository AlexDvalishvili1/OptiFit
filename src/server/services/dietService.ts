import {connectDB} from "@/server/db/connect";
import {findUserLeanById, updateUserById} from "@/server/repositories/userRepo";

type Role = "system" | "user" | "assistant";
export type HistoryMessage = { role: Role; content: string };

type DietDay = { date: Date; history: HistoryMessage[] };

const SYSTEM_SEED: HistoryMessage = {
    role: "system",
    content: "Follow the user's instructions exactly. If they require JSON-only output, return JSON only.",
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
    await updateUserById(id, {$push: {[path]: {role: "system", content: message}}}, {new: true, upsert: false});
}