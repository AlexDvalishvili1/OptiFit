"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {Check, ChevronDown, ChevronUp, Dumbbell, Minus, Plus} from "lucide-react";

type WorkoutSetData = { weight: number; reps: number };
type ActiveExercise = { name: string; data: WorkoutSetData[] };

export default function ExerciseAccordion({
                                              ex,
                                              exIdx,
                                              open,
                                              onToggle,
                                              onAddSet,
                                              onRemoveSet,
                                              onUpdateSet,
                                              safeNumber,
                                          }: {
    ex: ActiveExercise;
    exIdx: number;
    open: boolean;
    onToggle: () => void;
    onAddSet: (exIdx: number) => void;
    onRemoveSet: (exIdx: number) => void;
    onUpdateSet: (exIdx: number, setIdx: number, patch: Partial<WorkoutSetData>) => void;
    safeNumber: (v: string) => number;
}) {
    return (
        <div className="rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-primary-foreground"/>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold truncate">{ex.name}</h3>
                        <p className="text-sm text-muted-foreground">{ex.data.length} sets</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Tap to log sets</span>
                    {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </div>
            </button>

            {open && (
                <div className="px-6 pb-6 animate-fade-in">
                    <div className="border-t border-border pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-muted-foreground">Enter weight & reps for each set</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onRemoveSet(exIdx)}
                                    disabled={ex.data.length <= 1}
                                >
                                    <Minus className="h-4 w-4"/>
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => onAddSet(exIdx)}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-2 px-4 text-xs font-medium text-muted-foreground">
                            <span>SET</span>
                            <span>WEIGHT</span>
                            <span>REPS</span>
                            <span className="text-center">DONE</span>
                        </div>

                        <div className="space-y-2">
                            {ex.data.map((s, setIdx) => {
                                const done = s.weight > 0 && s.reps > 0;

                                return (
                                    <div
                                        key={`${ex.name}-set-${setIdx}`}
                                        className={cn(
                                            "grid grid-cols-4 gap-3 items-center p-4 rounded-xl transition-colors",
                                            done ? "bg-success/10" : "bg-accent/30 hover:bg-accent/40"
                                        )}
                                    >
                                        <span className="font-medium">{setIdx + 1}</span>

                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            placeholder="0"
                                            className="h-10"
                                            value={Number.isFinite(s.weight) ? String(s.weight) : ""}
                                            onChange={(e) => {
                                                const n = safeNumber(e.target.value);
                                                onUpdateSet(exIdx, setIdx, {weight: Number.isNaN(n) ? 0 : n});
                                            }}
                                        />

                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            placeholder="0"
                                            className="h-10"
                                            value={Number.isFinite(s.reps) ? String(s.reps) : ""}
                                            onChange={(e) => {
                                                const n = safeNumber(e.target.value);
                                                onUpdateSet(exIdx, setIdx, {reps: Number.isNaN(n) ? 0 : Math.floor(n)});
                                            }}
                                        />

                                        <div className="flex justify-center">
                                            <div
                                                className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                                    done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                                                )}
                                                title={done ? "Completed" : "Fill weight & reps"}
                                            >
                                                <Check className="h-5 w-5"/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">Tip: keep form strict; don’t chase numbers.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}