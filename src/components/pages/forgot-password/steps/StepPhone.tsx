"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";

import {PhoneField} from "@/components/pages/signin/PhoneField";
import {useForgotPasswordFlow} from "@/hooks/useForgotPasswordFlow";

export function StepPhone({flow}: { flow: ReturnType<typeof useForgotPasswordFlow> }) {
    const text = flow.loadingSend
        ? "Sending..."
        : flow.cooldown > 0
            ? `Resend in ${flow.cooldown}s`
            : "Send code";

    return (
        <div className="space-y-5">
            <PhoneField
                value={flow.phoneRaw}
                onChange={flow.onPhoneChange}
                onBlur={flow.onPhoneBlur}
                showOk={flow.showPhoneOk}
                showError={flow.showPhoneError}
            />

            <Button
                type="button"
                className="w-full h-11"
                onClick={flow.sendCode}
                disabled={!flow.phoneValid || flow.loadingSend || flow.cooldown > 0}
            >
                {text}
            </Button>

            <p className="text-center text-xs text-white/55">We will send a 6-digit code to your phone.</p>
        </div>
    );
}