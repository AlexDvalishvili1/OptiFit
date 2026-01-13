export type Fail = { error?: string; retryAfter?: number };

async function safeJson<T>(res: Response): Promise<T | {}> {
    try {
        return (await res.json()) as T;
    } catch {
        return {};
    }
}

export async function resetPreflight(phoneE164: string) {
    const res = await fetch("/api/auth/reset/send-code-preflight", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({phoneE164}),
    });

    const json = (await safeJson<Fail>(res)) as Fail;
    return {ok: res.ok, status: res.status, json};
}

export async function resetCommit(phoneE164: string) {
    const res = await fetch("/api/auth/reset/send-code-commit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({phoneE164}),
    });

    const json = (await safeJson<Fail>(res)) as Fail;
    return {ok: res.ok, status: res.status, json};
}

export async function resetPassword(payload: {
    phone: string; // E.164
    newPassword: string;
    firebaseIdToken: string;
}) {
    const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
    });

    const json = (await safeJson<Fail>(res)) as Fail;
    return {ok: res.ok, status: res.status, json};
}