// src/lib/dashboard/date.ts

export function todayWeekday() {
    return new Date().toLocaleDateString("en-US", {weekday: "long"});
}

export function parseISODate(s: string) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfWeekMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function endOfWeekSunday(d: Date) {
    const start = startOfWeekMonday(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}