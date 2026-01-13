export type SignInFail = { error?: string };

async function safeJson<T>(res: Response): Promise<T | object> {
    try {
        return (await res.json()) as T;
    } catch {
        return {};
    }
}

export async function signInWithPhone(payload: { phone: string; password: string }) {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
    });

    const json = (await safeJson<SignInFail>(res)) as SignInFail;
    return {ok: res.ok, status: res.status, json};
}