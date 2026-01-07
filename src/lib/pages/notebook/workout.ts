// src/lib/notebook/workout.ts

import type {ActiveExercise, ActiveWorkoutDay, ProgramWeek, WorkoutSetData} from "./types";
import {todayWeekday} from "./training";

export function makeDefaultWorkoutFromToday(planWeek: ProgramWeek): ActiveWorkoutDay | null {
    const today = todayWeekday();
    const day = planWeek.find((d) => d.day === today);
    if (!day || day.rest || !day.exercises?.length) return null;

    const exercises: ActiveExercise[] = day.exercises.map((ex) => {
        const setsCount = Math.max(1, Number(ex.sets) || 1);
        return {
            name: ex.name,
            data: Array.from({length: setsCount}).map(() => ({weight: 0, reps: 0})),
        };
    });

    return {
        day: day.day,
        muscles: day.muscles,
        rest: false,
        exercises,
    };
}

export function validateWorkoutBeforeSave(day: ActiveWorkoutDay) {
    for (const ex of day.exercises) {
        for (const s of ex.data) {
            const keys = Object.keys(s) as (keyof WorkoutSetData)[];
            for (const k of keys) {
                const v = s[k];
                if (v === null || v === undefined) return "Invalid input";
                if (Number.isNaN(v)) return "Invalid input";
                if (typeof v !== "number") return "Invalid input";
                if (v < 0) return "Invalid input";
            }
        }
    }
    return null;
}