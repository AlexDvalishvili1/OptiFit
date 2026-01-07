// src/lib/history/format.ts

export function formatDate(dateString: string) {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatDuration(timerSeconds?: number) {
    if (!timerSeconds || timerSeconds <= 0) return null;
    const mins = Math.round(timerSeconds / 60);
    return `${mins} min`;
}