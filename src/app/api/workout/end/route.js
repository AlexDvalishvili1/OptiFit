export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import {cookies} from "next/headers";
import {endWorkout, getUserDetails} from "../../../../utils/db-actions.js";
import {NextResponse} from "next/server";
import {verifyToken} from "../../../../lib/auth/jwt.ts";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Session Error"}, {status: 400});

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({error: "Session Error"}, {status: 400});
        }

        const userId = payload.sub;

        const user = await getUserDetails(userId);
        const reqBody = await req?.json();

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        if (reqBody?.day) {
            const exercises = reqBody.day.exercises;
            for (let exercise of exercises) {
                for (let set of exercise.data) {
                    const keys = Object.keys(set);
                    for (let value of keys) {
                        if (set[value].toString() === "" || isNaN(set[value]) || set[value] < 0) {
                            return new Response(JSON.stringify({error: "Invalid input"}));
                        }
                    }
                }
            }
        }

        await endWorkout(userId, reqBody?.day, reqBody?.timer);

        return new Response(JSON.stringify({result: "Saved Successfully"}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Saving Error"}));
    }
}