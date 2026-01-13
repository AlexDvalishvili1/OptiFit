export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export async function POST(_req: NextRequest) {
    const res = NextResponse.json({ok: true}, {status: 200});

    res.cookies.set("token", "", {
        path: "/",
        maxAge: 0,
    });

    return res;
}