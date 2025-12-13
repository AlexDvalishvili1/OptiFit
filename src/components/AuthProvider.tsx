"use client";

import React, {createContext, useContext, useEffect, useState} from "react";

type AuthUser = { id: string; name?: string; email: string; phone: string } | null;

const AuthContext = createContext<{
    user: AuthUser;
    loading: boolean;
    refresh: () => Promise<void>;
}>({
    user: null, loading: true, refresh: async () => {
    }
});

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/me", {credentials: "include"});
            const json = await res.json();
            setUser(json.user ?? null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <AuthContext.Provider value={{user, loading, refresh}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}