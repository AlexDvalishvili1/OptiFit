"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";

import DashboardHeaderMobile from "./DashboardHeaderMobile";
import DashboardSidebar from "./DashboardSidebar";
import {useAuth} from "@/components/providers/AuthProvider";

export function DashboardLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const {user, loading, setUser} = useAuth();

    useEffect(() => {
        if (!loading && !user) router.replace("/");
    }, [loading, user, router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {method: "POST", credentials: "include"});
        } finally {
            setUser(null);
            setSidebarOpen(false);
            router.push("/");
            router.refresh();
        }
    };

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeaderMobile open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)}/>

            <DashboardSidebar
                open={sidebarOpen}
                user={user}
                loading={loading}
                isActive={isActive}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
            />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className={cn("lg:ml-64 min-h-screen pt-16 lg:pt-0")}>
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}