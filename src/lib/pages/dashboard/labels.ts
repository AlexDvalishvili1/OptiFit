// src/lib/dashboard/labels.ts

import type {DbUser} from "./types";

export const goalLabels: Record<NonNullable<DbUser["goal"]>, string> = {
    "lose weight": "Lose Weight",
    maintain: "Maintain",
    "build muscle": "Build Muscle",
    "improve endurance": "Improve Endurance",
};

export const activityLabels: Record<NonNullable<DbUser["activity"]>, string> = {
    bmr: "BMR",
    sedentary: "Sedentary",
    light: "Lightly Active",
    moderate: "Moderately Active",
    active: "Active",
    "very active": "Very Active",
};