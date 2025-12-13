"use client";

import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    isDark: boolean;
    mounted: boolean;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "optifit_theme"; // "light" | "dark"

function applyThemeToDom(theme: Theme) {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
}

function setCookieTheme(theme: Theme) {
    // Optional: keeps it in cookies too (for later SSR if you want)
    // 400 days expiry
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 400}`;
}

export function ThemeProvider({children}: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Mount: read saved theme
    useEffect(() => {
        try {
            const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? null;

            if (saved === "dark" || saved === "light") {
                setThemeState(saved);
                applyThemeToDom(saved);
            } else {
                // Optional default: match system
                const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
                const initial: Theme = prefersDark ? "dark" : "light";
                setThemeState(initial);
                applyThemeToDom(initial);
                localStorage.setItem(STORAGE_KEY, initial);
                setCookieTheme(initial);
            }
        } catch {
            // ignore
        } finally {
            setMounted(true);
        }
    }, []);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        if (typeof window !== "undefined") {
            applyThemeToDom(t);
            try {
                localStorage.setItem(STORAGE_KEY, t);
            } catch {
                // ignore
            }
            setCookieTheme(t); // optional
        }
    };

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            isDark: theme === "dark",
            mounted,
            setTheme,
            toggleTheme,
        }),
        [theme, mounted]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}