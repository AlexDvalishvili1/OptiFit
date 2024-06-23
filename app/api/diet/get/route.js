export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getServerSession} from "next-auth/next";
import {getUserDetails} from "@/actions/db-actions";
import {authOptions} from "@/app/authOptions";


export async function POST(req) {
    try {
        const reqBody = await req?.json();
        const session = await getServerSession(authOptions);
        const user = await getUserDetails(session?.user?.id);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        const date = new Date(reqBody.date);
        const diets = user?.diets;
        let lastDiet;
        diets.map((day) => {
            if (date.getFullYear() === day.date.getFullYear() && date.getMonth() === day.date.getMonth() && date.getDate() === day.date.getDate()) {
                lastDiet = day.history[day.history.length - 1].parts[0].text;
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
