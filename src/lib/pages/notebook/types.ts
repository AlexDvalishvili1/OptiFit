// src/lib/notebook/types.ts

export type ProgramExercise = {
    name: string;
    sets: string; // "4"
    reps: string; // "6-10"
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

/** What we store/send to your workout endpoints */
export type WorkoutSetData = {
    weight: number;
    reps: number;
};

export type ActiveExercise = {
    name: string;
    data: WorkoutSetData[];
};

export type ActiveWorkoutDay = {
    day: string;
    muscles: string;
    rest: boolean;
    exercises: ActiveExercise[];
};

export type ActiveWorkoutResponse =
    | null
    | {
    date: string;
    workout: ActiveWorkoutDay;
};