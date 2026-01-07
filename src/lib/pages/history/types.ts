// src/lib/history/types.ts

export type WorkoutSetData = {
    weight: number;
    reps: number;
};

export type HistoryExercise = {
    name: string;
    data: WorkoutSetData[];
};

export type HistoryWorkoutDay = {
    day: string;
    muscles: string;
    rest: boolean;
    exercises: HistoryExercise[];
};

export type HistoryItem = {
    date: string; // ISO date/time
    active?: boolean;
    timer?: number; // seconds
    workout: HistoryWorkoutDay;
};