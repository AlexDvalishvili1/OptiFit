"use client";

import {Button} from "@/components/ui/button";
import {AlertTriangle, Dumbbell, Play} from "lucide-react";

type ProgramExercise = {
    name: string;
    sets: string;
    reps: string;
    instructions: string;
    video: string;
};

type ProgramDay = {
    day: string;
    rest: boolean;
    muscles: string;
    exercises: ProgramExercise[];
};

export default function NotebookEmptyCard({
                                              todaysPlan,
                                              canStart,
                                              onStart,
                                          }: {
    todaysPlan: ProgramDay | null;
    canStart: boolean;
    onStart: () => void;
}) {
    const isRest = !!todaysPlan?.rest;

    return (
        <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                    {isRest ? <AlertTriangle className="h-6 w-6"/> : <Dumbbell className="h-6 w-6"/>}
                </div>

                <div className="flex-1">
                    <h2 className="font-display text-xl font-semibold">{isRest ? "Rest day" : "Ready to train?"}</h2>

                    <p className="text-muted-foreground mt-1">
                        {todaysPlan
                            ? isRest
                                ? "Today is a rest day. If you want a workout today, modify your plan in Training."
                                : `Today's plan: ${todaysPlan.muscles} • ${todaysPlan.exercises.length} exercises`
                            : "No training plan found. Generate your plan in Training first."}
                    </p>

                    <div className="mt-4">
                        <Button onClick={onStart} disabled={!canStart || isRest}>
                            <Play className="mr-2 h-5 w-5"/>
                            Start Today’s Workout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}