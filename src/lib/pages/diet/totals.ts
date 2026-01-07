// src/lib/diet/totals.ts

import type {DietPlan, MacroTotals} from "./types";

export function calcMealTotals(plan: DietPlan): MacroTotals[] {
    return plan.meals.map((m) => {
        return m.foods.reduce<MacroTotals>(
            (acc, f) => {
                acc.calories += Number(f.calories) || 0;
                acc.protein += Number(f.protein) || 0;
                acc.fat += Number(f.fat) || 0;
                acc.carbohydrates += Number(f.carbohydrates) || 0;
                return acc;
            },
            {calories: 0, protein: 0, fat: 0, carbohydrates: 0}
        );
    });
}