export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getServerSession} from "next-auth/next";
import {authOptions} from "../../../../authOptions";
import {getUserDetails} from "../../../../../actions/db-actions";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        const user = await getUserDetails(session?.user?.id);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        let plan
        if (user?.training) {
            plan = user?.training[0]?.plan;
        }

        if (plan) {
            return new Response(JSON.stringify({result: plan}));
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Getting user data failed"}));
    }
}
