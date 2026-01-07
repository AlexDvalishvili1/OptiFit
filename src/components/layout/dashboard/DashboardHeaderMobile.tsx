"use client";

import Link from "next/link";
import Image from "next/image";
import {Menu, X} from "lucide-react";

export default function DashboardHeaderMobile({open, onToggle}) {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-card border-b border-border">
            <div className="flex h-full items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-lg">
                        <Image
                            src="/logo_small.svg"
                            alt="Logo Small"
                            width={40}
                            height={40}
                            className="block md:hidden"
                        />
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={170}
                            height={40}
                            className="hidden md:block"
                        />
                    </div>
                </Link>

                <button onClick={onToggle} className="p-2" aria-label="Toggle sidebar">
                    {open ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                </button>
            </div>
        </header>
    );
}