"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import type {ConfirmationResult} from "firebase/auth";
import {signInWithPhoneNumber} from "firebase/auth";

import {firebaseAuth} from "@/lib/firebase/client";
import {useToast} from "@/hooks/use-toast";
import {useSmsCooldown} from "@/hooks/useSmsCooldown";
import {useInvisibleRecaptcha} from "@/hooks/useInvisibleRecaptcha";

import {normalizePhoneE164} from "@/lib/pages/register/phone/normalize";
import {derivePhoneValidation} from "@/lib/pages/auth/phoneValidation";
import {getErrInfo, isFirebaseExpectedCode, COOLDOWN_SECONDS} from "@/lib/pages/register/utils";

import {resetPreflight, resetCommit, resetPassword as resetPasswordApi} from "@/lib/pages/forgot-password/api";

type Step = 1 | 2 | 3 | 4;

export function useForgotPasswordFlow() {
    const router = useRouter();
    const {toast} = useToast();

    const [step, setStep] = React.useState<Step>(1);

    const [phoneRaw, setPhoneRaw] = React.useState("");
    const [phoneTouched, setPhoneTouched] = React.useState(false);

    const {phoneValid, showPhoneOk, showPhoneError} = React.useMemo(
        () => derivePhoneValidation(phoneRaw, phoneTouched),
        [phoneRaw, phoneTouched]
    );

    const phoneE164 = React.useMemo(() => normalizePhoneE164(phoneRaw), [phoneRaw]);

    const {cooldown, startCooldown} = useSmsCooldown();
    const recaptchaRef = useInvisibleRecaptcha("recaptcha-container");

    const confirmationRef = React.useRef<ConfirmationResult | null>(null);

    const [otp, setOtp] = React.useState("");
    const [firebaseIdToken, setFirebaseIdToken] = React.useState("");

    const [newPassword, setNewPassword] = React.useState("");
    const [newPassword2, setNewPassword2] = React.useState("");
    const [showPass1, setShowPass1] = React.useState(false);
    const [showPass2, setShowPass2] = React.useState(false);

    const [loadingSend, setLoadingSend] = React.useState(false);
    const [loadingVerify, setLoadingVerify] = React.useState(false);
    const [loadingReset, setLoadingReset] = React.useState(false);

    const onPhoneBlur = React.useCallback(() => setPhoneTouched(true), []);
    const onPhoneChange = React.useCallback((v: string) => {
        setPhoneRaw(v);
        setOtp("");
        setFirebaseIdToken("");
        confirmationRef.current = null;
    }, []);

    const goBackToPhone = React.useCallback(() => {
        setStep(1);
        setOtp("");
        setFirebaseIdToken("");
        confirmationRef.current = null;
    }, []);

    const sendCode = React.useCallback(async () => {
        if (!phoneValid || !phoneE164) {
            toast({variant: "destructive", title: "Invalid phone", description: "Enter a valid phone number."});
            return;
        }
        if (cooldown > 0) return;

        const verifier = recaptchaRef.current;
        if (!verifier) {
            toast({variant: "destructive", title: "reCAPTCHA not ready", description: "Refresh and try again."});
            return;
        }

        try {
            setLoadingSend(true);
            setOtp("");
            setFirebaseIdToken("");
            confirmationRef.current = null;

            const pre = await resetPreflight(phoneE164);

            if (!pre.ok) {
                const retryAfter = typeof pre.json?.retryAfter === "number" ? pre.json.retryAfter : 0;

                if (pre.status === 429 && retryAfter > 0) {
                    startCooldown(retryAfter);
                    toast({variant: "destructive", title: "Please wait", description: `Try again in ${retryAfter}s.`});
                    return;
                }

                toast({
                    variant: "destructive",
                    title: "Cannot send code",
                    description: pre.json?.error ?? "Try again later.",
                });
                return;
            }

            const confirmation = await signInWithPhoneNumber(firebaseAuth, phoneE164, verifier);
            confirmationRef.current = confirmation;

            const commit = await resetCommit(phoneE164);

            let retryAfter = COOLDOWN_SECONDS;
            if (commit.ok && typeof commit.json?.retryAfter === "number" && commit.json.retryAfter > 0) {
                retryAfter = commit.json.retryAfter;
            }
            startCooldown(retryAfter);

            setStep(2);
            toast({variant: "success", title: "Code sent", description: "We sent a 6-digit code to your phone."});
        } catch (err) {
            const {code, message} = getErrInfo(err);
            if (!code.includes("auth/")) console.error(err);

            startCooldown(0);

            if (code.includes("auth/billing-not-enabled")) {
                toast({
                    variant: "destructive",
                    title: "SMS requires billing",
                    description: "For dev use Firebase test phones."
                });
            } else if (code.includes("auth/too-many-requests")) {
                toast({variant: "destructive", title: "Too many requests", description: "Please wait and try later."});
            } else {
                toast({variant: "destructive", title: "Failed to send code", description: message || "Unknown error"});
            }
        } finally {
            setLoadingSend(false);
        }
    }, [cooldown, phoneE164, phoneValid, recaptchaRef, startCooldown, toast]);

    const verifyCode = React.useCallback(async () => {
        if (otp.length !== 6) return;

        if (!confirmationRef.current) {
            toast({variant: "destructive", title: "Request code first"});
            setStep(1);
            return;
        }

        try {
            setLoadingVerify(true);

            const cred = await confirmationRef.current.confirm(otp);
            const idToken = await cred.user.getIdToken();
            setFirebaseIdToken(idToken);

            setStep(3);
            toast({variant: "success", title: "Phone verified", description: "Now set a new password."});
        } catch (err) {
            const {code, message} = getErrInfo(err);
            if (!isFirebaseExpectedCode(code)) console.error(err);

            if (code.includes("auth/invalid-verification-code")) {
                toast({variant: "destructive", title: "Incorrect code", description: "Try again."});
            } else if (code.includes("auth/code-expired") || code.includes("auth/session-expired")) {
                toast({variant: "destructive", title: "Code expired", description: "Go back and request a new code."});
            } else {
                toast({variant: "destructive", title: "Verification failed", description: message || "Try again."});
            }

            setOtp("");
        } finally {
            setLoadingVerify(false);
        }
    }, [otp, toast]);

    React.useEffect(() => {
        if (step === 2 && otp.length === 6 && !loadingVerify) void verifyCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp, step]);

    const resetValid = newPassword.length >= 8 && newPassword === newPassword2;

    const submitReset = React.useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!phoneE164) {
                toast({variant: "destructive", title: "Phone missing", description: "Verify your phone again."});
                setStep(1);
                return;
            }

            if (!firebaseIdToken) {
                toast({variant: "destructive", title: "Verification missing", description: "Verify OTP again."});
                setStep(1);
                return;
            }

            if (newPassword !== newPassword2) {
                toast({variant: "destructive", title: "Passwords do not match"});
                return;
            }

            try {
                setLoadingReset(true);

                const res = await resetPasswordApi({
                    phone: phoneE164,
                    newPassword,
                    firebaseIdToken,
                });

                if (!res.ok) {
                    toast({
                        variant: "destructive",
                        title: "Reset failed",
                        description: res.json?.error || "Try again."
                    });
                    return;
                }

                toast({variant: "success", title: "Password updated", description: "You can sign in now."});
                setStep(4);
            } catch {
                toast({variant: "destructive", title: "Network error", description: "Try again."});
            } finally {
                setLoadingReset(false);
            }
        },
        [firebaseIdToken, newPassword, newPassword2, phoneE164, toast]
    );

    const goToSignIn = React.useCallback(() => {
        router.replace("/signin");
        router.refresh();
    }, [router]);

    return {
        step,

        phoneRaw,
        onPhoneChange,
        onPhoneBlur,
        phoneValid,
        showPhoneOk,
        showPhoneError,

        cooldown,
        loadingSend,
        sendCode,

        otp,
        setOtp,
        loadingVerify,
        verifyCode,
        goBackToPhone,

        newPassword,
        setNewPassword,
        newPassword2,
        setNewPassword2,
        showPass1,
        setShowPass1,
        showPass2,
        setShowPass2,
        resetValid,
        loadingReset,
        submitReset,

        goToSignIn,
    };
}