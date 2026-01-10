import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {signToken} from "@/lib/auth/jwt";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {normalizePhoneE164, isProbablyE164} from "@/lib/pages/register/phone/normalize";
import {firebaseAdminAuth} from "@/server/firebase/admin";

type RegisterBody = {
    name?: unknown;
    email?: unknown;
    phone?: unknown; // E.164
    password?: unknown;
    firebaseIdToken?: unknown; // REQUIRED
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function toStringOrEmpty(v: unknown): string {
    return typeof v === "string" ? v : "";
}

type MongoDupKeyError = {
    code?: number;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const raw: unknown = await req.json();
        const data: RegisterBody = isRecord(raw) ? (raw as RegisterBody) : {};

        const name = toStringOrEmpty(data?.name).trim();
        const email = toStringOrEmpty(data?.email).trim().toLowerCase();

        const phoneRaw = toStringOrEmpty(data?.phone).trim();
        const firebaseIdToken = toStringOrEmpty(data?.firebaseIdToken).trim();

        const password = toStringOrEmpty(data?.password);

        if (!email || !phoneRaw || !password || !firebaseIdToken) {
            return NextResponse.json(
                {error: "Email, phone, password and phone verification token are required."},
                {status: 400}
            );
        }

        if (!isProbablyE164(phoneRaw)) {
            return NextResponse.json({error: "Invalid phone format"}, {status: 400});
        }

        const phone = normalizePhoneE164(phoneRaw);
        if (!phone) return NextResponse.json({error: "Invalid phone"}, {status: 400});

        // ✅ Server-side proof of phone verification
        const decoded = await firebaseAdminAuth.verifyIdToken(firebaseIdToken, true /* checkRevoked */);

        const verifiedPhone = typeof decoded?.phone_number === "string" ? decoded.phone_number : "";
        const verifiedPhoneNorm = normalizePhoneE164(verifiedPhone);

        if (!verifiedPhoneNorm || verifiedPhoneNorm !== phone) {
            return NextResponse.json(
                {error: "Phone verification failed. Please verify the same phone number."},
                {status: 401}
            );
        }

        // Fix for strict/incorrect mongoose typings in this project: allow `$or` query shape.
        type FindOneArg = Parameters<typeof User.findOne>[0];
        const existsQuery = ({$or: [{email}, {phone}]} as unknown) as FindOneArg;

        const exists = await User.findOne(existsQuery).select("_id email phone").lean();

        if (exists) {
            const conflict = exists.email === email ? "email" : "phone";
            return NextResponse.json(
                {error: `Account with this ${conflict} already exists.`},
                {status: 409}
            );
        }

        const created = await User.create({name, email, phone, password});

        const token = await signToken({
            sub: created._id.toString(),
            email: created.email,
            onboarded: !!created.advanced,
        });

        const res = NextResponse.json(
            {
                result: {
                    id: created._id.toString(),
                    name: created.name,
                    email: created.email,
                    phone: created.phone,
                },
            },
            {status: 201}
        );

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });

        return res;
    } catch (err: unknown) {
        console.error("Registration error:", err);

        const e = err as MongoDupKeyError;

        if (e?.code === 11000) {
            const field = Object.keys(e.keyPattern || e.keyValue || {})[0] || "field";
            return NextResponse.json({error: `Account with this ${field} already exists.`}, {status: 409});
        }

        // Firebase token errors should be treated as 401
        if (typeof err === "object" && err && "code" in err) {
            const code = (err).code;
            if (typeof code === "string" && code.startsWith("auth/")) {
                return NextResponse.json({error: "Phone verification expired. Please verify again."}, {status: 401});
            }
        }

        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}