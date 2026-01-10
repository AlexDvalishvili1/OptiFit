"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";

import {
    ArrowLeft,
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    CheckCircle2,
    AlertCircle,
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
        <div className="flex justify-center gap-1.5">
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
                        className="h-9 w-9 rounded-md border border-border bg-background text-center text-sm font-medium outline-none
                       focus:ring-2 focus:ring-primary disabled:opacity-50"
                        onChange={(e) => {
                            const digit = e.target.value.replace(/\D/g, "");
                            const arr = value.split("");
                            arr[i] = digit;

                            const next = arr.join("").slice(0, 6);
                            onChange(next);

                            if (digit && i < 5) refs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus();
                        }}
                    />
                );
            })}
        </div>
    );
}

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

    // "user actually typed national number" (not only country code like +995)
    const hasNationalDigits = React.useMemo(() => {
        if (!parsedPhone) return false;
        const nn = String((parsedPhone).nationalNumber ?? "");
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

        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
            size: "invisible",
        });

        return () => {
            recaptchaRef.current?.clear();
            recaptchaRef.current = null;
        };
    }, []);

    function maskedPhone(p: string) {
        if (!p) return "";
        if (p.length <= 6) return p;
        return `${p.slice(0, 4)}******${p.slice(-3)}`;
    }

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

        // ✅ important: timer reset (no “Resend in …” after Start over)
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

            // ✅ server preflight: cooldown + phone exists check
            const pre = await fetch("/api/auth/send-code-preflight", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({phoneE164}),
            });
            const preJson = (await pre.json().catch(() => ({})));

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

            // 2) send SMS via Firebase
            const confirmation = await signInWithPhoneNumber(firebaseAuth, phoneE164, appVerifier);
            confirmationRef.current = confirmation;

            // 3) commit cooldown
            await fetch("/api/auth/send-code-commit", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({phoneE164}),
            }).catch(() => {
            });

            startCooldown(COOLDOWN_SECONDS);

            setStep(2);
            toast({variant: "success", title: "Code sent", description: "We sent a 6-digit code to your phone."});
        } catch (err) {
            const {code, message} = getErrInfo(err);

            // don't trigger Next overlay for common auth errors
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

            // ✅ do NOT console.error expected firebase errors
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

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phoneE164, // ✅ IMPORTANT (matches your backend)
                    password,
                    firebaseIdToken,
                }),
            });

            const result: unknown = await res.json();
            const error =
                typeof result === "object" && result !== null && "error" in result ? (result).error : null;

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
        <div className="min-h-screen flex">
            <div className="hidden lg:flex flex-1 items-center justify-center gradient-primary p-12">
                <div className="max-w-md text-center text-primary-foreground">
                    <h2 className="font-display text-3xl font-bold mb-4">Start Your Transformation Today</h2>
                    <p className="text-primary-foreground/90">
                        Join thousands of fitness enthusiasts achieving their goals with AI-powered personalized
                        training.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="w-full max-w-sm mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to home
                    </Link>

                    <div className="flex items-center gap-2 mb-8">
                        <Image src="/logo.svg" alt="Logo" width={170} height={40}/>
                    </div>

                    <h1 className="font-display text-2xl font-bold mb-2">Create your account</h1>
                    <p className="text-muted-foreground mb-8">Start your free trial today</p>

                    {/* ✅ only one recaptcha mount point */}
                    <div id="recaptcha-container" className="hidden"/>

                    <div className="rounded-lg border p-3 text-sm mb-5">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Verification</span>
                            <span className="text-muted-foreground">Step {step}/3</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {step === 1 && "Enter your phone number and request a verification code."}
                            {step === 2 && "Enter the 6-digit code."}
                            {step === 3 && "Finish account details."}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Phone Number</Label>

                                <div
                                    className="rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
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
                                        inputClassName="!bg-transparent !text-foreground !outline-none !border-0 !shadow-none !w-full"
                                        countrySelectorStyleProps={{
                                            buttonClassName:
                                                "!bg-transparent !border-0 !shadow-none !px-1 !py-0 !text-foreground hover:!bg-muted/40 rounded-md",
                                            dropdownStyleProps: {
                                                className:
                                                    "dark:!bg-zinc-950 dark:!text-zinc-100 !bg-white !text-zinc-900 !border !rounded-xl !shadow-xl !mt-2 !overflow-hidden",
                                            },
                                        }}
                                    />
                                </div>

                                {showPhoneOk ? (
                                    <div className="flex items-center gap-2 text-xs text-green-600">
                                        <CheckCircle2 className="h-4 w-4"/>
                                        <span>Valid phone number</span>
                                    </div>
                                ) : showPhoneError ? (
                                    <div className="flex items-center gap-2 text-xs text-destructive">
                                        <AlertCircle className="h-4 w-4"/>
                                        <span>Please enter a valid phone number</span>
                                    </div>
                                ) : null}

                                {process.env.NODE_ENV !== "production" && (
                                    <p className="text-[11px] text-muted-foreground">
                                        Dev: use test phone <span className="font-medium">+995568740497</span> and
                                        code{" "}
                                        <span className="font-medium">111111</span>.
                                    </p>
                                )}
                            </div>

                            <Button
                                type="button"
                                className="w-full"
                                size="lg"
                                onClick={sendCode}
                                disabled={!phoneValid || loadingSend || cooldown > 0}
                            >
                                {loadingSend ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-3">
                                <div className="text-xs text-muted-foreground">
                                    Code sent to <span
                                    className="font-medium">{maskedPhone(phoneE164 || phoneRaw)}</span>
                                </div>

                                <div className="mt-3">
                                    <OtpInline value={otp} onChange={setOtp} disabled={loadingVerify}/>
                                </div>

                                <div className="mt-2 text-[11px] text-muted-foreground text-center">
                                    {cooldown > 0 ? `You can resend in ${cooldown}s` : "Didn’t get it? Go back and resend."}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
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
                                    className="w-full"
                                    onClick={verifyCode}
                                    disabled={otp.length !== 6 || loadingVerify}
                                >
                                    {loadingVerify ? "Verifying..." : "Confirm"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={createAccount} className="space-y-4">
                            <div className="rounded-lg border p-3 text-xs text-muted-foreground">
                                Phone verified: <span
                                className="font-medium text-foreground">{maskedPhone(phoneE164)}</span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="password"
                                        type={showPass1 ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass1((s) => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                                        aria-label={showPass1 ? "Hide password" : "Show password"}
                                    >
                                        {showPass1 ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password2">Confirm Password</Label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="password2"
                                        type={showPass2 ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password2}
                                        onChange={(e) => setPassword2(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass2((s) => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                                        aria-label={showPass2 ? "Hide password" : "Show password"}
                                    >
                                        {showPass2 ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>

                                {password2 && password !== password2 && (
                                    <p className="text-xs text-destructive">Passwords do not match</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" size="lg"
                                    disabled={!detailsValid || loadingCreate}>
                                {loadingCreate ? "Creating account..." : "Create Account"}
                            </Button>

                            <Button type="button" variant="outline" className="w-full" onClick={resetAll}
                                    disabled={loadingCreate}>
                                Start over
                            </Button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-foreground">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-foreground">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx global>{`
                .react-international-phone-country-selector-dropdown {
                    border-radius: 12px !important;
                    overflow: hidden !important;
                }

                .react-international-phone-country-selector-dropdown__list {
                    max-height: 260px !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    overscroll-behavior: contain;
                    -webkit-overflow-scrolling: touch;
                }

                .react-international-phone-input {
                    background: transparent !important;
                    border: 0 !important;
                    box-shadow: none !important;
                    outline: none !important;
                    width: 100% !important;
                    color: inherit !important;
                }
            `}</style>
        </div>
    );
}