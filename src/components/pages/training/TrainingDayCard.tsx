"use client";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
    ChevronDown,
    ChevronUp,
    Dumbbell,
    Info,
    Play,
    RefreshCw,
    Youtube,
} from "lucide-react";
import type {ProgramDay} from "./types";

function splitSteps(instructions: string) {
    return instructions.split("\n").map((s) => s.trim()).filter(Boolean);
}

type Props = {
    day: ProgramDay;
    isToday: boolean;
    expanded: boolean;
    onToggleExpand: () => void;

    openHowTo: Record<string, boolean>;
    onToggleHowTo: (key: string) => void;

    hasActiveWorkout: boolean;
    isStartingThisDay: boolean;
    onStartWorkout: () => void;
};

export default function TrainingDayCard({
                                            day,
                                            isToday,
                                            expanded,
                                            onToggleExpand,
                                            openHowTo,
                                            onToggleHowTo,
                                            hasActiveWorkout,
                                            isStartingThisDay,
                                            onStartWorkout,
                                        }: Props) {
    return (
        <div
            className={cn(
                "rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300",
                isToday && "ring-2 ring-primary"
            )}
        >
            <button
                onClick={onToggleExpand}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center",
                            day.rest ? "bg-muted" : "gradient-primary"
                        )}
                    >
                        <Dumbbell
                            className={cn(
                                "h-6 w-6",
                                day.rest ? "text-muted-foreground" : "text-primary-foreground"
                            )}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-semibold">{day.day}</h3>
                            {isToday && (
                                <span
                                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  Today
                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground">{day.rest ? "Rest Day" : day.muscles}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{day.rest ? "Rest" : `${day.exercises.length} exercises`}</span>
                    {expanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </div>
            </button>

            {expanded && (
                <div className="px-6 pb-6 animate-fade-in">
                    <div className="border-t border-border pt-6">
                        {day.rest ? (
                            <div className="p-4 rounded-xl bg-accent/30 text-sm text-muted-foreground">
                                Recovery day. Optional: light walk, mobility, easy stretching.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {day.exercises.map((ex, idx) => {
                                    const key = `${day.day}__${idx}__${ex.name}`;
                                    const open = !!openHowTo[key];
                                    const steps = splitSteps(ex.instructions || "");
                                    const hasHowTo = steps.length > 0;

                                    return (
                                        <div
                                            key={key}
                                            className="rounded-2xl border border-border bg-accent/20 hover:bg-accent/30 transition-colors"
                                        >
                                            <div className="p-4 flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 min-w-0">
                          <span
                              className="h-9 w-9 shrink-0 rounded-xl bg-background flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </span>

                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{ex.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {ex.sets} sets · {ex.reps}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            {hasHowTo && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => onToggleHowTo(key)}
                                                                    className="h-9 rounded-xl"
                                                                >
                                                                    <Info className="mr-2 h-4 w-4"/>
                                                                    How to do
                                                                    <span className="ml-2 inline-flex">
                                    {open ? (
                                        <ChevronUp className="h-4 w-4"/>
                                    ) : (
                                        <ChevronDown className="h-4 w-4"/>
                                    )}
                                  </span>
                                                                </Button>
                                                            )}

                                                            {ex.video?.startsWith("https://") && (
                                                                <a
                                                                    href={ex.video}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                                                >
                                                                    <Youtube className="h-5 w-5"/>
                                                                    Video
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {hasHowTo && open && (
                                                <div className="px-4 pb-4">
                                                    <div
                                                        className="rounded-xl bg-background/70 border border-border p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="text-sm font-medium">How to do it</p>
                                                            <span
                                                                className="text-xs text-muted-foreground">{steps.length} steps</span>
                                                        </div>

                                                        <div className="mt-3 grid gap-2">
                                                            {steps.map((s, i) => (
                                                                <div
                                                                    key={`${key}-step-${i}`}
                                                                    className="flex items-start gap-3 rounded-lg bg-accent/30 px-3 py-2"
                                                                >
                                  <span
                                      className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-background flex items-center justify-center text-xs font-semibold">
                                    {i + 1}
                                  </span>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                                    <p className="text-sm text-muted-foreground">Rest between sets: 60-90 seconds</p>

                                    <Button
                                        variant={hasActiveWorkout ? "outline" : "default"}
                                        size="sm"
                                        onClick={onStartWorkout}
                                        disabled={day.rest || isStartingThisDay}
                                    >
                                        {isStartingThisDay ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                                                Starting...
                                            </>
                                        ) : hasActiveWorkout ? (
                                            <>
                                                <Play className="mr-2 h-4 w-4"/>
                                                Resume Workout
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4"/>
                                                Start This Workout
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}