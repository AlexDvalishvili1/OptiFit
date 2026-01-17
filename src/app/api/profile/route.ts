export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {cookies} from "next/headers";
import {connectDB} from "@/server/db/connect";
import {User, type UserDoc} from "@/server/models/User";
import {verifyToken, signToken} from "@/lib/auth/jwt";
import {normalizeActivity, normalizeGoal} from "@/lib/fitness/normalize";

type TokenPayload = { sub: string; [key: string]: unknown };

type ProfilePatchBody = {
    name?: unknown;
    gender?: unknown;
    dob?: unknown;
    height?: unknown;
    weight?: unknown;
    activity?: unknown;
    goal?: unknown;
    allergies?: unknown;
};

type UserUpdate = {
    name?: string;
    gender?: "male" | "female";
    dob?: Date | undefined;
    height?: number | undefined;
    weight?: number | undefined;
    activity?: string;
    goal?: string;
    allergies?: unknown[];
    advanced?: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

async function getUserIdFromCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = (await verifyToken(token)) as TokenPayload;
    return typeof payload?.sub === "string" ? payload.sub : null;
}

function toProfileResponse(user: UserDoc) {
    return {
        id: user._id.toString(),
        name: user.name ?? null,
        phone: user.phone,
        gender: (user.gender as "male" | "female" | undefined) ?? null,
        dob: user.dob instanceof Date ? user.dob.toISOString() : null,
        height: typeof user.height === "number" ? user.height : null,
        weight: typeof user.weight === "number" ? user.weight : null,
        activity: normalizeActivity(user.activity) ?? null,
        goal: normalizeGoal(user.goal) ?? null,
        allergies: Array.isArray(user.allergies) ? user.allergies : [],
        advanced: !!user.advanced,
    };
}

export async function GET() {
    try {
        const userId = await getUserIdFromCookie();
        if (!userId) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        await connectDB();

        const user = await User.findById(userId).select(
            "_id name phone advanced gender dob height weight activity goal allergies"
        );

        if (!user) return NextResponse.json({error: "User not found"}, {status: 404});

        // Always return FULL canonical profile data
        return NextResponse.json({user: toProfileResponse(user)}, {status: 200});
    } catch (err) {
        console.error("Profile GET error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const payload = (await verifyToken(token)) as TokenPayload;
        const userId = payload.sub;

        const raw = await req.json();
        const data: ProfilePatchBody = isRecord(raw) ? raw : {};

        await connectDB();

        const update: UserUpdate = {};

        if (typeof data.name === "string") update.name = data.name.trim();

        if (data.gender === "male" || data.gender === "female") update.gender = data.gender;

        if (data.dob === null) update.dob = undefined;
        if (typeof data.dob === "string" && data.dob) update.dob = new Date(data.dob);

        if (data.height === null) update.height = undefined;
        if (typeof data.height === "number" && data.height > 0) update.height = data.height;

        if (data.weight === null) update.weight = undefined;
        if (typeof data.weight === "number" && data.weight > 0) update.weight = data.weight;

        if (typeof data.activity === "string") {
            const a = normalizeActivity(data.activity);
            if (a) update.activity = a;
        }
        if (typeof data.goal === "string") {
            const g = normalizeGoal(data.goal);
            if (g) update.goal = g;
        }

        if (Array.isArray(data.allergies)) update.allergies = data.allergies;

        update.advanced = true;

        const user: UserDoc | null = await User.findById(userId);
        if (!user) return NextResponse.json({error: "User not found"}, {status: 404});

        Object.assign(user, update);
        await user.save();

        const newToken = await signToken({
            sub: user._id.toString(),
            phone: user.phone,
            onboarded: !!user.advanced,
        });

        const res = NextResponse.json(
            {success: true, user: toProfileResponse(user)},
            {status: 200}
        );

        res.cookies.set("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });

        return res;
    } catch (err: unknown) {
        console.error("Profile update error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}