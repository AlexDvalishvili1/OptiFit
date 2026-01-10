import {NextResponse, type NextRequest} from "next/server";
import {connectDB} from "@/server/db/connect";
import {SmsCooldown} from "@/server/models/SmsCooldown";
import {normalizePhoneE164, isProbablyE164} from "@/lib/pages/register/phone/normalize";

function getClientIp(req: NextRequest) {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]!.trim();
    return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
    await connectDB();

    const body = (await req.json().catch(() => null)) as { phoneE164?: unknown } | null;
    const phoneRaw = typeof body?.phoneE164 === "string" ? body.phoneE164.trim() : "";

    if (!phoneRaw) return NextResponse.json({error: "Phone is required"}, {status: 400});
    if (!isProbablyE164(phoneRaw)) return NextResponse.json({error: "Invalid phone format"}, {status: 400});

    const phone = normalizePhoneE164(phoneRaw);
    if (!phone) return NextResponse.json({error: "Invalid phone"}, {status: 400});

    const ip = getClientIp(req);

    const cooldownMs = 60_000;
    const expiresAt = new Date(Date.now() + cooldownMs);

    const existing = await SmsCooldown.findOne({phone, ip}).select("expiresAt").lean();

    if (existing) {
        const leftMs = existing.expiresAt.getTime() - Date.now();
        if (leftMs > 0) {
            const retryAfter = Math.ceil(leftMs / 1000);
            return NextResponse.json(
                {error: "Cooldown active", retryAfter},
                {status: 429}
            );
        }
        // expired by time -> cleanup & continue
        await SmsCooldown.deleteOne({phone, ip}).catch(() => {
        });
    }

    // upsert new cooldown
    await SmsCooldown.updateOne(
        {phone, ip},
        {$set: {expiresAt}},
        {upsert: true}
    );

    return NextResponse.json({ok: true, retryAfter: 60}, {status: 200});
}