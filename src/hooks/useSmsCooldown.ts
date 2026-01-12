"use client";

import * as React from "react";
import {COOLDOWN_KEY, nowSec} from "@/lib/pages/register/utils";

export function useSmsCooldown() {
    const [cooldown, setCooldown] = React.useState(0);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(COOLDOWN_KEY);
            if (!raw) return;
            const until = Number(raw);
            if (!Number.isFinite(until)) return;

            const left = until - nowSec();
            if (left > 0) setCooldown(left);
            else localStorage.removeItem(COOLDOWN_KEY);
        } catch {
            // ignore
        }
    }, []);

    const startCooldown = React.useCallback((seconds: number) => {
        const s = Math.max(0, Math.floor(seconds));
        setCooldown(s);
        try {
            if (s > 0) localStorage.setItem(COOLDOWN_KEY, String(nowSec() + s));
            else localStorage.removeItem(COOLDOWN_KEY);
        } catch {
            // ignore
        }
    }, []);

    React.useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    return {cooldown, startCooldown, setCooldown};
}
