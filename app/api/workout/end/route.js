export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getServerSession} from "next-auth/next";
import {endWorkout, getUserDetails} from "@/actions/db-actions";
import {authOptions} from "@/app/authOptions";


export async function POST(req) {
    try {
        const reqBody = await req?.json();
        const session = await getServerSession(authOptions);
        const user = await getUserDetails(session?.user?.id);


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

        await endWorkout(session?.user?.id, reqBody?.day, reqBody?.timer);

        return new Response(JSON.stringify({result: "Saved Successfully"}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Saving Error"}));
    }
}