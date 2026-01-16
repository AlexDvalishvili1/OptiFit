"use client";

import * as React from "react";
import {signInWithPhoneNumber, type ConfirmationResult} from "firebase/auth";

import {firebaseAuth} from "@/lib/firebase/client";
import {useInvisibleRecaptcha} from "@/hooks/useInvisibleRecaptcha";
import {useSmsCooldown} from "@/hooks/useSmsCooldown";
import {normalizePhoneE164} from "@/lib/pages/register/phone/normalize";
import {COOLDOWN_SECONDS, getErrInfo} from "@/lib/pages/register/utils";

export type PhoneChangeStep = 1 | 2 | 3;

const COOLDOWN_KEY_CURRENT = "optifit:smsCooldownUntil:phoneChange:current"; // epoch seconds
const COOLDOWN_KEY_NEW = "optifit:smsCooldownUntil:phoneChange:new";

async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json", Accept: "application/json"},
        credentials: "include",
        body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as any;
    return {ok: res.ok, status: res.status, json};
}

export function usePhoneChangeFlow(currentPhone: string) {
    const recaptchaRef = useInvisibleRecaptcha("recaptcha-phone-change");
    const confirmRef = React.useRef<ConfirmationResult | null>(null);

    const {cooldown: cooldownCurrent, startCooldown: startCooldownCurrent} = useSmsCooldown(COOLDOWN_KEY_CURRENT);
    const {cooldown: cooldownNew, startCooldown: startCooldownNew} = useSmsCooldown(COOLDOWN_KEY_NEW);

    const [step, setStep] = React.useState<PhoneChangeStep>(1);
    const [busy, setBusy] = React.useState(false);

    // one OTP state is ok (we reset between stages)
    const [otp, setOtp] = React.useState("");
    const [newPhoneRaw, setNewPhoneRaw] = React.useState("");
    const [currentToken, setCurrentToken] = React.useState("");

    const newPhoneE164 = React.useMemo(() => normalizePhoneE164(newPhoneRaw), [newPhoneRaw]);
    const currentPhoneE164 = React.useMemo(() => normalizePhoneE164(currentPhone), [currentPhone]);

    const reset = React.useCallback(() => {
        setStep(1);
        setBusy(false);
        setOtp("");
        setNewPhoneRaw("");
        setCurrentToken("");
        confirmRef.current = null;
    }, []);

    const sendViaFirebase = React.useCallback(async (phoneE164: string) => {
        const verifier = recaptchaRef.current;
        if (!verifier) throw new Error("reCAPTCHA not ready");
        confirmRef.current = await signInWithPhoneNumber(firebaseAuth, phoneE164, verifier);
    }, [recaptchaRef]);

    const startVerifyCurrent = React.useCallback(async () => {
        if (!currentPhoneE164) throw new Error("Invalid current phone");
        if (cooldownCurrent > 0) return;

        setOtp("");
        confirmRef.current = null;

        // ✅ preflight (DB cooldown + auth checks)
        const pre = await postJson("/api/profile/phone/send-code-preflight", {
            phoneE164: currentPhoneE164,
            kind: "current"
        });
        if (!pre.ok) {
            const retryAfter = typeof pre.json?.retryAfter === "number" ? pre.json.retryAfter : 0;
            if (pre.status === 429 && retryAfter > 0) {
                startCooldownCurrent(retryAfter);
                throw new Error(`Please wait ${retryAfter}s`);
            }
            throw new Error(String(pre.json?.error || "Cannot send code"));
        }

        await sendViaFirebase(currentPhoneE164);

        // ✅ commit (writes cooldown)
        const commit = await postJson("/api/profile/phone/send-code-commit", {
            phoneE164: currentPhoneE164,
            kind: "current"
        });
        let retryAfter = COOLDOWN_SECONDS;
        if (commit.ok && typeof commit.json?.retryAfter === "number" && commit.json.retryAfter > 0) retryAfter = commit.json.retryAfter;
        startCooldownCurrent(retryAfter);

        setStep(2);
    }, [cooldownCurrent, currentPhoneE164, sendViaFirebase, startCooldownCurrent]);

    const confirmCurrentOtp = React.useCallback(async () => {
        if (!confirmRef.current) throw new Error("Request code first");
        const cred = await confirmRef.current.confirm(otp);
        const idToken = await cred.user.getIdToken(true);
        setCurrentToken(idToken);

        setOtp("");
        confirmRef.current = null; // force new confirmation for new phone
        setStep(3);
    }, [otp]);

    const startVerifyNew = React.useCallback(async () => {
        if (!newPhoneE164) throw new Error("Invalid new phone");
        if (cooldownNew > 0) return;

        setOtp("");
        confirmRef.current = null;

        const pre = await postJson("/api/profile/phone/send-code-preflight", {phoneE164: newPhoneE164, kind: "new"});
        if (!pre.ok) {
            const retryAfter = typeof pre.json?.retryAfter === "number" ? pre.json.retryAfter : 0;
            if (pre.status === 429 && retryAfter > 0) {
                startCooldownNew(retryAfter);
                throw new Error(`Please wait ${retryAfter}s`);
            }
            throw new Error(String(pre.json?.error || "Cannot send code"));
        }

        await sendViaFirebase(newPhoneE164);

        const commit = await postJson("/api/profile/phone/send-code-commit", {phoneE164: newPhoneE164, kind: "new"});
        let retryAfter = COOLDOWN_SECONDS;
        if (commit.ok && typeof commit.json?.retryAfter === "number" && commit.json.retryAfter > 0) retryAfter = commit.json.retryAfter;
        startCooldownNew(retryAfter);
    }, [cooldownNew, newPhoneE164, sendViaFirebase, startCooldownNew]);

    const confirmNewOtpGetIdToken = React.useCallback(async () => {
        if (!confirmRef.current) throw new Error("Send code first");
        const cred = await confirmRef.current.confirm(otp);
        return await cred.user.getIdToken(true);
    }, [otp]);

    const signOutFirebase = React.useCallback(async () => {
        await firebaseAuth.signOut().catch(() => undefined);
    }, []);

    const getSendErrorMessage = React.useCallback((err: unknown) => {
        const {code, message} = getErrInfo(err);

        if (code.includes("auth/billing-not-enabled")) {
            return "SMS requires billing. For dev use Firebase test phones.";
        }
        if (code.includes("auth/operation-not-allowed")) {
            return "Phone auth disabled in Firebase Auth settings.";
        }
        if (code.includes("auth/too-many-requests")) {
            return "Too many requests. Please wait and try later.";
        }
        return message || "Failed to send code";
    }, []);

    return {
        step,
        busy,
        setBusy,

        otp,
        setOtp,

        newPhoneRaw,
        setNewPhoneRaw,
        newPhoneE164,

        currentToken,

        hasConfirmation: !!confirmRef.current,

        cooldownCurrent,
        cooldownNew,

        startVerifyCurrent,
        confirmCurrentOtp,

        startVerifyNew,
        confirmNewOtpGetIdToken,

        reset,
        signOutFirebase,
        getSendErrorMessage,
    };
}