import {User, type UserSchema} from "@/server/models/User";
import type {UpdateQuery, QueryOptions} from "mongoose";

export async function findUserLeanById(id: string) {
    return User.findById(id).lean<UserSchema>();
}

export async function updateUserById(
    id: string,
    update: UpdateQuery<UserSchema>,
    options: QueryOptions<UserSchema> = {}
) {
    return User.findByIdAndUpdate(id, update, options);
}