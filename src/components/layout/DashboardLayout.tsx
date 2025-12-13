"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {
    LayoutDashboard,
    Dumbbell,
    Utensils,
    NotebookPen,
    History,
    BarChart3,
    User,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";

const navItems = [
    {path: "/dashboard", icon: LayoutDashboard, label: "Dashboard"},
    {path: "/training", icon: Dumbbell, label: "Training Program"},
    {path: "/diet", icon: Utensils, label: "Diet Plan"},
    {path: "/notebook", icon: NotebookPen, label: "Workout Notebook"},
    {path: "/history", icon: History, label: "History"},
    {path: "/analytics", icon: BarChart3, label: "Analytics"},
    {path: "/profile", icon: User, label: "Profile"},
    {path: "/settings", icon: Settings, label: "Settings"},
];

type AuthUser = {
    id: string;
    name?: string;
    email: string;
    phone: string;
} | null;

export function DashboardLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [user, setUser] = useState<AuthUser>(null);
    const [loading, setLoading] = useState(true);

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
        refreshMe();
    }, []);

    // extra safety: if middleware misses for some reason
    useEffect(() => {
        if (!loading && !user) router.replace("/");
    }, [loading, user, router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            setUser(null);
            setSidebarOpen(false);
            router.push("/");
            router.refresh();
        }
    };

    const isActive = (path: string) => {
        if (pathname === path) return true;
        return pathname?.startsWith(path + "/");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-card border-b border-border">
                <div className="flex h-full items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                            <Dumbbell className="h-4 w-4 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-lg font-bold">OptiFit</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                        {sidebarOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-full w-64 transform bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="hidden lg:flex h-16 items-center gap-2 px-6 border-b border-border">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                            <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-xl font-bold">OptiFit</span>
                    </div>

                    {/* User Info */}
                    <div className="p-4 mt-16 lg:mt-0">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {loading ? "Loading..." : user?.name || "User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {loading ? "" : user?.email || ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 overflow-y-auto">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                active
                                                    ? "bg-primary text-primary-foreground shadow-primary"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                            aria-current={active ? "page" : undefined}
                                        >
                                            <item.icon className="h-5 w-5"/>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:text-destructive"
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            <LogOut className="mr-3 h-5 w-5"/>
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}