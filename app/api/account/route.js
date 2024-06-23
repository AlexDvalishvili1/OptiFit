export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getUserDetails} from "@/actions/db-actions";
import {getServerSession} from "next-auth/next";
import {authOptions} from "../../authOptions";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        const user = await getUserDetails(session?.user?.id);

        if (user?.advanced) {
            let data = {
                gender: user.gender ? 1 : 0,
                dob: user.dob,
                height: user.height,
                weight: user.weight,
                activity: user.activity,
                goal: user.goal,
                allergies: user.allergies
            }
            return new Response(JSON.stringify({result: data}));
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Getting user data failed"}));
    }
}
