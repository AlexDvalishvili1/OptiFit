"use client";

import {Button} from "@/components/ui/button";
import {Menu, X, Dumbbell, User, LogOut} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";

type AuthUser = {
    id: string;
    name?: string;
    email: string;
    phone: string;
} | null;

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

    const [user, setUser] = useState<AuthUser>(null);
    const [loading, setLoading] = useState(true);

    const isProtectedPage = useMemo(
        () => PROTECTED_PAGES.some((p) => pathname.startsWith(p)),
        [pathname]
    );

    const refreshMe = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/me", {credentials: "include"});
            const json = await res.json();
            setUser(json.user ?? null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If you want to skip the request on protected pages, do it INSIDE the effect
        if (isProtectedPage) return;
        refreshMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isProtectedPage]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            setUser(null);
            setMobileMenuOpen(false);
            router.push("/");
            router.refresh();
        }
    };

    // ✅ Now it’s safe to conditionally render AFTER hooks
    if (isProtectedPage) return null;

    const isAuthenticated = !!user;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                            <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-xl font-bold">OptiFit</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {loading ? null : !isAuthenticated ? (
                            <>
                                <a
                                    href="#features"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#how-it-works"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    How it Works
                                </a>
                                <Link href="/signin">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="default">Get Started</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <User className="h-5 w-5"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                                            <User className="mr-2 h-4 w-4"/>
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4"/>
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border animate-fade-in">
                        <div className="flex flex-col gap-4">
                            {loading ? null : !isAuthenticated ? (
                                <>
                                    <a
                                        href="#features"
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Features
                                    </a>
                                    <a
                                        href="#how-it-works"
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        How it Works
                                    </a>
                                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="default" className="w-full">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Profile
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}