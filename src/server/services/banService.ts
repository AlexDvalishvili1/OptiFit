export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {connectDB} from "@/server/db/connect";
import {findUserLeanById, updateUserById} from "@/server/repositories/userRepo";

type Ban = { date: Date; minutes: number };

export async function setBan(id: string) {
    await connectDB();
    const date = new Date();
    const minutes = 5;
    date.setMinutes(date.getMinutes() + minutes);
    await updateUserById(id, {$set: {ban: {date, minutes}}});
    return date;
}

export async function extendBan(id: string, ban: Ban) {
    await connectDB();
    const newDate = new Date();
    const minutes = ban.minutes * 2;
    newDate.setMinutes(ban.date.getMinutes() + minutes); // keep exact logic
    await updateUserById(id, {$set: {"ban.date": newDate, "ban.minutes": minutes}}, {new: true});
    return newDate;
}

export async function clearBan(id: string) {
    await connectDB();
    await updateUserById(id, {$set: {ban: null}}, {new: true});
}

export async function addMistake(id: string) {
    await connectDB();
    await updateUserById(id, {$inc: {mistakes: 1}}, {new: true});
}

export async function getMistakes(id: string) {
    await connectDB();
    const user = (await findUserLeanById(id)) as { mistakes?: number } | null;
    return user?.mistakes ?? 0;
}

export async function clearMistakes(id: string) {
    await connectDB();
    await updateUserById(id, {$set: {mistakes: 0}}, {new: true});
}