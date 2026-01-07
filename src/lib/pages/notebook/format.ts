// src/lib/notebook/format.ts

export function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function safeNumber(v: string) {
    if (v === "") return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}