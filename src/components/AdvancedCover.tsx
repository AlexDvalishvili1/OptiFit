"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

type MeUser = {
    id: string;
    name?: string;
    email: string;
    phone: string;
    advanced: boolean;
} | null;

const GUARDED_PATHS = [
    "/dashboard",
    "/training",
    "/diet",
    "/notebook",
    "/history",
    "/analytics",
];

export function AdvancedCover({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const isGuarded = GUARDED_PATHS.some((p) => pathname.startsWith(p));

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<MeUser>(null);

    useEffect(() => {
        if (!isGuarded) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/auth/me", {credentials: "include"});
                const json = await res.json().catch(() => ({}));
                if (!cancelled) setUser(json.user ?? null);
            } catch {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isGuarded, pathname]);

    // not a guarded page -> just render
    if (!isGuarded) return <>{children}</>;

    // show page content while loading (or swap for skeleton if you want)
    if (loading) return <>{children}</>;

    // if not logged in, middleware should handle; extra safety:
    if (!user) {
        router.replace("/");
        return null;
    }

    // ✅ advanced users -> normal access
    if (user.advanced) return <>{children}</>;

    // ❌ not advanced -> cover ONLY the content area
    return (
        <div className="relative">
            {/* content behind (disabled) */}
            <div className="pointer-events-none select-none blur-[2px] opacity-60">
                {children}
            </div>

            {/* cover */}
            <div
                className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
                    <h2 className="font-display text-xl font-bold mb-2">
                        Complete your profile to continue
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                        To generate workouts, diet plans, and analytics, please fill in your required profile
                        details (age, height, weight, goal, activity, etc.).
                    </p>

                    <div className="flex gap-3">
                        <Button className="flex-1" onClick={() => router.push("/profile")}>
                            Go to Profile
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push("/")}
                        >
                            Not now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}