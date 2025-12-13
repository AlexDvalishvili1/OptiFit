"use client";

import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeCtx = {
    mode: ThemeMode;
    resolvedTheme: "light" | "dark";
    setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function getSystemTheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
    const resolved = mode === "system" ? getSystemTheme() : mode;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.dataset.theme = resolved;
    return resolved;
}

export default function ThemeProviderClient({
                                                initialMode,
                                                children,
                                            }: {
    initialMode: ThemeMode;
    children: React.ReactNode;
}) {
    const [mode, setModeState] = useState<ThemeMode>(initialMode);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    // Apply on mount + whenever mode changes
    useEffect(() => {
        setResolvedTheme(applyTheme(mode));
    }, [mode]);

    // If mode=system, keep listening to OS changes
    useEffect(() => {
        if (mode !== "system") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => setResolvedTheme(applyTheme("system"));

        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
            else mq.removeListener(onChange);
        };
    }, [mode]);

    const setMode = async (m: ThemeMode) => {
        setModeState(m);

        // persist in cookie (works across refresh + new sessions)
        await fetch("/api/theme", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({mode: m}),
        }).catch(() => {
        });

        // optional: localStorage too (not required)
        try {
            localStorage.setItem("theme", m);
        } catch {
        }
    };

    const value = useMemo(
        () => ({mode, resolvedTheme, setMode}),
        [mode, resolvedTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProviderClient");
    return ctx;
}