import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {signToken} from "@/lib/auth/jwt";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {normalizePhone} from "@/hooks/normalize-phone";
import type {NextRequest} from "next/server";

type LoginPayload = {
    data?: unknown;
    phone?: unknown;
    password?: unknown;
};

type LoginData = {
    phone?: string;
    password?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function toOptionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const bodyUnknown: unknown = await req.json();
        const body: LoginPayload = isRecord(bodyUnknown) ? (bodyUnknown as LoginPayload) : {};

        const dataUnknown: unknown = body?.data ?? body;
        const data: LoginData = isRecord(dataUnknown) ? (dataUnknown as LoginData) : {};

        const rawPhone = (toOptionalString(data?.phone) ?? "").trim();
        const password = toOptionalString(data?.password) ?? "";

        if (!rawPhone || !password) {
            return NextResponse.json({error: "Phone and password are required."}, {status: 400});
        }

        const phone = normalizePhone(rawPhone);
        if (!phone) {
            return NextResponse.json({error: "Invalid phone."}, {status: 400});
        }

        const user = await User.findOne({phone}).select("+password");

        if (!user || !user.password) {
            return NextResponse.json({error: "Invalid credentials."}, {status: 401});
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return NextResponse.json({error: "Invalid credentials."}, {status: 401});

        const token = await signToken({
            sub: user._id.toString(),
            phone: user.phone,
            onboarded: !!user.advanced,
        });

        const res = NextResponse.json(
            {
                result: {
                    id: user._id.toString(),
                    name: user.name,
                    phone: user.phone,
                },
            },
            {status: 200}
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
        console.error("Login error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}