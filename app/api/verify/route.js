export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {getUserDetails} from "@/actions/db-actions";

export async function POST(req) {
    try {
        const reqBody = await req.json();

        let user;
        if (reqBody.id) {
            user = await getUserDetails(reqBody.id);
        }

        if (reqBody?.training) {
            if (user?.training[0]) {
                return new Response(JSON.stringify({permission: true}));
            }
            return new Response(JSON.stringify({permission: false}));
        }

        if (user?.advanced) {
            return new Response(JSON.stringify({permission: true}));
        }
        return new Response(JSON.stringify({permission: false}));
    } catch (error) {
        return new Response(JSON.stringify({error: {path: ["error"], message: "Verification Failed"}}));
    }
}
