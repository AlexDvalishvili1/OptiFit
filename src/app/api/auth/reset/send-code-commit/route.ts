import {NextResponse, type NextRequest} from "next/server";
import {connectDB} from "@/server/db/connect";
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

const DEFAULT_COOLDOWN_SECONDS = 60;

export async function POST(req: NextRequest) {
    await connectDB();

    const body = (await req.json().catch(() => null)) as { phoneE164?: unknown } | null;
    const phoneRaw = typeof body?.phoneE164 === "string" ? body.phoneE164.trim() : "";

    if (!phoneRaw) return NextResponse.json({error: "Phone is required"}, {status: 400});
    if (!isProbablyE164(phoneRaw)) return NextResponse.json({error: "Invalid phone format"}, {status: 400});

    const phone = normalizePhoneE164(phoneRaw);
    if (!phone) return NextResponse.json({error: "Invalid phone"}, {status: 400});

    const ip = getClientIp(req);
    const expiresAt = new Date(Date.now() + DEFAULT_COOLDOWN_SECONDS * 1000);

    await SmsCooldown.updateOne(
        {phone, ip},
        {$set: {phone, ip, expiresAt}},
        {upsert: true}
    );

    return NextResponse.json({ok: true, retryAfter: DEFAULT_COOLDOWN_SECONDS}, {status: 200});
}