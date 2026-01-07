"use client";

import Link from "next/link";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
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
} from "lucide-react";

const navItems = [
    {path: "/dashboard", icon: LayoutDashboard, label: "Dashboard"},
    {path: "/diet", icon: Utensils, label: "Diet Plan"},
    {path: "/training", icon: Dumbbell, label: "Training Program"},
    {path: "/notebook", icon: NotebookPen, label: "Workout Notebook"},
    {path: "/history", icon: History, label: "History"},
    {path: "/analytics", icon: BarChart3, label: "Analytics"},
    {path: "/profile", icon: User, label: "Profile"},
    {path: "/settings", icon: Settings, label: "Settings"},
];

export default function DashboardSidebar({
                                             open,
                                             user,
                                             loading,
                                             isActive,
                                             onClose,
                                             onLogout,
                                         }) {
    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-full w-64 transform bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
                open ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="flex h-full flex-col">
                <div className="hidden lg:flex h-16 items-center px-6 border-b border-border justify-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={160}
                                height={30}
                                className="hidden md:block"
                            />
                        </div>
                    </Link>
                </div>

                <div className="p-4 mt-16 lg:mt-0">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">
                {user?.name?.charAt(0) || "U"}
              </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{loading ? "Loading..." : user?.name || "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{loading ? "" : user?.email || ""}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-2 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        onClick={onClose}
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

                <div className="p-4 border-t border-border">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-destructive"
                        onClick={onLogout}
                        disabled={loading}
                    >
                        <LogOut className="mr-3 h-5 w-5"/>
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
}