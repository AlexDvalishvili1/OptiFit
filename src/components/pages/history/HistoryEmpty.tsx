"use client";

import {Calendar} from "lucide-react";

export default function HistoryEmpty() {
    return (
        <div className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-primary"/>
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">No Workouts Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
                Start logging your workouts in the Notebook to see your history here.
            </p>
        </div>
    );
}