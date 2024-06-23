export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getServerSession} from "next-auth/next";
import {getUserDetails} from "@/actions/db-actions";
import {authOptions} from "@/app/authOptions";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        const user = await getUserDetails(session?.user?.id);

        if (!user) {
            return new Response(JSON.stringify({error: "Session error"}));
        }

        const diets = user?.diets;
        const dietsDates = [];
        diets.map((day) => {
            dietsDates.push(
                new Date(day.date).getFullYear() === new Date().getFullYear() && new Date(day.date).getMonth() === new Date().getMonth() && new Date(day.date).getDate() === new Date().getDate() ?
                    "Today" : day.date.toISOString().split('T')[0]
            );
        });

        if (dietsDates) {
            dietsDates.reverse();
            return new Response(JSON.stringify({result: dietsDates}));
        }

        return new Response(JSON.stringify({result: null}));
    } catch (error) {
        return new Response(JSON.stringify({error: "Getting user data failed"}));
    }
}