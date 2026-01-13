// src/lib/profile/mappers.ts

import type {MeUser, ProfileFormData} from "./types";

export function userToFormData(user: NonNullable<MeUser>, prev: ProfileFormData): ProfileFormData {
    return {
        ...prev,
        name: user.name ?? "",
        gender: user.gender ?? undefined,
        dateOfBirth: user.dob ? String(user.dob).slice(0, 10) : "",
        height: typeof user.height === "number" ? user.height : prev.height,
        weight: typeof user.weight === "number" ? user.weight : prev.weight,
        activityLevel: user.activity ?? prev.activityLevel,
        fitnessGoal: user.goal ?? prev.fitnessGoal,
        allergies: Array.isArray(user.allergies) ? user.allergies : prev.allergies,
    };
}

export function formDataToPatchPayload(formData: ProfileFormData) {
    return {
        name: formData.name.trim(),
        gender: formData.gender,
        dob: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        height: Number(formData.height),
        weight: Number(formData.weight),
        activity: formData.activityLevel,
        goal: formData.fitnessGoal,
        allergies: formData.allergies,
    };
}