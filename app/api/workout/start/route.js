export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/authOptions";
import {startWorkout, getUserDetails} from "@/actions/db-actions";


export async function POST(req) {
    try {
        const reqBody = await req?.json();
        const session = await getServerSession(authOptions);
        const user = await getUserDetails(session?.user?.id);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        if (reqBody?.day) {
            await startWorkout(session?.user?.id, reqBody?.day);
        }

        return new Response(JSON.stringify({result: "Saved Successfully"}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Saving Error"}));
    }
}