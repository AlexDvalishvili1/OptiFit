export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {NextResponse, type NextRequest} from "next/server";
import {cookies} from "next/headers";

import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {SmsCooldown} from "@/server/models/SmsCooldown";
import {verifyToken} from "@/lib/auth/jwt";
import {normalizePhoneE164, isProbablyE164} from "@/lib/pages/register/phone/normalize";

type TokenPayload = { sub: string; [key: string]: unknown };

function getClientIp(req: NextRequest) {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]!.trim();
    const real = req.headers.get("x-real-ip");
    if (real) return real;
    const anyReq = req as unknown as { ip?: string };
    if (anyReq.ip) return anyReq.ip;
    return "unknown";
}

export async function POST(req: NextRequest) {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const payload = (await verifyToken(token)) as TokenPayload;
    const userId = payload.sub;

    const body = (await req.json().catch(() => null)) as { phoneE164?: unknown; kind?: unknown } | null;
    const phoneRaw = typeof body?.phoneE164 === "string" ? body.phoneE164.trim() : "";
    const kind = body?.kind === "current" || body?.kind === "new" ? body.kind : "";

    if (!phoneRaw) return NextResponse.json({error: "Phone is required"}, {status: 400});
    if (!kind) return NextResponse.json({error: "Kind is required"}, {status: 400});
    if (!isProbablyE164(phoneRaw)) return NextResponse.json({error: "Invalid phone format"}, {status: 400});

    const phone = normalizePhoneE164(phoneRaw);
    if (!phone) return NextResponse.json({error: "Invalid phone"}, {status: 400});

    const me = await User.findById(userId).select("phone").lean();
    if (!me) return NextResponse.json({error: "User not found"}, {status: 404});

    const myPhone = normalizePhoneE164(String(me.phone || "").trim());

    // ✅ current: must match my phone
    if (kind === "current") {
        if (!myPhone || phone !== myPhone) {
            return NextResponse.json({error: "Phone mismatch"}, {status: 403});
        }
    }

    // ✅ new: must NOT be used by another user and must not equal current
    if (kind === "new") {
        if (myPhone && phone === myPhone) {
            return NextResponse.json({error: "New phone must be different"}, {status: 400});
        }
        const exists = await User.findOne({phone}).select("_id").lean();
        if (exists) return NextResponse.json({error: "Phone already in use"}, {status: 409});
    }

    // ✅ cooldown check
    const ip = getClientIp(req);
    const existing = await SmsCooldown.findOne({phone, ip}).select("expiresAt").lean();

    if (existing) {
        const leftMs = existing.expiresAt.getTime() - Date.now();

        if (leftMs <= 0) {
            await SmsCooldown.deleteOne({phone, ip}).catch(() => {
            });
            return NextResponse.json({ok: true}, {status: 200});
        }

        const retryAfter = Math.ceil(leftMs / 1000);
        return NextResponse.json({error: "Please wait before requesting another code.", retryAfter}, {status: 429});
    }

    return NextResponse.json({ok: true}, {status: 200});
}