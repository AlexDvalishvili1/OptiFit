import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/jwt";
import {connectDB} from "@/server/db/connect";
import {User} from "@/server/models/User";
import type {AuthUser} from "@/lib/auth/types";

type TokenPayload = {
    sub: string;
    [key: string]: unknown;
};

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json<{ user: AuthUser }>({user: null}, {status: 200});
        }

        const payload = (await verifyToken(token)) as TokenPayload;
        const userId = payload.sub;

        await connectDB();

        // Fix TS2349: mongoose model typings in this project make `findById` appear "not callable".
        // We keep the exact same query/logic, only cast the model for this call site.
        const UserModel = User as unknown as {
            findById: (id: string) => {
                select: (fields: string) => {
                    lean: () => Promise<unknown | null>;
                };
            };
        };

        const user = await UserModel.findById(userId)
            .select("_id name email phone advanced gender dob height weight activity goal allergies")
            .lean();

        if (!user) {
            return NextResponse.json<{ user: AuthUser }>({user: null}, {status: 200});
        }

        const u = user as {
            _id: { toString: () => string };
            name?: string;
            email: string;
            phone: string;
            advanced?: unknown;
            gender?: "male" | "female" | null;
            dob?: Date | null;
            height?: unknown;
            weight?: unknown;
            activity?: string | null;
            goal?: string | null;
            allergies?: unknown;
        };

        const authUser: AuthUser = {
            id: u._id.toString(),
            name: u.name ?? undefined,
            email: u.email,
            phone: u.phone,

            advanced: !!u.advanced,

            gender: u.gender ?? null,
            dob: u.dob ? u.dob.toISOString() : null,
            height: typeof u.height === "number" ? u.height : null,
            weight: typeof u.weight === "number" ? u.weight : null,
            activity: u.activity ?? null,
            goal: u.goal ?? null,
            allergies: Array.isArray(u.allergies) ? (u.allergies as string[]) : [],
        };

        return NextResponse.json<{ user: AuthUser }>({user: authUser}, {status: 200});
    } catch {
        // invalid/expired token
        return NextResponse.json<{ user: AuthUser }>({user: null}, {status: 200});
    }
}