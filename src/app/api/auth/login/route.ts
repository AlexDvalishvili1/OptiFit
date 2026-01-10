import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {signToken} from "@/lib/auth/jwt";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {normalizePhone} from "@/hooks/normalize-phone";
import type {NextRequest} from "next/server";

type LoginPayload = {
    data?: unknown;
    identifier?: unknown;
    email?: unknown;
    password?: unknown;
};

type LoginData = {
    identifier?: string;
    email?: string;
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

        const rawIdentifier = (toOptionalString(data?.identifier) ?? toOptionalString(data?.email) ?? "").trim();
        const password = toOptionalString(data?.password) ?? "";

        if (!rawIdentifier || !password) {
            return NextResponse.json(
                {error: "Email/phone and password are required."},
                {status: 400}
            );
        }

        // Your UI rule: "has any letter" => email, else phone
        const hasLetter = /[a-zA-Z]/.test(rawIdentifier);

        const email = hasLetter ? rawIdentifier.toLowerCase() : null;
        const phone = hasLetter ? null : normalizePhone(rawIdentifier);

        // Fix TS: User.findOne is typed too strictly in your project, so `$or` fails.
        // We keep the exact same Mongo query but cast it through `unknown` to the expected type.
        type FindOneArg = Parameters<typeof User.findOne>[0];
        const query = ({
            $or: [
                ...(email ? [{email}] : []),
                ...(phone ? [{phone}] : []),
            ],
        } as unknown) as FindOneArg;

        const user = await User.findOne(query).select("+password");

        if (!user || !user.password) {
            return NextResponse.json({error: "Invalid credentials."}, {status: 401});
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return NextResponse.json({error: "Invalid credentials."}, {status: 401});

        const token = await signToken({sub: user._id.toString(), email: user.email, onboarded: !!user.advanced,});

        const res = NextResponse.json(
            {
                result: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
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