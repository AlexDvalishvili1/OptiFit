// src/lib/profile/types.ts

export type MeUser = {
    id: string;
    name?: string;
    email: string;
    phone: string;
    gender?: "male" | "female";
    dob?: string;
    height?: number;
    weight?: number;
    activity?: string;
    goal?: string;
    allergies?: string[];
    advanced?: boolean;
} | null;

export type ProfileFormData = {
    name: string;
    email: string;
    gender: undefined | "male" | "female";
    dateOfBirth: string; // yyyy-mm-dd
    height: number;
    weight: number;
    activityLevel: string | undefined;
    fitnessGoal: string | undefined;
    allergies: string[];
};