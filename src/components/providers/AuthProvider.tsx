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

    const refresh = React.useCallback(async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/auth/me", {credentials: "include"});
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setUser(null);
                return;
            }

            setUser(json?.user ?? json ?? null);
        } finally {
            setLoading(false);
        }
    }, []);

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