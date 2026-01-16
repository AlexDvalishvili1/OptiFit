// src/lib/profile/types.ts

export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active";
export type FitnessGoal = "lose weight" | "maintain" | "build muscle" | "improve endurance";

export type MeUser = {
    id: string;
    phone: string;
    name?: string | null;
    gender?: Gender | null;

    // Backend returns `dob` (ISO string). Keep `dateOfBirth` for backward compat.
    dob?: string | null;
    dateOfBirth?: string | null;

    height?: number | null;
    weight?: number | null;

    // Backend returns `activity`/`goal`. Keep UI names for backward compat.
    activity?: ActivityLevel | string | null;
    activityLevel?: ActivityLevel | null;

    goal?: FitnessGoal | string | null;
    fitnessGoal?: FitnessGoal | null;

    allergies?: string[] | null;
} | null;

export type ProfileFormData = {
    name: string;
    gender?: Gender;
    dateOfBirth: string; // "YYYY-MM-DD" (input[type=date])
    height: number | "";
    weight: number | "";
    activityLevel?: ActivityLevel;
    fitnessGoal?: FitnessGoal;
    allergies: string[];
};