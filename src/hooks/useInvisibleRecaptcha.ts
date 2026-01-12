"use client";

import * as React from "react";
import {RecaptchaVerifier} from "firebase/auth";
import {firebaseAuth} from "@/lib/firebase/client";

/**
 * Important:
 * - creates verifier once
 * - DOES NOT clear/remove it
 * - expects container to always exist in DOM
 */
export function useInvisibleRecaptcha(containerId: string) {
    const ref = React.useRef<RecaptchaVerifier | null>(null);

    React.useEffect(() => {
        if (ref.current) return;
        ref.current = new RecaptchaVerifier(firebaseAuth, containerId, {size: "invisible"});
    }, [containerId]);

    return ref;
}