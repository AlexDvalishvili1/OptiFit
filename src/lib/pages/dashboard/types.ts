// src/lib/dashboard/types.ts

export type DbUser = {
    name?: string;
    goal?: "lose weight" | "maintain" | "build muscle" | "improve endurance";
    activity?: "sedentary" | "light" | "moderate" | "very_active";
};

export type ProgramExercise = {
    name: string;
    sets: string;
    reps: string;
    instructions: string;
    video: string;
};

export type ProgramDay = {
    day: string;
    rest: boolean;
    muscles: string;
    exercises: ProgramExercise[];
};

export type ProgramWeek = ProgramDay[];

export type DietMealFlat = {
    id?: string;
    name: string;
    type: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type DietPlan = { calories: number; meals: DietMealFlat[] };

export type WorkoutHistoryItem = { date: string; active?: boolean; workout?: any; timer?: number };