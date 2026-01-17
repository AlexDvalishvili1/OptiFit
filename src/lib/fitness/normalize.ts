export type CanonicalActivity = "sedentary" | "light" | "moderate" | "very_active";
export type CanonicalGoal = "lose weight" | "maintain" | "build muscle" | "improve endurance";

export function normalizeActivity(v: unknown): CanonicalActivity | null {
    if (typeof v !== "string") return null;
    const s = v.trim().toLowerCase();

    // canonical
    if (s === "sedentary" || s === "light" || s === "moderate" || s === "very_active") {
        return s as CanonicalActivity;
    }

    // legacy variants
    if (s === "very active" || s === "veryactive") return "very_active";
    if (s === "active") return "very_active";
    if (s === "bmr") return "sedentary";

    return null;
}

export function normalizeGoal(v: unknown): CanonicalGoal | null {
    if (typeof v !== "string") return null;
    const s = v.trim().toLowerCase();

    if (s === "lose weight" || s === "maintain" || s === "build muscle" || s === "improve endurance") {
        return s as CanonicalGoal;
    }

    if (s === "lose_weight") return "lose weight";
    if (s === "build_muscle") return "build muscle";
    if (s === "improve_endurance") return "improve endurance";

    return null;
}