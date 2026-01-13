"use client";

import * as React from "react";
import {useRouter} from "next/navigation";

import {useToast} from "@/hooks/use-toast";
import {useAuth} from "@/components/providers/AuthProvider";

import {derivePhoneValidation} from "@/lib/pages/auth/phoneValidation";
import {signInWithPhone} from "@/lib/pages/signin/api";

import {normalizePhoneE164} from "@/lib/pages/register/phone/normalize";

export function useSignInFlow() {
    const router = useRouter();
    const {toast} = useToast();
    const {refresh} = useAuth();

    const [phoneRaw, setPhoneRaw] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [phoneTouched, setPhoneTouched] = React.useState(false);

    const {phoneValid, showPhoneOk, showPhoneError} = React.useMemo(
        () => derivePhoneValidation(phoneRaw, phoneTouched),
        [phoneRaw, phoneTouched]
    );

    const onPhoneBlur = React.useCallback(() => setPhoneTouched(true), []);
    const onPhoneChange = React.useCallback((value: string) => setPhoneRaw(value), []);

    const submit = React.useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            // бизнес-истина: строгий E.164 или ""
            const phoneE164 = normalizePhoneE164(phoneRaw);

            if (!phoneE164) {
                toast({
                    variant: "destructive",
                    title: "Invalid phone number",
                    description: "Please enter a valid phone number.",
                });
                return;
            }

            if (!password) {
                toast({variant: "destructive", title: "Password required"});
                return;
            }

            try {
                setLoading(true);

                const res = await signInWithPhone({phone: phoneE164, password});

                if (!res.ok) {
                    toast({
                        variant: "destructive",
                        title: "Sign in failed",
                        description: res.json?.error || "Invalid credentials",
                    });
                    return;
                }

                toast({title: "Welcome back!", description: "You are signed in."});

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
        },
        [password, phoneRaw, refresh, router, toast]
    );

    return {
        // state
        phoneRaw,
        password,
        showPassword,
        loading,

        // ux flags
        phoneValid,
        showPhoneOk,
        showPhoneError,

        // actions
        setPassword,
        setShowPassword,
        onPhoneChange,
        onPhoneBlur,
        submit,
    };
}