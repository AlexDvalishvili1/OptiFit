// src/lib/diet/types.ts

export type DietFood = {
    name: string;
    serving: string;
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
};

export type DietMeal = {
    name: string;
    time: string; // "08:00"
    foods: DietFood[];
};

export type DietPlan = {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    meals: DietMeal[];
};

export type MacroTotals = {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
};