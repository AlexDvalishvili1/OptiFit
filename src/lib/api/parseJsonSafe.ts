// src/lib/api/parseJsonSafe.ts

export function parseJsonSafe(res: string) {
    try {
        return JSON.parse(res);
    } catch {
        return null;
    }
}