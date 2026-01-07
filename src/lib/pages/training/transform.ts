import type {ActiveWorkoutDay, ProgramDay} from "@/components/pages/training/types.ts";

export function toActiveWorkoutDay(day: ProgramDay): ActiveWorkoutDay {
    return {
        day: day.day,
        muscles: day.muscles,
        rest: day.rest,
        exercises: (day.exercises || []).map((ex) => {
            const setsCount = Math.max(1, Number(ex.sets) || 1);
            return {
                name: ex.name,
                data: Array.from({length: setsCount}).map(() => ({weight: 0, reps: 0})),
            };
        }),
    };
}
