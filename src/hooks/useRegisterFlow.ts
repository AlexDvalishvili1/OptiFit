"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {signInWithPhoneNumber, type ConfirmationResult} from "firebase/auth";
import {firebaseAuth} from "@/lib/firebase/client";
import {useToast} from "@/hooks/use-toast";
import {useAuth} from "@/components/providers/AuthProvider";
import {useSmsCooldown} from "@/hooks/useSmsCooldown";
import {useInvisibleRecaptcha} from "@/hooks/useInvisibleRecaptcha";
import {
    COOLDOWN_SECONDS,
    getErrInfo,
    isFirebaseExpectedCode,
    type RegisterStep,
} from "@/lib/pages/register/utils";

import {sendCodePreflight, sendCodeCommit, registerAccount} from "@/lib/pages/register/api";

export function useRegisterFlow() {
    const router = useRouter();
    const {toast} = useToast();
    const {refresh} = useAuth();

    const [step, setStep] = React.useState<RegisterStep>(1);

    const [phoneRaw, setPhoneRaw] = React.useState("");
    const [phoneE164, setPhoneE164] = React.useState("");

    const {cooldown, startCooldown} = useSmsCooldown();

    const [otp, setOtp] = React.useState("");

    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [password2, setPassword2] = React.useState("");
    const [showPass1, setShowPass1] = React.useState(false);
    const [showPass2, setShowPass2] = React.useState(false);

    const [loadingSend, setLoadingSend] = React.useState(false);
    const [loadingVerify, setLoadingVerify] = React.useState(false);
    const [loadingCreate, setLoadingCreate] = React.useState(false);

    const [phoneTouched, setPhoneTouched] = React.useState(false);
    const [firebaseIdToken, setFirebaseIdToken] = React.useState("");

    const confirmationRef = React.useRef<ConfirmationResult | null>(null);

    // ========= PHONE VALIDATION (same rules as your page) =========
    const parsedPhone = React.useMemo(() => parsePhoneNumberFromString(phoneRaw), [phoneRaw]);
    const phoneHasDigits = React.useMemo(() => /\d/.test(phoneRaw), [phoneRaw]);

    const hasNationalDigits = React.useMemo(() => {
        if (!parsedPhone) return false;
        const nn = String(parsedPhone.nationalNumber ?? "");
        return /\d/.test(nn);
    }, [parsedPhone]);

    const phoneValid = React.useMemo(() => !!parsedPhone?.isValid(), [parsedPhone]);

    const showPhoneOk = phoneTouched && phoneHasDigits && phoneValid;
    const showPhoneError = phoneTouched && hasNationalDigits && !phoneValid;

    // reCAPTCHA (stable instance, never cleared)
    const recaptchaRef = useInvisibleRecaptcha("recaptcha-container");

    // keep phoneE164 derived exactly when input changes (same as your onChange block)
    const onPhoneChange = React.useCallback((value: string) => {
        setPhoneRaw(value);
        setOtp("");
        setFirebaseIdToken("");
        confirmationRef.current = null;

        const parsed = parsePhoneNumberFromString(value);
        setPhoneE164(parsed?.isValid() ? parsed.number : "");
    }, []);

    const onPhoneBlur = React.useCallback(() => setPhoneTouched(true), []);

    const resetAll = React.useCallback(() => {
        setStep(1);

        setOtp("");
        setName("");
        setEmail("");
        setPassword("");
        setPassword2("");
        setShowPass1(false);
        setShowPass2(false);

        setLoadingSend(false);
        setLoadingVerify(false);
        setLoadingCreate(false);

        setPhoneTouched(false);
        setFirebaseIdToken("");

        confirmationRef.current = null;

        startCooldown(0);
    }, [startCooldown]);

    const sendCode = React.useCallback(async () => {
        if (!phoneValid || !phoneE164) {
            toast({variant: "destructive", title: "Invalid phone", description: "Enter a valid phone number."});
            return;
        }
        if (cooldown > 0) return;

        const appVerifier = recaptchaRef.current;
        if (!appVerifier) {
            toast({variant: "destructive", title: "reCAPTCHA not ready", description: "Refresh and try again."});
            return;
        }

        try {
            setLoadingSend(true);
            setOtp("");
            confirmationRef.current = null;

            const pre = await sendCodePreflight(phoneE164);

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

            const confirmation = await signInWithPhoneNumber(firebaseAuth, phoneE164, appVerifier);
            confirmationRef.current = confirmation;

            const commit = await sendCodeCommit(phoneE164);

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
                    description: "For dev use Firebase test phones (e.g. +995568740497 / 111111).",
                });
            } else if (code.includes("auth/operation-not-allowed")) {
                toast({
                    variant: "destructive",
                    title: "Phone auth disabled",
                    description: "Enable Phone sign-in in Firebase Auth settings (or use test phones).",
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
            toast({variant: "success", title: "Phone verified", description: "Now complete your account details."});
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

    // auto-verify when otp length = 6 (same behavior)
    React.useEffect(() => {
        if (step === 2 && otp.length === 6 && !loadingVerify) void verifyCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp, step]);

    const detailsValid =
        name.trim().length > 1 &&
        email.trim().length > 3 &&
        password.length >= 8 &&
        password === password2;

    const createAccount = React.useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== password2) {
            toast({variant: "destructive", title: "Passwords do not match"});
            return;
        }

        if (!phoneE164) {
            toast({
                variant: "destructive",
                title: "Phone missing",
                description: "Go back and verify your phone again."
            });
            setStep(1);
            return;
        }

        try {
            setLoadingCreate(true);

            if (!firebaseIdToken) {
                toast({
                    variant: "destructive",
                    title: "Phone verification missing",
                    description: "Verify phone again."
                });
                setStep(1);
                return;
            }

            const res = await registerAccount({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phoneE164,
                password,
                firebaseIdToken,
            });

            const error = res.json?.error;

            if (!res.ok || error) {
                toast({
                    variant: "destructive",
                    title: "Registration error",
                    description: (typeof error === "string" && error) || "Something went wrong.",
                });
                return;
            }

            toast({variant: "success", title: "Account created!", description: "Welcome to OptiFit."});
            await refresh();
            router.replace("/profile");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast({variant: "destructive", title: "Network error", description: "Try again."});
        } finally {
            setLoadingCreate(false);
        }
    }, [email, firebaseIdToken, name, password, password2, phoneE164, refresh, router, toast]);

    const goToStep1 = React.useCallback(() => {
        setStep(1);
        setOtp("");
    }, []);

    return {
        // state
        step,
        phoneRaw,
        phoneE164,
        otp,
        name,
        email,
        password,
        password2,
        showPass1,
        showPass2,
        cooldown,

        // derived flags (for UI)
        phoneValid,
        showPhoneOk,
        showPhoneError,
        detailsValid,

        // loading
        loadingSend,
        loadingVerify,
        loadingCreate,

        // actions
        setOtp,
        setName,
        setEmail,
        setPassword,
        setPassword2,
        setShowPass1,
        setShowPass2,

        onPhoneChange,
        onPhoneBlur,

        sendCode,
        verifyCode,
        createAccount,

        resetAll,
        goToStep1,
    };
}