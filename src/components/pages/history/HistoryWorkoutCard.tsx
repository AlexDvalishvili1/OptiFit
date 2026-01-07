"use client";

import * as React from "react";
import {cn} from "@/lib/utils";
import {Clock, Dumbbell, ChevronRight} from "lucide-react";

type WorkoutSetData = { weight: number; reps: number };
type HistoryExercise = { name: string; data: WorkoutSetData[] };
type HistoryWorkoutDay = { day: string; muscles: string; rest: boolean; exercises: HistoryExercise[] };
type HistoryItem = { date: string; active?: boolean; timer?: number; workout: HistoryWorkoutDay };

export default function HistoryWorkoutCard({
                                               workout,
                                               idx,
                                               selected,
                                               onToggle,
                                               formatDate,
                                               formatDuration,
                                               getTotalVolume,
                                               getTotalSets,
                                           }: {
    workout: HistoryItem;
    idx: number;
    selected: boolean;
    onToggle: (idx: number) => void;
    formatDate: (s: string) => string;
    formatDuration: (n?: number) => string | null;
    getTotalVolume: (ex: HistoryExercise[]) => number;
    getTotalSets: (ex: HistoryExercise[]) => number;
}) {
    const volume = getTotalVolume(workout.workout?.exercises || []);
    const sets = getTotalSets(workout.workout?.exercises || []);
    const duration = formatDuration(workout.timer);
    const exCount = workout.workout?.exercises?.length || 0;

    return (
        <div
            className={cn(
                "rounded-2xl bg-card border border-border overflow-hidden transition-all",
                selected && "ring-2 ring-primary"
            )}
        >
            <button
                onClick={() => onToggle(idx)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-primary-foreground"/>
                    </div>

                    <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold truncate">
                            {formatDate(workout.date)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4"/>
                  {duration ?? "—"}
              </span>
                            <span>{exCount} exercises</span>
                            <span className="hidden sm:inline truncate">• {workout.workout?.muscles}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                        <p className="font-display text-lg font-semibold">{volume.toLocaleString()} kg</p>
                        <p className="text-sm text-muted-foreground">Total Volume</p>
                    </div>

                    <ChevronRight
                        className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform",
                            selected && "rotate-90"
                        )}
                    />
                </div>
            </button>

            {selected && (
                <div className="px-6 pb-6 animate-fade-in">
                    <div className="border-t border-border pt-6">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <Stat title={String(exCount)} label="Exercises"/>
                            <Stat title={String(sets)} label="Sets"/>
                            <Stat title={volume.toLocaleString()} label="Volume (kg)"/>
                        </div>

                        <div className="space-y-4">
                            {(workout.workout?.exercises || []).map((ex, exIdx) => (
                                <div
                                    key={`${ex.name}-${exIdx}`}
                                    className="p-4 rounded-2xl bg-accent/20 border border-border"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                    <span
                        className="h-8 w-8 rounded-xl bg-background flex items-center justify-center text-sm font-semibold">
                      {exIdx + 1}
                    </span>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold truncate">{ex.name}</h4>
                                            <p className="text-sm text-muted-foreground">{ex.data?.length || 0} sets</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-muted-foreground">Set</span>
                                        <span className="text-muted-foreground">Weight</span>
                                        <span className="text-muted-foreground">Reps</span>

                                        {ex.data?.map((s, i) => (
                                            <React.Fragment key={`${ex.name}-row-${i}`}>
                                                <span className="font-medium">{i + 1}</span>
                                                <span>{Number(s.weight || 0)} kg</span>
                                                <span>{Number(s.reps || 0)}</span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({title, label}: { title: string; label: string }) {
    return (
        <div className="p-4 rounded-xl bg-accent/30 text-center">
            <p className="font-display text-2xl font-bold">{title}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}