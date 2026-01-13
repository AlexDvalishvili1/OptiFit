export type PreflightFail = { error?: string; retryAfter?: number };
export type CommitOk = { retryAfter?: number };
export type RegisterFail = { error?: string };

async function safeJson<T>(res: Response): Promise<T | {}> {
    try {
        return (await res.json()) as T;
    } catch {
        return {};
    }
}

export async function sendCodePreflight(phoneE164: string) {
    const res = await fetch("/api/auth/send-code-preflight", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({phoneE164}),
    });

    const json = (await safeJson<PreflightFail>(res)) as PreflightFail;
    return {ok: res.ok, status: res.status, json};
}

export async function sendCodeCommit(phoneE164: string) {
    const res = await fetch("/api/auth/send-code-commit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({phoneE164}),
    });

    const json = (await safeJson<CommitOk>(res)) as CommitOk;
    return {ok: res.ok, status: res.status, json};
}

export async function registerAccount(payload: {
    name: string;
    phone: string;
    password: string;
    firebaseIdToken: string;
}) {
    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
    });

    const json = (await safeJson<RegisterFail>(res)) as RegisterFail;
    return {ok: res.ok, status: res.status, json};
}