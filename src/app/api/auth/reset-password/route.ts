export const maxDuration = 60;
export const dynamic = "force-dynamic";

import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {firebaseAdminAuth} from "@/server/firebase/admin";
import {isProbablyE164, normalizePhoneE164} from "@/lib/pages/register/phone/normalize";

type ResetBody = {
    phone?: unknown;          // E.164
    newPassword?: unknown;
    firebaseIdToken?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function toString(v: unknown): string {
    return typeof v === "string" ? v : "";
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const raw: unknown = await req.json().catch(() => null);
        const body: ResetBody = isRecord(raw) ? (raw as ResetBody) : {};

        const phoneRaw = toString(body.phone).trim();
        const newPassword = toString(body.newPassword);
        const firebaseIdToken = toString(body.firebaseIdToken).trim();

        if (!phoneRaw || !newPassword || !firebaseIdToken) {
            return NextResponse.json(
                {error: "Phone, new password and verification token are required."},
                {status: 400}
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json({error: "Password must be at least 8 characters."}, {status: 400});
        }

        if (!isProbablyE164(phoneRaw)) {
            return NextResponse.json({error: "Invalid phone format"}, {status: 400});
        }

        const phone = normalizePhoneE164(phoneRaw);
        if (!phone) return NextResponse.json({error: "Invalid phone"}, {status: 400});

        // ✅ verify firebase token
        const decoded = await firebaseAdminAuth.verifyIdToken(firebaseIdToken, true);
        const verifiedPhone = typeof decoded?.phone_number === "string" ? decoded.phone_number : "";
        const verifiedPhoneNorm = normalizePhoneE164(verifiedPhone);

        if (!verifiedPhoneNorm || verifiedPhoneNorm !== phone) {
            return NextResponse.json(
                {error: "Phone verification failed. Please verify the same phone number."},
                {status: 401}
            );
        }

        const user = await User.findOne({phone}).select("_id phone password");
        if (!user) return NextResponse.json({error: "Account not found."}, {status: 404});

        user.password = newPassword;
        await user.save();

        return NextResponse.json({ok: true}, {status: 200});
    } catch (err) {
        console.error("reset-password error:", err);

        if (typeof err === "object" && err && "code" in err) {
            const code = (err).code;
            if (typeof code === "string" && code.startsWith("auth/")) {
                return NextResponse.json(
                    {error: "Verification expired. Please request a new code."},
                    {status: 401}
                );
            }
        }

        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}