"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft} from "lucide-react";

export function AuthPanelShell({
                                   title,
                                   subtitle,
                                   children,
                               }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col">
            <div className="px-5 sm:px-8 lg:px-10 pt-8">
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
                        <ArrowLeft className="h-4 w-4"/>
                        Back to home
                    </Link>

                    <Link href="/" className="hidden sm:inline-flex">
                        <Image src="/logo.svg" alt="OptiFit" width={140} height={32} priority/>
                    </Link>
                </div>
            </div>

            <div className="px-5 sm:px-8 lg:px-10 pb-10 flex items-start justify-center my-auto">
                <div className="w-full max-w-md pt-6 space-y-5">
                    <div className="mt-6 flex items-center justify-center sm:hidden">
                        <Image src="/logo.svg" alt="OptiFit" width={170} height={40} priority/>
                    </div>

                    <div className="text-center space-y-1">
                        <h1 className="font-display text-2xl font-bold">{title}</h1>
                        {subtitle ? <p className="text-white/60 text-sm">{subtitle}</p> : null}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}