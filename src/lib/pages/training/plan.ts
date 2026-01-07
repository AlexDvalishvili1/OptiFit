import type {ProgramDay, ProgramExercise, ProgramWeek} from "@/components/pages/training/types.ts";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type UnknownRecord = Record<string, unknown>;

function isObject(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function hasString(obj: UnknownRecord, key: string): obj is UnknownRecord & Record<typeof key, string> {
    return typeof obj[key] === "string";
}

function hasBoolean(obj: UnknownRecord, key: string): obj is UnknownRecord & Record<typeof key, boolean> {
    return typeof obj[key] === "boolean";
}

function isProgramExercise(x: unknown): x is ProgramExercise {
    if (!isObject(x)) return false;

    return (
        hasString(x, "name") &&
        hasString(x, "sets") &&
        hasString(x, "reps") &&
        hasString(x, "instructions") &&
        hasString(x, "video")
    );
}

function isProgramDay(x: unknown): x is ProgramDay {
    if (!isObject(x)) return false;

    if (!hasString(x, "day")) return false;
    if (!hasBoolean(x, "rest")) return false;
    if (!hasString(x, "muscles")) return false;

    const exercises: unknown = x["exercises"];
    if (!Array.isArray(exercises)) return false;
    if (!exercises.every(isProgramExercise)) return false;

    return true;
}

export function isValidProgramWeek(x: unknown): x is ProgramWeek {
    if (!Array.isArray(x) || x.length !== 7) return false;
    if (!x.every(isProgramDay)) return false;

    const set = new Set(x.map((d) => d.day));
    return DAYS.every((d) => set.has(d));
}

export function normalizeWeek(raw: unknown): ProgramWeek | null {
    const normalized = Array.isArray(raw) && raw.length === 1 && Array.isArray(raw[0]) ? raw[0] : raw;
    return isValidProgramWeek(normalized) ? normalized : null;
}

export function todayWeekday(): string {
    return new Date().toLocaleDateString("en-US", {weekday: "long"});
}