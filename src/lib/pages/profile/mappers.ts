import type {MeUser, ProfileFormData} from "./types";

function normalizeActivity(v: unknown): ProfileFormData["activityLevel"] | undefined {
    if (v === "very active") return "very_active";
    if (v === "sedentary" || v === "light" || v === "moderate" || v === "very_active") return v;
    return undefined;
}

function toNumberOrEmptyFromUser(v: unknown): number | "" {
    if (typeof v !== "number") return "";
    if (!Number.isFinite(v) || v <= 0) return "";
    return v;
}

export function userToFormData(user: Exclude<MeUser, null>, prev: ProfileFormData): ProfileFormData {
    const dobRaw =
        (typeof user.dob === "string" ? user.dob : null) ??
        (typeof user.dateOfBirth === "string" ? user.dateOfBirth : null);

    // input[type=date] prefers "YYYY-MM-DD"
    const dob = dobRaw ? dobRaw.slice(0, 10) : "";

    const activityRaw = user.activity ?? user.activityLevel;
    const goalRaw = user.goal ?? user.fitnessGoal;

    return {
        ...prev,
        name: typeof user.name === "string" ? user.name : "",
        gender: (user.gender ?? undefined) as ProfileFormData["gender"],
        dateOfBirth: dob,
        height: toNumberOrEmptyFromUser(user.height),
        weight: toNumberOrEmptyFromUser(user.weight),
        activityLevel: normalizeActivity(activityRaw),
        fitnessGoal: (goalRaw ?? undefined) as ProfileFormData["fitnessGoal"],
        allergies: Array.isArray(user.allergies) ? user.allergies.filter((x): x is string => typeof x === "string") : [],
    };
}

export function formDataToPatchPayload(form: ProfileFormData) {
    const height = form.height === "" ? null : form.height > 0 ? form.height : null;
    const weight = form.weight === "" ? null : form.weight > 0 ? form.weight : null;

    return {
        name: form.name.trim() || null,
        gender: form.gender ?? null,

        // Backend expects `dob`
        dob: form.dateOfBirth || null,

        height,
        weight,

        // Backend expects `activity` / `goal`
        activity: form.activityLevel ?? null,
        goal: form.fitnessGoal ?? null,

        allergies: form.allergies,
    };
}