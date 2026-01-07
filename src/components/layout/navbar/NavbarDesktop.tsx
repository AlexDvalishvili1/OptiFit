"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {LogOut, User} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {scrollToId} from "@/hooks/scrollTo.ts";

export default function NavbarDesktop({loading, user, onLogout}) {
    const router = useRouter();
    const isAuthenticated = !!user;

    return (
        <div className="hidden md:flex items-center gap-6">
            {loading ? null : !isAuthenticated ? (
                <>
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
                            <DropdownMenuItem onClick={onLogout}>
                                <LogOut className="mr-2 h-4 w-4"/>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </div>
    );
}