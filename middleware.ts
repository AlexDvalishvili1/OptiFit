import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const protectedPaths = ['/diet', '/account', '/workout', '/workout/notebook', '/workout/history'];
    const authPaths = ['/', '/login', '/register'];

    const origin = req.nextUrl.origin;

    if (!token) {
        if (protectedPaths.includes(url.pathname)) {
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    } else {
        if (authPaths.includes(url.pathname)) {
            url.pathname = '/account';
            return NextResponse.redirect(url);
        }
        
        try {
            if (url.pathname === '/diet' || url.pathname === '/workout') {
                const response = await fetch(`${origin}/api/verify`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: token.id }),
                    cache: 'no-cache',
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const result = await response.json();

                if (!result?.permission) {
                    url.pathname = '/account';
                    return NextResponse.redirect(url);
                }
            }

            if (url.pathname === '/workout/notebook') {
                const response = await fetch(`${origin}/api/verify`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: token.id, training: true }),
                    cache: 'no-cache',
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const result = await response.json();

                if (!result?.permission) {
                    url.pathname = '/workout';
                    return NextResponse.redirect(url);
                }
            }
        } catch (error) {
            console.error('Error during middleware fetch:', error);
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/diet', '/workout', '/workout/notebook', '/workout/history', '/account', '/login', '/register'],
};
