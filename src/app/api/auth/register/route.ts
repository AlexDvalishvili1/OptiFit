import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {signToken} from "@/lib/auth/jwt";
import {NextResponse} from "next/server";
import {normalizePhone} from "@/hooks/normalize-phone";
import type {NextRequest} from "next/server";

type RegisterBody = {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    password?: unknown;
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
        const phone = normalizePhone(toStringOrEmpty(data?.phone));
        const password = toStringOrEmpty(data?.password);

        if (!email || !phone || !password) {
            return NextResponse.json(
                {error: "Email, phone, and password are required."},
                {status: 400}
            );
        }

        // Fix for strict/incorrect mongoose typings in this project: allow `$or` query shape.
        type FindOneArg = Parameters<typeof User.findOne>[0];
        const existsQuery = ({$or: [{email}, {phone}]} as unknown) as FindOneArg;

        const exists = await User.findOne(existsQuery)
            .select("_id email phone")
            .lean();

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
        });

        const res = NextResponse.json(
            {
                result: {
                    id: created._id.toString(),
                    name: created.name,
                    email: created.email,
                    phone: created.phone, // now stored normalized
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
            return NextResponse.json(
                {error: `Account with this ${field} already exists.`},
                {status: 409}
            );
        }

        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}