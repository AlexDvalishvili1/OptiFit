export function todayISODateKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export const LS_KEYS = {
    modCount: (dayKey: string) => `optifit_training_mods_${dayKey}`,
};

export function getLocalNumber(key: string, fallback = 0) {
    try {
        const v = localStorage.getItem(key);
        if (!v) return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    } catch {
        return fallback;
    }
}

export function setLocalNumber(key: string, n: number) {
    try {
        localStorage.setItem(key, String(n));
        return true;
    } catch {
        return false;
    }
}