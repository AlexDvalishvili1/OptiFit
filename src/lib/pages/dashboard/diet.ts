// src/lib/dashboard/diet.ts
import type {DietMealFlat, DietPlan} from "./types";

type UnknownRecord = Record<string, unknown>;

function isObject(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function toNumber(v: unknown): number {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : NaN;
}

function toString(v: unknown, fallback = ""): string {
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return fallback;
}

function getRecordField(obj: UnknownRecord, key: string): unknown {
    return obj[key];
}

function sumFoods(foods: unknown): { calories: number; protein: number; carbs: number; fat: number } | null {
    if (!Array.isArray(foods) || foods.length === 0) return null;

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    for (const f of foods) {
        if (!isObject(f)) continue;

        calories += toNumber(getRecordField(f, "calories")) || 0;
        protein += toNumber(getRecordField(f, "protein")) || 0;
        fat += toNumber(getRecordField(f, "fat")) || 0;

        const c =
            toNumber(getRecordField(f, "carbohydrates")) ||
            toNumber(getRecordField(f, "carbs")) ||
            0;
        carbs += c;
    }

    return {
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
    };
}

export function normalizeDiet(rawInput: unknown): DietPlan | null {
    if (rawInput == null) return null;

    let raw: unknown = rawInput;

    if (typeof raw === "string") {
        try {
            raw = JSON.parse(raw) as unknown;
        } catch {
            return null;
        }
    }

    if (!isObject(raw)) return null;

    const calories =
        toNumber(getRecordField(raw, "calories")) ||
        toNumber(getRecordField(raw, "dailyCalories")) ||
        toNumber(getRecordField(raw, "targetCalories")) ||
        NaN;

    if (!Number.isFinite(calories)) return null;

    const mealsRaw = getRecordField(raw, "meals");
    if (!Array.isArray(mealsRaw)) return {calories, meals: []};

    const meals: DietMealFlat[] = mealsRaw
        .map((meal, idx): DietMealFlat | null => {
            if (!isObject(meal)) return null;

            const name = toString(getRecordField(meal, "name"), `Meal ${idx + 1}`);

            const type =
                toString(getRecordField(meal, "type")) ||
                toString(getRecordField(meal, "mealType")) ||
                name ||
                "meal";

            const foodsTotals = sumFoods(getRecordField(meal, "foods"));
            if (foodsTotals) {
                const id = getRecordField(meal, "id");
                return {
                    id: typeof id === "string" ? id : undefined,
                    name,
                    type,
                    ...foodsTotals,
                };
            }

            const c = toNumber(getRecordField(meal, "calories"));
            if (!Number.isFinite(c)) return null;

            const id = getRecordField(meal, "id");

            return {
                id: typeof id === "string" ? id : undefined,
                name,
                type,
                calories: c,
                protein: toNumber(getRecordField(meal, "protein")) || 0,
                carbs:
                    toNumber(getRecordField(meal, "carbohydrates")) ||
                    toNumber(getRecordField(meal, "carbs")) ||
                    0,
                fat: toNumber(getRecordField(meal, "fat")) || 0,
            };
        })
        .filter((m): m is DietMealFlat => m !== null);

    return {calories, meals};
}