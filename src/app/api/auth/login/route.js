import {connectDB} from "../../../../lib/db.ts";
import {User} from "../../../../models/User.ts";
import {signToken} from "../../../../lib/auth/jwt.ts";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {normalizePhone} from "../../../../hooks/normalize-phone.ts";

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        const data = body?.data ?? body;

        const rawIdentifier = (data?.identifier ?? data?.email ?? "").trim();
        const password = data?.password ?? "";

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

        const user = await User.findOne({
            $or: [
                ...(email ? [{email}] : []),
                ...(phone ? [{phone}] : []),
            ],
        }).select("+password");

        if (!user || !user.password) {
            return NextResponse.json({error: "Invalid credentials."}, {status: 401});
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return NextResponse.json({error: "Invalid credentials."}, {status: 401});

        const token = await signToken({sub: user._id.toString(), email: user.email});

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
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}