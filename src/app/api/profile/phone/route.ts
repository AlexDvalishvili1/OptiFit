export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {cookies} from "next/headers";

import {connectDB} from "@/server/db/connect";
import {User, type UserDoc} from "@/server/models/User";
import {verifyToken, signToken} from "@/lib/auth/jwt";
import {firebaseAdminAuth} from "@/server/firebase/admin";
import {normalizePhoneE164} from "@/lib/pages/register/phone/normalize";

type TokenPayload = { sub: string; [key: string]: unknown };

type Body = {
    newPhone?: unknown;
    firebaseIdTokenCurrent?: unknown;
    firebaseIdTokenNew?: unknown;
};

function toStr(v: unknown): string {
    return typeof v === "string" ? v : "";
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const payload = (await verifyToken(token)) as TokenPayload;
        const userId = payload.sub;

        const raw = (await req.json().catch(() => ({}))) as Body;
        const newPhone = normalizePhoneE164(toStr(raw.newPhone).trim());
        const firebaseIdTokenCurrent = toStr(raw.firebaseIdTokenCurrent).trim();
        const firebaseIdTokenNew = toStr(raw.firebaseIdTokenNew).trim();

        if (!newPhone || !firebaseIdTokenCurrent || !firebaseIdTokenNew) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400});
        }

        await connectDB();

        const user: UserDoc | null = await User.findById(userId);
        if (!user) return NextResponse.json({error: "User not found"}, {status: 404});

        const decodedCurrent = await firebaseAdminAuth.verifyIdToken(firebaseIdTokenCurrent, true);
        const decodedNew = await firebaseAdminAuth.verifyIdToken(firebaseIdTokenNew, true);

        const verifiedCurrent = normalizePhoneE164(String((decodedCurrent).phone_number || "").trim());
        const verifiedNew = normalizePhoneE164(String((decodedNew).phone_number || "").trim());

        if (!verifiedCurrent || !verifiedNew) {
            return NextResponse.json({error: "Phone verification failed"}, {status: 400});
        }

        const dbPhone = normalizePhoneE164(String(user.phone || "").trim());
        if (verifiedCurrent !== dbPhone) {
            return NextResponse.json({error: "Current phone does not match"}, {status: 403});
        }

        if (verifiedNew !== newPhone) {
            return NextResponse.json({error: "New phone verification mismatch"}, {status: 400});
        }

        const existing = await User.findOne({phone: newPhone}).select("_id");
        if (existing && existing._id.toString() !== user._id.toString()) {
            return NextResponse.json({error: "Phone already in use"}, {status: 409});
        }

        user.phone = newPhone;
        await user.save();

        const newJwt = await signToken({sub: user._id.toString(), phone: user.phone, onboarded: !!user.advanced});
        const res = NextResponse.json({success: true, phone: user.phone}, {status: 200});

        res.cookies.set("token", newJwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });

        return res;
    } catch (err) {
        console.error("Phone change error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}