import {NextResponse} from "next/server";
import {connectDB} from "../../../lib/db.ts";
import {User} from "../../../models/User.ts";
import {verifyToken} from "../../../lib/auth/jwt.ts";
import {cookies} from "next/headers";

function isAdvancedReady(data) {
    return !!(
        data?.dob &&
        typeof data?.height === "number" &&
        data.height > 0 &&
        typeof data?.weight === "number" &&
        data.weight > 0 &&
        data?.activity &&
        data?.goal
    );
}

export async function PATCH(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const payload = await verifyToken(token);
        const userId = payload.sub;

        const data = await req.json();
        await connectDB();

        // build update safely (don’t write undefined)
        const update = {};

        if (typeof data?.name === "string") update.name = data.name.trim();
        if (typeof data?.email === "string") update.email = data.email.trim().toLowerCase();

        if (data?.gender === "male" || data?.gender === "female") update.gender = data.gender;

        if (data?.dob === null) update.dob = undefined;
        if (typeof data?.dob === "string" && data.dob) update.dob = new Date(data.dob);

        // allow null to mean "empty"
        if (data?.height === null) update.height = undefined;
        if (typeof data?.height === "number" && data.height > 0) update.height = data.height;

        if (data?.weight === null) update.weight = undefined;
        if (typeof data?.weight === "number" && data.weight > 0) update.weight = data.weight;

        if (typeof data?.activity === "string") update.activity = data.activity;
        if (typeof data?.goal === "string") update.goal = data.goal;

        if (Array.isArray(data?.allergies)) update.allergies = data.allergies;

        update.advanced = true;

        const user = await User.findById(userId);

        Object.assign(user, update);

        await user.save();

        return NextResponse.json(JSON.stringify({success: true}), {status: 200});
    } catch (err) {
        console.error("Profile update error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}