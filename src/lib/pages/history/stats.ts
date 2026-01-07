// src/lib/history/stats.ts

import type {HistoryExercise} from "./types";

export function getTotalVolume(exercises: HistoryExercise[]) {
    return exercises.reduce((total, ex) => {
        const v = ex.data.reduce(
            (s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0),
            0
        );
        return total + v;
    }, 0);
}

export function getTotalSets(exercises: HistoryExercise[]) {
    return exercises.reduce((total, ex) => total + (ex.data?.length || 0), 0);
}