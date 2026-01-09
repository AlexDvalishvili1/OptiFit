import {User} from "@/server/models/User";

export async function findUserLeanById(id: string) {
    return User.findById(id).lean();
}

export async function updateUserById(id: string, update: unknown, options?: unknown) {
    return User.findByIdAndUpdate(id, update, options);
}