export type RegisterStep = 1 | 2 | 3;

export const COOLDOWN_KEY = "optifit:smsCooldownUntil"; // epoch seconds
export const COOLDOWN_SECONDS = 60;

export function nowSec() {
    return Math.floor(Date.now() / 1000);
}

export function getErrInfo(err: unknown): { code: string; message: string } {
    if (typeof err === "object" && err !== null) {
        const anyErr = err as Record<string, unknown>;
        const code = typeof anyErr.code === "string" ? anyErr.code : "";
        const message = typeof anyErr.message === "string" ? anyErr.message : "";
        return {code, message};
    }
    return {code: "", message: ""};
}

export function isFirebaseExpectedCode(code: string) {
    return (
        code.includes("auth/invalid-verification-code") ||
        code.includes("auth/code-expired") ||
        code.includes("auth/missing-verification-code") ||
        code.includes("auth/session-expired")
    );
}

export function maskedPhone(p: string) {
    if (!p) return "";
    const clean = p.trim();
    if (clean.length <= 6) return clean;
    return `${clean.slice(0, 4)}******${clean.slice(-3)}`;
}