// src/lib/diet/parse.ts

import type {DietPlan} from "./types";

function isObj(x: unknown): x is Record<string, any> {
    return !!x && typeof x === "object";
}

function isStr(x: unknown): x is string {
    return typeof x === "string";
}

function isNum(x: unknown): x is number {
    return typeof x === "number" && Number.isFinite(x);
}

function stripJsonFences(raw: string) {
    // removes ```json ... ``` or ``` ... ```
    return raw
        .replace(/^\s*```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
}

export function isValidDietPlan(x: unknown): x is DietPlan {
    if (!isObj(x)) return false;

    if (!isNum(x.calories) || !isNum(x.protein) || !isNum(x.fat) || !isNum(x.carbohydrates)) return false;
    if (!Array.isArray(x.meals)) return false;

    return x.meals.every((m: any) => {
        if (!isObj(m)) return false;
        if (!isStr(m.name) || !isStr(m.time)) return false;
        if (!Array.isArray(m.foods)) return false;

        return m.foods.every((f: any) => {
            if (!isObj(f)) return false;
            return (
                isStr(f.name) &&
                isStr(f.serving) &&
                isNum(f.calories) &&
                isNum(f.protein) &&
                isNum(f.fat) &&
                isNum(f.carbohydrates)
            );
        });
    });
}

export function tryParseDietJson(raw: string): DietPlan | null {
    try {
        const cleaned = stripJsonFences(raw);
        const parsed = JSON.parse(cleaned);
        return isValidDietPlan(parsed) ? parsed : null;
    } catch {
        return null;
    }
}