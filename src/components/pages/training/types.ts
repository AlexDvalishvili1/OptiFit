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

/** Payload shape your startWorkout backend expects: reqBody.day */
export type WorkoutSetData = { weight: number; reps: number };
export type ActiveExercise = { name: string; data: WorkoutSetData[] };
export type ActiveWorkoutDay = {
    day: string;
    muscles: string;
    rest: boolean;
    exercises: ActiveExercise[];
};