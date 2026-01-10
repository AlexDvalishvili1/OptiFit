import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {cookies} from "next/headers";
import {connectDB} from "@/server/db/connect";
import {User, type UserDoc} from "@/server/models/User";
import {verifyToken, signToken} from "@/lib/auth/jwt";

type TokenPayload = { sub: string; [key: string]: unknown };

type ProfilePatchBody = {
    name?: unknown;
    email?: unknown;
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
    email?: string;
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
        if (typeof data.email === "string") update.email = data.email.trim().toLowerCase();

        if (data.gender === "male" || data.gender === "female") update.gender = data.gender;

        if (data.dob === null) update.dob = undefined;
        if (typeof data.dob === "string" && data.dob) update.dob = new Date(data.dob);

        if (data.height === null) update.height = undefined;
        if (typeof data.height === "number" && data.height > 0) update.height = data.height;

        if (data.weight === null) update.weight = undefined;
        if (typeof data.weight === "number" && data.weight > 0) update.weight = data.weight;

        if (typeof data.activity === "string") update.activity = data.activity;
        if (typeof data.goal === "string") update.goal = data.goal;

        if (Array.isArray(data.allergies)) update.allergies = data.allergies;

        update.advanced = true;

        const user: UserDoc | null = await User.findById(userId);
        if (!user) return NextResponse.json({error: "User not found"}, {status: 404});

        Object.assign(user, update);
        await user.save();

        // user._id and user.email are now properly typed
        const newToken = await signToken({
            sub: user._id.toString(),
            email: user.email,
            onboarded: !!user.advanced,
        });

        const res = NextResponse.json(
            {
                success: true,
                user: {
                    id: user._id.toString(),
                    name: user.name ?? null,
                    email: user.email,
                    phone: user.phone,
                    gender: (user.gender as "male" | "female" | undefined) ?? null, // schema currently has gender: String
                    dob: user.dob instanceof Date ? user.dob.toISOString() : null,
                    height: typeof user.height === "number" ? user.height : null,
                    weight: typeof user.weight === "number" ? user.weight : null,
                    activity: user.activity ?? null,
                    goal: user.goal ?? null,
                    allergies: user.allergies ?? [],
                    advanced: !!user.advanced,
                },
            },
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