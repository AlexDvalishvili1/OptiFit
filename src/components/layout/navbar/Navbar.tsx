"use client";

import {Menu, X} from "lucide-react";
import {useMemo, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";
import {useAuth} from "@/components/providers/AuthProvider";

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

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const {user, loading, setUser, refresh} = useAuth();

    const isProtectedPage = useMemo(
        () => PROTECTED_PAGES.some((p) => pathname.startsWith(p)),
        [pathname]
    );

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {method: "POST", credentials: "include"});
        } finally {
            setUser(null);
            setMobileMenuOpen(false);
            router.push("/");
            router.refresh();
            // опционально: refresh(), если хочешь гарантированно синкнуться с сервером
            // await refresh();
        }
    };

    if (isProtectedPage) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
            <div className="container mx-auto px-4">
                <div className="flex h-[76px] items-center justify-between">
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

                    <NavbarDesktop loading={loading} user={user} onLogout={handleLogout}/>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                    </button>
                </div>

                <NavbarMobile
                    open={mobileMenuOpen}
                    loading={loading}
                    user={user}
                    onClose={() => setMobileMenuOpen(false)}
                    onLogout={handleLogout}
                />
            </div>
        </nav>
    );
}
