"use client";

import * as React from "react";
import {COOLDOWN_KEY, nowSec} from "@/lib/pages/register/utils";

export function useSmsCooldown(storageKey: string = COOLDOWN_KEY) {
    const [cooldown, setCooldown] = React.useState(0);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const until = Number(raw);
            if (!Number.isFinite(until)) return;

            const left = until - nowSec();
            if (left > 0) setCooldown(left);
            else localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }
    }, [storageKey]);

    const startCooldown = React.useCallback((seconds: number) => {
        const s = Math.max(0, Math.floor(seconds));
        setCooldown(s);

        try {
            if (s > 0) localStorage.setItem(storageKey, String(nowSec() + s));
            else localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }
    }, [storageKey]);

    React.useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    return {cooldown, startCooldown, setCooldown};
}