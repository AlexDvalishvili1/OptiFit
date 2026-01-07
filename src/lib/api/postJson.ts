// src/lib/api/postJson.ts

export async function postJson<TData = unknown, TBody = unknown>(url: string, body: TBody) {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
    });

    let data: TData | null = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    return {res, data};
}