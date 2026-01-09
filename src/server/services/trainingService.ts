import {connectDB} from "@/server/db/connect";
import {updateUserById} from "@/server/repositories/userRepo";

type Role = "system" | "user" | "assistant";
export type HistoryMessage = { role: Role; content: string };

type TrainingEntry = { history: HistoryMessage[]; plan: unknown[]; date?: Date };

const SYSTEM_SEED: HistoryMessage = {
    role: "system",
    content: "Follow the user's instructions exactly. If they require JSON-only output, return JSON only.",
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
        {$push: {"training.0.history": {role: "system", content: message}, "training.0.plan": program}},
        {new: true, upsert: false}
    );
}