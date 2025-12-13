export function normalizePhone(raw: string): string {
    if (!raw) return "";

    const v = raw.trim();
    if (!v) return "";

    const hasPlus = v.startsWith("+");
    const digits = v.replace(/\D/g, ""); // remove all non-digits

    if (!digits) return "";

    return hasPlus ? `+${digits}` : digits;
}