export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import {cookies} from "next/headers";
import {getUserDetails} from "../../../../utils/db-actions.js";
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

        const date = new Date(reqBody.date);
        const diets = user?.diets;
        let lastDiet;
        diets.map((day) => {
            if (date.getFullYear() === day.date.getFullYear() && date.getMonth() === day.date.getMonth() && date.getDate() === day.date.getDate()) {
                lastDiet = day.history[day.history.length - 1].content;
            }
        });

        if (lastDiet) {
            return new Response(JSON.stringify({result: lastDiet}));
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Getting user data failed"}));
    }
}