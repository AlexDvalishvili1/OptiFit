import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {verifyToken} from "../../../../lib/auth/jwt.ts";
import {connectDB} from "../../../../lib/db.ts";
import {User} from "../../../../models/User.ts";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({user: null}, {status: 200});

        const payload = await verifyToken(token);
        const userId = payload.sub;

        await connectDB();
        const user = await User.findById(userId).select("_id name email phone").lean();

        if (!user) return NextResponse.json({user: null}, {status: 200});

        return NextResponse.json(
            {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
            },
            {status: 200}
        );
    } catch {
        // invalid/expired token
        return NextResponse.json({user: null}, {status: 200});
    }
}
