"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {scrollToId} from "@/hooks/scrollTo";

type NavbarMobileProps = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
};

export default function NavbarMobile({open, loading, onClose}: NavbarMobileProps) {
    if (!open) return null;

    return (
        <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
                {!loading && (
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                scrollToId("features", "start");
                                onClose();
                            }}
                            className="w-full justify-start font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Features
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                scrollToId("how-it-works", "start");
                                onClose();
                            }}
                            className="w-full justify-start font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            How it Works
                        </Button>

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
                )}
            </div>
        </div>
    );
}