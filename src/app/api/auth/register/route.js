import {connectDB} from "../../../../lib/db.ts";
import {User} from "../../../../models/User.ts";
import {signToken} from "../../../../lib/auth/jwt.ts";
import {NextResponse} from "next/server";
import {normalizePhone} from "../../../../hooks/normalize-phone.ts";

export async function POST(req) {
    try {
        await connectDB();

        const data = await req.json();

        const name = (data?.name ?? "").trim();
        const email = (data?.email ?? "").trim().toLowerCase();
        const phone = normalizePhone(data?.phone ?? "");
        const password = data?.password ?? "";

        if (!email || !phone || !password) {
            return NextResponse.json(
                {error: "Email, phone, and password are required."},
                {status: 400}
            );
        }

        const exists = await User.findOne({$or: [{email}, {phone}]})
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
    } catch (err) {
        console.error("Registration error:", err);

        if (err?.code === 11000) {
            const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
            return NextResponse.json(
                {error: `Account with this ${field} already exists.`},
                {status: 409}
            );
        }

        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}