// src/lib/api/readJsonSafe.ts

export async function readJsonSafe(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}