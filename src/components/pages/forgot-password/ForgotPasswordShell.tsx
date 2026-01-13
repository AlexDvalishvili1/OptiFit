"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft} from "lucide-react";

export function ForgotPasswordShell({children}: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#05070b] text-white">
            <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10 sm:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to sign in
                    </Link>

                    <Link href="/" className="hidden sm:inline-flex">
                        <Image src="/logo.svg" alt="OptiFit" width={140} height={32} priority/>
                    </Link>
                </div>

                <div className="mb-6 flex items-center justify-center sm:hidden">
                    <Image src="/logo.svg" alt="OptiFit" width={170} height={40} priority/>
                </div>

                <div className="text-center space-y-1">
                    <h1 className="font-display text-2xl font-bold">Reset password</h1>
                    <p className="text-white/60 text-sm">Verify your phone and set a new password.</p>
                </div>

                {children}

                <div className="pt-6 text-center text-[11px] text-white/45">
                    Need help?{" "}
                    <Link href="/support" className="text-white/65 underline underline-offset-4">
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}