"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";

import {ArrowLeft, Smartphone, Lock, CheckCircle2, AlertCircle} from "lucide-react";
import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {useAuth} from "@/components/providers/AuthProvider";

export default function SignInPage() {
    const router = useRouter();
    const {toast} = useToast();
    const {refresh} = useAuth();

    const [phoneRaw, setPhoneRaw] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [phoneTouched, setPhoneTouched] = React.useState(false);

    // === same validation philosophy as register ===
    const parsedPhone = React.useMemo(
        () => parsePhoneNumberFromString(phoneRaw),
        [phoneRaw]
    );

    const phoneHasDigits = React.useMemo(() => /\d/.test(phoneRaw), [phoneRaw]);

    const hasNationalDigits = React.useMemo(() => {
        if (!parsedPhone) return false;
        const nn = String(parsedPhone.nationalNumber ?? "");
        return /\d/.test(nn);
    }, [parsedPhone]);

    const phoneValid = React.useMemo(
        () => !!parsedPhone?.isValid(),
        [parsedPhone]
    );

    const showPhoneOk = phoneTouched && phoneHasDigits && phoneValid;
    const showPhoneError = phoneTouched && hasNationalDigits && !phoneValid;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!phoneValid || !parsedPhone?.number) {
            toast({
                variant: "destructive",
                title: "Invalid phone number",
                description: "Please enter a valid phone number.",
            });
            return;
        }

        if (!password) {
            toast({
                variant: "destructive",
                title: "Password required",
            });
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    phone: parsedPhone.number, // E.164
                    password,
                }),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Sign in failed",
                    description: (json)?.error || "Invalid credentials",
                });
                return;
            }

            toast({
                title: "Welcome back!",
                description: "You are signed in.",
            });

            await refresh();
            router.replace("/dashboard");
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Network error",
                description: "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#05070b] text-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* LEFT panel (form) */}
                <div className="flex flex-col">
                    {/* top bar */}
                    <div className="px-5 sm:px-8 lg:px-10 pt-8">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4"/>
                                Back to home
                            </Link>

                            <Link href="/" className="hidden sm:inline-flex">
                                <Image src="/logo.svg" alt="OptiFit" width={140} height={32}/>
                            </Link>
                        </div>
                    </div>

                    {/* center */}
                    <div className="px-5 sm:px-8 lg:px-10 pb-10 flex items-start justify-center my-auto">
                        <div className="w-full max-w-md pt-6 space-y-5">
                            <div className="mt-6 flex items-center justify-center sm:hidden">
                                <Image src="/logo.svg" alt="OptiFit" width={170} height={40}/>
                            </div>

                            <div className="text-center space-y-1">
                                <h1 className="font-display text-2xl font-bold">Welcome back</h1>
                                <p className="text-white/60 text-sm">
                                    Sign in to continue your fitness journey
                                </p>
                            </div>

                            {/* Card */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* PHONE INPUT — SAME AS REGISTER */}
                                    <div className="space-y-2">
                                        <Label className="text-white/80">Phone Number</Label>

                                        <div
                                            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-white/25">
                                            <PhoneInput
                                                defaultCountry="ge"
                                                value={phoneRaw}
                                                onBlur={() => setPhoneTouched(true)}
                                                onChange={setPhoneRaw}
                                                inputClassName="!bg-transparent !text-white !outline-none !border-0 !shadow-none !w-full"
                                                countrySelectorStyleProps={{
                                                    buttonClassName:
                                                        "!bg-transparent !border-0 !shadow-none !px-1 !py-0 !text-white hover:!bg-white/5 rounded-md",
                                                    dropdownStyleProps: {
                                                        className:
                                                            "dark:!bg-zinc-950 dark:!text-zinc-100 !bg-white !text-zinc-900 !border !rounded-xl !shadow-xl !mt-2 !overflow-y-auto overflow-hidden",
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
                                    </div>

                                    {/* PASSWORD */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-white/80">Password</Label>

                                            <Link
                                                href="/forgot-password"
                                                className="text-xs text-[#10d3d3] hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>

                                        <div className="relative">
                                            <Lock
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-11 pl-10 bg-white/[0.03] border-white/10 focus:border-white/25"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11"
                                        disabled={loading}
                                    >
                                        {loading ? "Signing in..." : "Sign in"}
                                    </Button>

                                    <div className="text-center text-xs text-white/60">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/register" className="text-[#10d3d3] hover:underline">
                                            Sign up
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT hero — SAME AS REGISTER */}
                <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 gradient-primary"/>
                    <div
                        className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]"/>
                    <div className="relative max-w-md text-center px-10 text-primary-foreground">
                        <h2 className="font-display text-4xl font-bold mb-4 text-black">
                            Start Your Transformation <br/> Today
                        </h2>
                        <p className="text-black/80 text-sm leading-relaxed">
                            Access personalized AI-powered training programs, nutrition plans,
                            and track your progress all in one place.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}