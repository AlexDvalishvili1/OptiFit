"use client";

import * as React from "react";
import type {RecaptchaVerifier} from "firebase/auth";
import {RecaptchaVerifier as FirebaseRecaptchaVerifier} from "firebase/auth";
import {firebaseAuth} from "@/lib/firebase/client";

/**
 * Creates invisible reCAPTCHA verifier exactly once per mount.
 * DOES NOT clear() manually (per project rule).
 * Waits for the container element to exist to avoid `Cannot read properties of null (reading 'style')`.
 */
export function useInvisibleRecaptcha(containerId: string) {
    const verifierRef = React.useRef<RecaptchaVerifier | null>(null);
    const renderPromiseRef = React.useRef<Promise<number> | null>(null);

    React.useEffect(() => {
        // already created
        if (verifierRef.current) return;

        let cancelled = false;

        const ensureContainerAndInit = () => {
            if (cancelled) return;

            const el = document.getElementById(containerId);

            // Container isn't in DOM yet -> retry next frame
            if (!el) {
                requestAnimationFrame(ensureContainerAndInit);
                return;
            }

            // Guard against double-init (StrictMode / fast refresh)
            if (verifierRef.current) return;

            // IMPORTANT: use the element itself (not just id string) to avoid timing issues
            const verifier = new FirebaseRecaptchaVerifier(firebaseAuth, el, {
                size: "invisible",
            });

            verifierRef.current = verifier;

            // Render once (Firebase touches `el.style` here)
            if (!renderPromiseRef.current) {
                renderPromiseRef.current = verifier.render();
            }
        };

        ensureContainerAndInit();

        return () => {
            cancelled = true;
            // No manual clear() per your rule.
            // verifierRef.current remains; on next mount a new hook instance is created anyway.
        };
    }, [containerId]);

    return verifierRef;
}