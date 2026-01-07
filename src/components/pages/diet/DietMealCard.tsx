"use client";

import {Clock, Utensils} from "lucide-react";

export default function DietMealCard({
                                         meal,
                                         totals,
                                         index,
                                     }: {
    meal: any;
    totals: any;
    index: number;
}) {
    return (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                        <Utensils className="h-5 w-5"/>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4"/>
                            {meal.time}
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/40"/>
                            Meal {index + 1}
                        </div>
                        <h3 className="font-display text-lg font-semibold mt-1">{meal.name}</h3>
                    </div>
                </div>

                <div className="text-right">
                    <p className="font-display text-lg font-semibold">{totals.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">
                        P: {totals.protein}g · C: {totals.carbohydrates}g · F: {totals.fat}g
                    </p>
                </div>
            </div>

            <div className="border-t border-border p-6 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-muted-foreground">
                        <th>Food</th>
                        <th>Serving</th>
                        <th className="text-right">Cal</th>
                        <th className="text-right">P</th>
                        <th className="text-right">C</th>
                        <th className="text-right">F</th>
                    </tr>
                    </thead>
                    <tbody>
                    {meal.foods.map((f: any, i: number) => (
                        <tr key={`${f.name}-${i}`} className="border-t border-border/60">
                            <td className="py-3 font-medium">{f.name}</td>
                            <td className="py-3 text-muted-foreground">{f.serving}</td>
                            <td className="py-3 text-right">{f.calories}</td>
                            <td className="py-3 text-right">{f.protein}</td>
                            <td className="py-3 text-right">{f.carbohydrates}</td>
                            <td className="py-3 text-right">{f.fat}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}