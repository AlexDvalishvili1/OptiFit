import {parsePhoneNumberFromString} from "libphonenumber-js";

/**
 * Returns strict E.164 phone like "+995568740497" or "" if invalid.
 * Deterministic: same real phone => same string.
 */
export function normalizePhoneE164(input: string): string {
    const raw = (input ?? "").trim();
    if (!raw) return "";

    const parsed = parsePhoneNumberFromString(raw);
    if (!parsed) return "";
    if (!parsed.isValid()) return "";

    // E.164 with + prefix
    const e164 = parsed.number; // already E.164
    return typeof e164 === "string" && e164.startsWith("+") ? e164 : "";
}

/** Quick “looks like E.164” guard for server inputs */
export function isProbablyE164(input: string): boolean {
    return /^\+\d{6,15}$/.test(input.trim());
}