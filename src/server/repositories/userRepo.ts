export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {User, type UserSchema} from "@/server/models/User";
import type {UpdateQuery, QueryOptions} from "mongoose";
import {connectDB} from "@/server/db/connect";

export async function findUserLeanById(id: string) {
    await connectDB();
    return User.findById(id).lean<UserSchema>();
}

export async function updateUserById(
    id: string,
    update: UpdateQuery<UserSchema>,
    options: QueryOptions<UserSchema> = {}
) {
    await connectDB();
    return User.findByIdAndUpdate(id, update, options);
}