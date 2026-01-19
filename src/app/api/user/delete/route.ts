export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import bcrypt from "bcryptjs";

import {verifyToken} from "@/lib/auth/jwt";
import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {SmsCooldown} from "@/server/models/SmsCooldown";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

type DeletePayload = {
    password?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function toOptionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function sameOrigin(req: NextRequest) {
    // Extra CSRF hardening for cookie-auth endpoints.
    // Lax cookies already block most cross-site POSTs, but this helps further.
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!origin || !host) return true;
    try {
        const u = new URL(origin);
        return u.host === host;
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!sameOrigin(req)) {
            return NextResponse.json({error: "Bad origin."}, {status: 403});
        }

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({error: "Unauthorized."}, {status: 401});

        const payload = (await verifyToken(token)) as TokenPayload;
        const userId = payload.sub;

        const bodyUnknown: unknown = await req.json().catch(() => ({}));
        const body: DeletePayload = isRecord(bodyUnknown) ? (bodyUnknown as DeletePayload) : {};
        const password = (toOptionalString(body.password) ?? "").trim();

        if (!password) {
            return NextResponse.json({error: "Password is required."}, {status: 400});
        }

        await connectDB();

        const user = await User.findById(userId).select("password phone");

        if (!user || !user.password) {
            // If user is gone already, treat as success but clear cookie.
            const res = NextResponse.json({ok: true}, {status: 200});
            res.cookies.set("token", "", {path: "/", maxAge: 0});
            return res;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return NextResponse.json({error: "Invalid password."}, {status: 401});
        }

        const phone = user.phone;

        // Delete user account (single-document storage in this project)
        await User.deleteOne({_id: user._id});

        // Best-effort cleanup for auxiliary collections
        if (phone) {
            await SmsCooldown.deleteMany({phone}).catch(() => null);
        }

        const res = NextResponse.json({ok: true}, {status: 200});
        res.cookies.set("token", "", {path: "/", maxAge: 0});
        return res;
    } catch (err: unknown) {
        console.error("Delete account error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}
