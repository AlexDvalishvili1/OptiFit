"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Zap} from "lucide-react";

export default function DashboardHeader({
                                            firstName,
                                            loading,
                                        }: {
    firstName: string;
    loading: boolean;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold">
                    Welcome back, {firstName}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here&apos;s your fitness overview for today {loading ? "(loading…)" : ""}
                </p>
            </div>

            <Link href="/notebook">
                <Button size="lg">
                    <Zap className="mr-2 h-5 w-5"/>
                    Start Workout
                </Button>
            </Link>
        </div>
    );
}