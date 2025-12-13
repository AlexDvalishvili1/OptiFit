// app/layout.tsx
import "./globals.css";
import Providers from "@/components/layout/Providers.tsx";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import type {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'OptiFit',
    description: '"OptiFit" - Health and Fitness Platform',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <Providers>
            {children}
            <Toaster/>
            <Sonner/>
        </Providers>
        </body>
        </html>
    );
}