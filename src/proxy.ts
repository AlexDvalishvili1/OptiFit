import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const AUTH_PAGES = ["/signin", "/register"];

const PROTECTED_PAGES = [
    "/dashboard",
    "/training",
    "/diet",
    "/notebook",
    "/history",
    "/analytics",
    "/profile",
    "/settings",
];

export function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const {pathname} = req.nextUrl;

    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isProtectedPage = PROTECTED_PAGES.some((p) =>
        pathname.startsWith(p)
    );

    // 🔁 Logged-in users should not see auth pages
    if (token && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // 🔐 Guests should not see protected pages
    if (!token && isProtectedPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/signin",
        "/register",
        "/dashboard/:path*",
        "/training/:path*",
        "/diet/:path*",
        "/notebook/:path*",
        "/history/:path*",
        "/analytics/:path*",
        "/profile/:path*",
        "/settings/:path*",
    ],
};