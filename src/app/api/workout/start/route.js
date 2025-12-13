export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import {cookies} from "next/headers";
import {startWorkout, getUserDetails} from "../../../../utils/db-actions.js";
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

        const reqBody = await req?.json();
        const user = await getUserDetails(userId);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        if (reqBody?.day) {
            await startWorkout(userId, reqBody?.day);
        }

        return new Response(JSON.stringify({result: "Saved Successfully"}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Saving Error"}));
    }
}