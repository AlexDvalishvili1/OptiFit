"use client";

import * as React from "react";
import {useForgotPasswordFlow} from "@/hooks/useForgotPasswordFlow";

import {ForgotPasswordShell} from "@/components/pages/forgot-password/ForgotPasswordShell";
import {ForgotPasswordCard} from "@/components/pages/forgot-password/ForgotPasswordCard";

import {StepPhone} from "@/components/pages/forgot-password/steps/StepPhone";
import {StepOtp} from "@/components/pages/forgot-password/steps/StepOtp";
import {StepNewPassword} from "@/components/pages/forgot-password/steps/StepNewPassword";
import {StepDone} from "@/components/pages/forgot-password/steps/StepDone";

export default function ForgotPasswordPage() {
    const flow = useForgotPasswordFlow();

    return (
        <ForgotPasswordShell>
            <div id="recaptcha-container" className="hidden"/>

            <ForgotPasswordCard>
                {flow.step === 1 ? <StepPhone flow={flow}/> : null}
                {flow.step === 2 ? <StepOtp flow={flow}/> : null}
                {flow.step === 3 ? <StepNewPassword flow={flow}/> : null}
                {flow.step === 4 ? <StepDone flow={flow}/> : null}
            </ForgotPasswordCard>
        </ForgotPasswordShell>
    );
}