"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";

import {
    ArrowLeft,
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    CheckCircle2,
    AlertCircle,
    Smartphone,
    KeyRound,
    ShieldCheck,
    RotateCcw,
    ChevronRight,
} from "lucide-react";

import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";
import {parsePhoneNumberFromString} from "libphonenumber-js";

import {firebaseAuth} from "@/lib/firebase/client";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult,
} from "firebase/auth";
import {useAuth} from "@/components/providers/AuthProvider";

type Step = 1 | 2 | 3;

const COOLDOWN_KEY = "optifit:smsCooldownUntil"; // epoch seconds
const COOLDOWN_SECONDS = 60;

function nowSec() {
    return Math.floor(Date.now() / 1000);
}

function getErrInfo(err: unknown): { code: string; message: string } {
    if (typeof err === "object" && err !== null) {
        const anyErr = err as Record<string, unknown>;
        const code = typeof anyErr.code === "string" ? anyErr.code : "";
        const message = typeof anyErr.message === "string" ? anyErr.message : "";
        return {code, message};
    }
    return {code: "", message: ""};
}

function isFirebaseExpectedCode(code: string) {
    return (
        code.includes("auth/invalid-verification-code") ||
        code.includes("auth/code-expired") ||
        code.includes("auth/missing-verification-code") ||
        code.includes("auth/session-expired")
    );
}

function maskedPhone(p: string) {
    if (!p) return "";
    const clean = p.trim();
    if (clean.length <= 6) return clean;
    return `${clean.slice(0, 4)}******${clean.slice(-3)}`;
}

/** === UI pieces === */

function Stepper({step}: { step: Step }) {
    const items = [
        {n: 1, label: "Phone", sub: "Enter number"},
        {n: 2, label: "OTP", sub: "Confirm code"},
        {n: 3, label: "Details", sub: "Create account"},
    ] as const;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3 max-[350px]:gap-2">
                {items.map((it, idx) => {
                    const done = step > it.n;
                    const active = step === it.n;

                    return (
                        <div key={it.n} className="flex-1">
                            <div className="flex items-center gap-3 max-[350px]:gap-1.5">
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold",
                                        done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
                                        active && !done && "border-white/20 bg-white/5 text-white",
                                        !active && !done && "border-white/10 text-white/55"
                                    )}
                                >
                                    {done ? <CheckCircle2 className="h-4 w-4"/> : it.n}
                                </div>

                                <div className="min-w-0">
                                    <div
                                        className={cn("text-xs font-semibold", active ? "text-white" : "text-white/70")}>
                                        {it.label}
                                    </div>
                                    <div className="text-[11px] text-white/45">{it.sub}</div>
                                </div>
                            </div>

                            {/* connector */}
                            {idx < items.length - 1 ? (
                                <div className="mt-3 h-[2px] w-full rounded-full bg-white/10">
                                    <div
                                        className={cn(
                                            "h-[2px] rounded-full transition-all",
                                            step > it.n ? "w-full bg-emerald-400/60" : active ? "w-1/2 bg-white/25" : "w-0 bg-white/0"
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="mt-3 h-[2px]"/>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CardShell({
                       title,
                       subtitle,
                       icon,
                       children,
                   }: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="flex items-start gap-3">
                {icon ? (
                    <div className="mt-0.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                        {icon}
                    </div>
                ) : null}
                <div className="space-y-1">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    {subtitle ? <p className="text-xs text-white/60">{subtitle}</p> : null}
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </div>
    );
}

function OtpInline({
                       value,
                       onChange,
                       disabled,
                   }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    const refs = React.useRef<(HTMLInputElement | null)[]>([]);

    return (
        <div className="flex justify-center gap-2 max-[350px]:gap-1">
            {Array.from({length: 6}).map((_, i) => {
                const c = value[i] ?? "";
                return (
                    <input
                        key={i}
                        ref={(el) => {
                            refs.current[i] = el;
                        }}
                        value={c}
                        disabled={disabled}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className={cn(
                            "h-12 w-10 rounded-xl border border-white/10 bg-white/[0.03] text-center text-lg text-white outline-none",
                            "focus:border-white/25 focus:bg-white/[0.05] disabled:opacity-60"
                        )}
                        onChange={(e) => {
                            const digit = e.target.value.replace(/\D/g, "").slice(-1);
                            const arr = value.split("");
                            arr[i] = digit;

                            const next = arr.join("").slice(0, 6);
                            onChange(next);

                            if (digit && i < 5) refs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus();
                            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
                            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
                        }}
                    />
                );
            })}
        </div>
    );
}

/** === Page === */

export default function Register() {
    const router = useRouter();
    const {toast} = useToast();
    const {refresh} = useAuth();

    const [step, setStep] = React.useState<Step>(1);

    const [phoneRaw, setPhoneRaw] = React.useState("");
    const [phoneE164, setPhoneE164] = React.useState("");
    const [cooldown, setCooldown] = React.useState(0);

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

    // ========= PHONE VALIDATION (UX-safe rule) =========
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

    // ========= COOLDOWN (restore on reload) =========
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

    function startCooldown(seconds: number) {
        const s = Math.max(0, Math.floor(seconds));
        setCooldown(s);
        try {
            if (s > 0) localStorage.setItem(COOLDOWN_KEY, String(nowSec() + s));
            else localStorage.removeItem(COOLDOWN_KEY);
        } catch {
            // ignore
        }
    }

    React.useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    // ========= RECAPTCHA (stable instance) =========
    const recaptchaRef = React.useRef<RecaptchaVerifier | null>(null);

    React.useEffect(() => {
        if (recaptchaRef.current) return;

        recaptchaRef.current = new RecaptchaVerifier(
            firebaseAuth,
            "recaptcha-container",
            {
                size: "invisible",
            }
        );
    }, []);


    function resetAll() {
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
    }

    async function sendCode() {
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

            const pre = await fetch("/api/auth/send-code-preflight", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({phoneE164}),
            });
            const preJson = await pre.json().catch(() => ({}));

            if (!pre.ok) {
                const retryAfter = typeof preJson?.retryAfter === "number" ? preJson.retryAfter : 0;

                if (pre.status === 429 && retryAfter > 0) {
                    startCooldown(retryAfter);
                    toast({variant: "destructive", title: "Please wait", description: `Try again in ${retryAfter}s.`});
                    return;
                }

                toast({
                    variant: "destructive",
                    title: "Cannot send code",
                    description: preJson?.error ?? "Try again later.",
                });
                return;
            }

            const confirmation = await signInWithPhoneNumber(firebaseAuth, phoneE164, appVerifier);
            confirmationRef.current = confirmation;

            const commit = await fetch("/api/auth/send-code-commit", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({phoneE164}),
            }).catch(() => null);

            let retryAfter = COOLDOWN_SECONDS;
            try {
                const c = await commit?.json?.().catch(() => ({}));
                if (typeof (c)?.retryAfter === "number" && (c).retryAfter > 0) retryAfter = (c).retryAfter;
            } catch {
                // ignore
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
    }

    async function verifyCode() {
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
    }

    React.useEffect(() => {
        if (step === 2 && otp.length === 6 && !loadingVerify) void verifyCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp, step]);

    const detailsValid =
        name.trim().length > 1 &&
        email.trim().length > 3 &&
        password.length >= 8 &&
        password === password2;

    async function createAccount(e: React.FormEvent) {
        e.preventDefault();

        if (password !== password2) {
            toast({variant: "destructive", title: "Passwords do not match"});
            return;
        }

        if (!phoneE164) {
            toast({
                variant: "destructive",
                title: "Phone missing",
                description: "Go back and verify your phone again.",
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
                    description: "Verify phone again.",
                });
                setStep(1);
                return;
            }

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                cache: "no-store",
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phoneE164,
                    password,
                    firebaseIdToken,
                }),
            });

            const result = await res.json().catch(() => ({}));
            const error = result?.error;

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
    }

    return (
        <div className="min-h-screen bg-[#05070b] text-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* LEFT hero */}
                <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 gradient-primary"/>
                    <div
                        className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]"/>
                    <div className="relative max-w-md text-center px-10 text-primary-foreground">
                        <h2 className="font-display text-4xl font-bold mb-4 text-black">
                            Start Your Transformation <br/> Today
                        </h2>
                        <p className="text-black/80 text-sm leading-relaxed">
                            Join thousands of fitness enthusiasts achieving their goals with AI-powered personalized
                            training.
                        </p>
                    </div>
                </div>

                {/* RIGHT panel */}
                <div className="flex flex-col">
                    {/* top area with logo + back */}
                    <div className="px-5 sm:px-8 lg:px-10 pt-8">
                        <div className="mx-auto w-full">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4"/>
                                    Back to home
                                </Link>

                                <Link href="/" className="hidden sm:inline-flex">
                                    <Image src="/logo.svg" alt="OptiFit" width={140} height={32} priority/>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* center area */}
                    <div className="px-5 sm:px-8 lg:px-10 pb-10 flex items-start justify-center my-auto">
                        <div className="w-full max-w-md pt-6 space-y-5">
                            {/* On mobile keep logo visible too */}
                            <div className="mt-6 flex items-center justify-center sm:hidden">
                                <Image src="/logo.svg" alt="OptiFit" width={170} height={40} priority/>
                            </div>

                            {/* Title */}
                            <div className="text-center space-y-1">
                                <h1 className="font-display text-2xl font-bold">Create your account</h1>
                                <p className="text-white/60 text-sm">Complete verification in 3 quick steps</p>
                            </div>

                            {/* Stepper (makes it CLEAR it's a flow) */}
                            <Stepper step={step}/>

                            {/* only one recaptcha mount point */}
                            <div id="recaptcha-container" className="hidden"/>

                            {/* Step 1 */}
                            {step === 1 && (
                                <CardShell
                                    title="Phone verification"
                                    subtitle="We’ll send a one-time code to your phone."
                                    icon={<Smartphone className="h-5 w-5 text-white/80"/>}
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/80">Phone Number</Label>

                                            <div
                                                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-white/25">
                                                <PhoneInput
                                                    defaultCountry="ge"
                                                    value={phoneRaw}
                                                    onBlur={() => setPhoneTouched(true)}
                                                    onChange={(value) => {
                                                        setPhoneRaw(value);
                                                        setOtp("");
                                                        setFirebaseIdToken("");
                                                        confirmationRef.current = null;

                                                        const parsed = parsePhoneNumberFromString(value);
                                                        setPhoneE164(parsed?.isValid() ? parsed.number : "");
                                                    }}
                                                    inputClassName="!bg-transparent !text-white !outline-none !border-0 !shadow-none !w-full"
                                                    countrySelectorStyleProps={{
                                                        buttonClassName:
                                                            "!bg-transparent !border-0 !shadow-none !px-1 !py-0 !text-white hover:!bg-white/5 rounded-md",
                                                        dropdownStyleProps: {
                                                            className:
                                                                "dark:!bg-zinc-950 dark:!text-zinc-100 !bg-white !text-zinc-900 !border !rounded-xl !shadow-xl !mt-2 !overflow-hidden",
                                                        },
                                                    }}
                                                />
                                            </div>

                                            <div className="min-h-[18px] text-xs">
                                                {showPhoneOk ? (
                                                    <div className="flex items-center gap-2 text-emerald-400">
                                                        <CheckCircle2 className="h-4 w-4"/>
                                                        <span>Valid phone number</span>
                                                    </div>
                                                ) : showPhoneError ? (
                                                    <div className="flex items-center gap-2 text-red-400">
                                                        <AlertCircle className="h-4 w-4"/>
                                                        <span>Please enter a valid phone number</span>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {process.env.NODE_ENV !== "production" && (
                                                <p className="text-[11px] text-white/40">
                                                    Dev: use test phone <span
                                                    className="font-medium text-white/70">+995568740497</span> and
                                                    code{" "}
                                                    <span className="font-medium text-white/70">111111</span>.
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            className="w-full h-11 flex"
                                            size="lg"
                                            onClick={sendCode}
                                            disabled={!phoneValid || loadingSend || cooldown > 0}
                                        >
                                            {loadingSend ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
                                            <ChevronRight className="h-4 w-4"/>
                                        </Button>

                                        <div className="text-center text-xs text-white/60">
                                            Already have an account?{" "}
                                            <Link href="/signin" className="text-[#10d3d3] hover:underline">
                                                Sign in
                                            </Link>
                                        </div>
                                    </div>
                                </CardShell>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <CardShell
                                    title="Confirm OTP"
                                    subtitle="Enter the 6-digit code we sent you."
                                    icon={<KeyRound className="h-5 w-5 text-white/80"/>}
                                >
                                    <div className="space-y-5">
                                        <div
                                            className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 text-white/70">
                                                    <ShieldCheck className="h-4 w-4 text-emerald-400"/>
                                                    <span>Code sent to</span>
                                                </div>
                                                <span
                                                    className="text-xs text-white/85 font-medium">{maskedPhone(phoneE164 || phoneRaw)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-white/80">Code</Label>
                                            <OtpInline value={otp} onChange={setOtp} disabled={loadingVerify}/>

                                            <div className="flex items-center justify-between text-xs text-white/60">
                                                <span>{cooldown > 0 ? `You can resend in ${cooldown}s` : "You can resend now"}</span>
                                                <button
                                                    type="button"
                                                    className={cn("text-[#10d3d3] hover:underline", cooldown > 0 && "opacity-40 pointer-events-none")}
                                                    onClick={sendCode}
                                                >
                                                    Resend
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 h-11 border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
                                                onClick={() => {
                                                    setStep(1);
                                                    setOtp("");
                                                }}
                                                disabled={loadingVerify}
                                            >
                                                Change phone
                                            </Button>

                                            <Button
                                                type="button"
                                                className="flex-1 h-11"
                                                onClick={verifyCode}
                                                disabled={otp.length !== 6 || loadingVerify}
                                            >
                                                {loadingVerify ? "Verifying..." : "Confirm"}
                                            </Button>
                                        </div>

                                        <div className="text-center text-xs text-white/60">
                                            Already have an account?{" "}
                                            <Link href="/signin" className="text-[#10d3d3] hover:underline">
                                                Sign in
                                            </Link>
                                        </div>
                                    </div>
                                </CardShell>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <form onSubmit={createAccount}>
                                    <CardShell
                                        title="Account details"
                                        subtitle="Create your login credentials to finish."
                                        icon={<CheckCircle2 className="h-5 w-5 text-emerald-400"/>}
                                    >
                                        <div className="space-y-5">
                                            <div
                                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 text-emerald-200">
                                                        <CheckCircle2 className="h-4 w-4"/>
                                                        <span className="font-medium">Phone verified</span>
                                                    </div>
                                                    <span
                                                        className="text-xs text-white/80 font-medium">{maskedPhone(phoneE164)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-white/80">
                                                        Full Name
                                                    </Label>
                                                    <div className="relative">
                                                        <User
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                                        <Input
                                                            id="name"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className="h-11 pl-10 bg-white/[0.03] border-white/10 focus:border-white/25"
                                                            placeholder="John Doe"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-white/80">
                                                        Email
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="h-11 pl-10 bg-white/[0.03] border-white/10 focus:border-white/25"
                                                            placeholder="you@example.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-white/80">
                                                        Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                                        <Input
                                                            id="password"
                                                            type={showPass1 ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                                            placeholder="••••••••"
                                                            required
                                                            minLength={8}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPass1((s) => !s)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                                                        >
                                                            {showPass1 ? <EyeOff className="h-4 w-4"/> :
                                                                <Eye className="h-4 w-4"/>}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-white/45">Must be at least 8
                                                        characters</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password2" className="text-white/80">
                                                        Confirm Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                                        <Input
                                                            id="password2"
                                                            type={showPass2 ? "text" : "password"}
                                                            value={password2}
                                                            onChange={(e) => setPassword2(e.target.value)}
                                                            className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                                            placeholder="••••••••"
                                                            required
                                                            minLength={8}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPass2((s) => !s)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                                                        >
                                                            {showPass2 ? <EyeOff className="h-4 w-4"/> :
                                                                <Eye className="h-4 w-4"/>}
                                                        </button>
                                                    </div>

                                                    {password2 && password !== password2 ? (
                                                        <p className="text-xs text-red-400">Passwords do not match</p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-1">
                                                <Button className="w-full h-11" type="submit"
                                                        disabled={!detailsValid || loadingCreate}>
                                                    {loadingCreate ? "Creating..." : "Create Account"}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full h-11 border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
                                                    onClick={resetAll}
                                                    disabled={loadingCreate}
                                                >
                                                    <RotateCcw className="mr-2 h-4 w-4"/>
                                                    Start over
                                                </Button>
                                            </div>

                                            <div className="text-center text-xs text-white/60">
                                                Already have an account?{" "}
                                                <Link href="/signin" className="text-[#10d3d3] hover:underline">
                                                    Sign in
                                                </Link>
                                            </div>
                                        </div>
                                    </CardShell>
                                </form>
                            )}

                            {/* Footer */}
                            <div className="pt-2 text-center text-[11px] text-white/45">
                                By creating an account, you agree to our{" "}
                                <Link href="/terms" className="text-white/65 underline underline-offset-4">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-white/65 underline underline-offset-4">
                                    Privacy Policy
                                </Link>
                                .
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}