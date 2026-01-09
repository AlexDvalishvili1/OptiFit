"use client";

import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/components/providers/AuthProvider";

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
    const {user, loading} = useAuth();

    const isGuarded = GUARDED_PATHS.some((p) => pathname.startsWith(p));

    // не guarded -> всё ок
    if (!isGuarded) return <>{children}</>;

    // пока auth грузится — не блокируем UI
    if (loading) return <>{children}</>;

    // если не залогинен — пусть редиректит
    if (!user) {
        router.replace("/");
        return null;
    }

    // advanced -> доступ
    if (user.advanced) return <>{children}</>;

    // не advanced -> cover
    return (
        <div className="relative">
            <div className="pointer-events-none select-none blur-[2px] opacity-60">
                {children}
            </div>

            <div
                className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
                    <h2 className="font-display text-xl font-bold mb-2">
                        Complete your profile to continue
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                        To generate workouts, diet plans, and analytics, please fill in required profile details.
                    </p>

                    <div className="flex gap-3">
                        <Button className="flex-1" onClick={() => router.push("/profile")}>
                            Go to Profile
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
                            Not now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}