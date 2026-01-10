export const maxDuration = 60;
export const dynamic = "force-dynamic";

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env");
const uri: string = MONGODB_URI;

const cached = global.mongoose || (global.mongoose = {conn: null, promise: null});

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}