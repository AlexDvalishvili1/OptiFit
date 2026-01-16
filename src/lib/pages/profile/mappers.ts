import type {MeUser, ProfileFormData} from "./types";

function hasOwn(obj: object, key: string) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizeActivity(v: unknown): ProfileFormData["activityLevel"] | undefined {
    if (v === "very active") return "very_active";
    if (v === "sedentary" || v === "light" || v === "moderate" || v === "very_active") return v;
    return undefined;
}

function normalizeGoal(v: unknown): ProfileFormData["fitnessGoal"] | undefined {
    if (v === "lose weight" || v === "maintain" || v === "build muscle" || v === "improve endurance") return v;
    return undefined;
}

function toDateInputValue(v: unknown): string {
    if (typeof v !== "string") return "";
    return v ? v.slice(0, 10) : "";
}

function toNumberOrEmptyFromUser(v: unknown): number | "" {
    if (typeof v !== "number") return "";
    if (!Number.isFinite(v) || v <= 0) return "";
    return v;
}

export function userToFormData(user: Exclude<MeUser, null>, prev: ProfileFormData): ProfileFormData {
    // start from prev so we can selectively overwrite only when data is present
    const next: ProfileFormData = {...prev};

    // name: safe to overwrite always
    next.name = typeof user.name === "string" ? user.name : "";

    // gender: overwrite only if key exists in user
    if (hasOwn(user, "gender")) {
        next.gender = (user.gender ?? undefined) as ProfileFormData["gender"];
    }

    // DOB: backend may use dob/dateOfBirth. Overwrite only if key exists.
    const hasDob = hasOwn(user, "dob") || hasOwn(user, "dateOfBirth");
    if (hasDob) {
        const dobRaw =
            (typeof user.dob === "string" ? user.dob : null) ??
            (typeof user.dateOfBirth === "string" ? user.dateOfBirth : null);

        next.dateOfBirth = dobRaw ? toDateInputValue(dobRaw) : "";
    }

    // height/weight: overwrite only if key exists (null clears, number sets)
    if (hasOwn(user, "height")) next.height = toNumberOrEmptyFromUser(user.height);
    if (hasOwn(user, "weight")) next.weight = toNumberOrEmptyFromUser(user.weight);

    // activity level: backend may use activity/activityLevel. Overwrite only if either key exists
    const hasActivity = hasOwn(user, "activity") || hasOwn(user, "activityLevel");
    if (hasActivity) {
        const activityRaw = (user.activity ?? user.activityLevel) as unknown;
        next.activityLevel = normalizeActivity(activityRaw);
    }

    // fitness goal: backend may use goal/fitnessGoal. Overwrite only if either key exists
    const hasGoal = hasOwn(user, "goal") || hasOwn(user, "fitnessGoal");
    if (hasGoal) {
        const goalRaw = (user.goal ?? user.fitnessGoal) as unknown;
        next.fitnessGoal = normalizeGoal(goalRaw);
    }

    // allergies: overwrite only if key exists (null clears to [])
    if (hasOwn(user, "allergies")) {
        next.allergies = Array.isArray(user.allergies)
            ? user.allergies.filter((x): x is string => typeof x === "string")
            : [];
    }

    return next;
}

export function formDataToPatchPayload(form: ProfileFormData) {
    const height = form.height === "" ? null : form.height > 0 ? form.height : null;
    const weight = form.weight === "" ? null : form.weight > 0 ? form.weight : null;

    return {
        name: form.name.trim() || null,
        gender: form.gender ?? null,

        // backend expects dob/activity/goal
        dob: form.dateOfBirth || null,
        height,
        weight,
        activity: form.activityLevel ?? null,
        goal: form.fitnessGoal ?? null,

        allergies: form.allergies,
    };
}