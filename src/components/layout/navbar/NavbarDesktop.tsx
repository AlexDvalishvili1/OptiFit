"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {scrollToId} from "@/hooks/scrollTo";

export default function NavbarDesktop() {
    return (
        <div className="hidden md:flex items-center gap-6">
            <button
                onClick={() => scrollToId("features", "center")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                Features
            </button>

            <button
                onClick={() => scrollToId("how-it-works", "center")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                How it Works
            </button>
            <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
                <Button variant="default">Get Started</Button>
            </Link>
        </div>
    );
}