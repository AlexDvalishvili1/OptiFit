export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/authOptions";
import {getUserDetails} from "@/actions/db-actions";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        const user = await getUserDetails(session?.user?.id);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }
        const workouts = user?.workouts;
        if (workouts[workouts?.length - 1]?.active) {
            return new Response(JSON.stringify({
                result: {
                    date: workouts[workouts?.length - 1].date,
                    workout: workouts[workouts?.length - 1].workout
                }
            }));
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Getting user data failed"}));
    }
}
