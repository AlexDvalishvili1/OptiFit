"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import type {AuthUser} from "@/lib/auth/types";

type AuthContextValue = {
    user: AuthUser;
    loading: boolean;
    refresh: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<AuthUser>>;
};

const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: true,
    refresh: async () => {
    },
    setUser: () => {
    },
});

function sleep(ms: number) {
    return new Promise<void>((res) => setTimeout(res, ms));
}

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);

        // After Set-Cookie (register/login), the very next request may race the cookie write.
        // A couple of short retries fixes the "blank dashboard until reload" issue.
        const attempts = 3;

        try {
            for (let i = 0; i < attempts; i++) {
                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                    cache: "no-store",
                }).catch(() => null);

                if (res?.ok) {
                    const json = await res.json().catch(() => ({} as any));
                    if (json?.user) {
                        setUser(json.user);
                        return;
                    }
                } else {
                    // even if non-2xx, try to read payload (optional)
                    // const json = await res?.json().catch(() => ({}));
                }

                if (i < attempts - 1) {
                    await sleep(120);
                    continue;
                }

                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{user, loading, refresh, setUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}