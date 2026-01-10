import {NextResponse, type NextRequest} from "next/server";
import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import {SmsCooldown} from "@/server/models/SmsCooldown";
import {normalizePhoneE164, isProbablyE164} from "@/lib/pages/register/phone/normalize";

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

    const body = (await req.json().catch(() => null)) as { phoneE164?: unknown } | null;
    const phoneRaw = typeof body?.phoneE164 === "string" ? body.phoneE164.trim() : "";

    if (!phoneRaw) return NextResponse.json({error: "Phone is required"}, {status: 400});
    if (!isProbablyE164(phoneRaw)) return NextResponse.json({error: "Invalid phone format"}, {status: 400});

    const phone = normalizePhoneE164(phoneRaw);
    if (!phone) return NextResponse.json({error: "Invalid phone"}, {status: 400});

    // 1) phone exists?
    const exists = await User.findOne({phone}).select("_id").lean();
    if (exists) {
        return NextResponse.json({error: "Account with this phone already exists."}, {status: 409});
    }

    // 2) cooldown active?
    const ip = getClientIp(req);
    const existing = await SmsCooldown.findOne({phone, ip}).select("expiresAt").lean();

    if (existing) {
        const leftMs = existing.expiresAt.getTime() - Date.now();

        // TTL could lag: if expired by time, treat as inactive and cleanup
        if (leftMs <= 0) {
            await SmsCooldown.deleteOne({phone, ip}).catch(() => {
            });
            return NextResponse.json({ok: true}, {status: 200});
        }

        const retryAfter = Math.ceil(leftMs / 1000);
        return NextResponse.json(
            {error: "Please wait before requesting another code.", retryAfter},
            {status: 429}
        );
    }

    return NextResponse.json({ok: true}, {status: 200});
}