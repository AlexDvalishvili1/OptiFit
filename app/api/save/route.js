export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import {updateUser} from "../../../actions/db-actions";
import {calculateAge} from "../../../actions/db-actions";
import {getServerSession} from "next-auth/next";
import {authOptions} from "../../authOptions";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const reqBody = await req.json();

        if (await calculateAge(reqBody.dob) < 12) {
            return new Response(JSON.stringify({
                error: {path: ["dob"], message: "Age must be at least 12 years old."}
            }));
        }

        const data = {
            gender: reqBody.gender,
            dob: reqBody.dob,
            height: reqBody.height,
            weight: reqBody.weight,
            activity: reqBody.activity,
            goal: reqBody.goal,
            allergies: reqBody.allergies,
            advanced: true,
        }

        await updateUser(session?.user?.id, data)
            .catch(error => {
                console.error("Error updating user:", error);
            });

        return new Response(JSON.stringify({message: "Successfully Updated"}));
    } catch (error) {
        return new Response(JSON.stringify({error: {path: ["error"], message: "Update Failed"}}));
    }
}
