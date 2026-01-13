"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {CheckCircle2} from "lucide-react";

import {useForgotPasswordFlow} from "@/hooks/useForgotPasswordFlow";

export function StepDone({flow}: { flow: ReturnType<typeof useForgotPasswordFlow> }) {
    return (
        <div className="space-y-5 text-center">
            <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-300"/>
            </div>

            <div className="space-y-1">
                <h2 className="font-display text-xl font-bold">Password updated</h2>
                <p className="text-sm text-white/60">You can sign in with your new password.</p>
            </div>

            <Button className="w-full h-11" onClick={flow.goToSignIn}>
                Back to Sign In
            </Button>
        </div>
    );
}