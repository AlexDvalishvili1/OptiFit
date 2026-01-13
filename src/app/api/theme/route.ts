export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const {mode} = await req.json().catch(() => ({}));

    if (!["light", "dark", "system"].includes(mode)) {
        return NextResponse.json({error: "Invalid mode"}, {status: 400});
    }

    const res = NextResponse.json({ok: true});

    res.cookies.set("theme", mode, {
        path: "/",
        httpOnly: false,       // client can read if needed (optional)
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return res;
}