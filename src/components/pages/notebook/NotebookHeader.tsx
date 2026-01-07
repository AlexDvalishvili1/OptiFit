"use client";

import {Button} from "@/components/ui/button";
import {Clock, Save, Square} from "lucide-react";

export default function NotebookHeader({
                                           hasWorkout,
                                           elapsedText,
                                           onSave,
                                           onEnd,
                                       }: {
    hasWorkout: boolean;
    elapsedText: string;
    onSave: () => void;
    onEnd: () => void;
}) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold">Workout Notebook</h1>
                <p className="text-muted-foreground mt-1">
                    {hasWorkout ? "Track weight & reps, then save to history." : "Start a workout session to begin logging."}
                </p>
            </div>

            {hasWorkout && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent">
                        <Clock className="h-5 w-5 text-primary"/>
                        <span className="font-display text-lg font-semibold">{elapsedText}</span>
                    </div>

                    <Button size="lg" onClick={onSave} className="h-11">
                        <Save className="mr-2 h-5 w-5"/>
                        Save Workout
                    </Button>

                    <Button size="lg" variant="destructive" onClick={onEnd} className="h-11">
                        <Square className="mr-2 h-5 w-5"/>
                        End
                    </Button>
                </div>
            )}
        </div>
    );
}