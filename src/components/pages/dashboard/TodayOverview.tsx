"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ChevronRight, Dumbbell, Utensils} from "lucide-react";

type TodayWorkout = {
    rest: boolean;
    muscles: string;
    exercises: { name: string; sets: string; reps: string }[];
} | null;

type Meal = {
    id?: string;
    name: string;
    type: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export default function TodayOverview({
                                          today,
                                          planExists,
                                          todayWorkout,
                                          dietExists,
                                          dailyCalories,
                                          meals,
                                          totals,
                                      }: {
    today: string;
    planExists: boolean;
    todayWorkout: TodayWorkout;
    dietExists: boolean;
    dailyCalories: number;
    meals: Meal[];
    totals: { protein: number; carbs: number; fat: number };
}) {
    const showWorkout =
        todayWorkout && !todayWorkout.rest && todayWorkout.exercises.length > 0;

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Workout */}
            <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <div>
                            <h2 className="font-display text-lg font-semibold">Today&apos;s Workout</h2>
                            <p className="text-sm text-muted-foreground">{today}</p>
                        </div>
                    </div>
                    <Link href="/training" className="text-primary hover:underline text-sm font-medium">
                        View All
                    </Link>
                </div>

                {showWorkout ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
                            <div>
                                <p className="font-semibold">{todayWorkout!.muscles}</p>
                                <p className="text-sm text-muted-foreground">
                                    {todayWorkout!.exercises.length} exercises
                                </p>
                            </div>
                            <Link href="/notebook">
                                <Button size="sm">
                                    Start <ChevronRight className="ml-1 h-4 w-4"/>
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {todayWorkout!.exercises.slice(0, 3).map((ex, idx) => (
                                <div
                                    key={`${ex.name}-${idx}`}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                                >
                                    <span className="text-sm">{ex.name}</span>
                                    <span className="text-sm text-muted-foreground">
                    {ex.sets} × {ex.reps}
                  </span>
                                </div>
                            ))}

                            {todayWorkout!.exercises.length > 3 && (
                                <p className="text-sm text-muted-foreground text-center pt-2">
                                    +{todayWorkout!.exercises.length - 3} more exercises
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                            {planExists ? "Rest day - enjoy your recovery!" : "No program yet - generate one in Training."}
                        </p>
                        <Link href="/training">
                            <Button variant="outline">{planExists ? "View Weekly Plan" : "Go to Training"}</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Diet */}
            <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <div>
                            <h2 className="font-display text-lg font-semibold">Today&apos;s Nutrition</h2>
                            <p className="text-sm text-muted-foreground">
                                {dailyCalories ? `${dailyCalories} kcal target` : "No diet plan yet"}
                            </p>
                        </div>
                    </div>
                    <Link href="/diet" className="text-primary hover:underline text-sm font-medium">
                        View All
                    </Link>
                </div>

                {dietExists && meals.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {meals.slice(0, 4).map((meal, i) => (
                                <div
                                    key={meal.id ?? `${meal.name}-${i}`}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium capitalize">{meal.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{meal.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{meal.calories} kcal</p>
                                        <p className="text-xs text-muted-foreground">
                                            P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-border">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="font-display text-xl font-bold text-primary">{totals.protein}g</p>
                                    <p className="text-xs text-muted-foreground">Protein</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-primary">{totals.carbs}g</p>
                                    <p className="text-xs text-muted-foreground">Carbs</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-primary">{totals.fat}g</p>
                                    <p className="text-xs text-muted-foreground">Fat</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No meals found in your diet plan yet.</p>
                        <Link href="/diet">
                            <Button variant="outline">Go to Diet</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}