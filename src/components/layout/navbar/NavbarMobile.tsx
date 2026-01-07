"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {scrollToId} from "@/hooks/scrollTo.ts";

export default function NavbarMobile({
                                         open,
                                         loading,
                                         user,
                                         onClose,
                                         onLogout,
                                     }) {
    const isAuthenticated = !!user;
    if (!open) return null;

    return (
        <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
                {loading ? null : !isAuthenticated ? (
                    <>
                        <button
                            onClick={() => {
                                scrollToId("features", "start");
                                onClose();
                            }}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                            Features
                        </button>

                        <button
                            onClick={() => {
                                scrollToId("how-it-works", "start");
                                onClose();
                            }}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                            How it Works
                        </button>
                        <Link href="/signin" onClick={onClose}>
                            <Button variant="ghost" className="w-full justify-start">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register" onClick={onClose}>
                            <Button variant="default" className="w-full">
                                Get Started
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard" onClick={onClose}>
                            <Button variant="ghost" className="w-full justify-start">
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/profile" onClick={onClose}>
                            <Button variant="ghost" className="w-full justify-start">
                                Profile
                            </Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
                            Logout
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}