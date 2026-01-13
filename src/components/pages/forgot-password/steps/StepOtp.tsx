"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {KeyRound} from "lucide-react";

import {OtpInline} from "@/components/pages/register/OtpInline";
import {useForgotPasswordFlow} from "@/hooks/useForgotPasswordFlow";

export function StepOtp({flow}: { flow: ReturnType<typeof useForgotPasswordFlow> }) {
    const canResend = flow.cooldown <= 0 && !flow.loadingSend;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Enter OTP</div>
                <button
                    type="button"
                    onClick={flow.goBackToPhone}
                    className="text-xs text-white/60 hover:text-white"
                >
                    Change phone
                </button>
            </div>

            <div className="space-y-3">
                <Label className="text-white/80">Code</Label>
                <OtpInline value={flow.otp} onChange={flow.setOtp} disabled={flow.loadingVerify}/>

                <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{flow.cooldown > 0 ? `You can resend in ${flow.cooldown}s` : "You can resend now"}</span>
                    <button
                        type="button"
                        className={cn("text-[#10d3d3] hover:underline", !canResend && "opacity-40 pointer-events-none")}
                        onClick={flow.sendCode}
                    >
                        Resend
                    </button>
                </div>
            </div>

            <Button
                type="button"
                className="w-full h-11"
                onClick={flow.verifyCode}
                disabled={flow.otp.length !== 6 || flow.loadingVerify}
            >
                {flow.loadingVerify ? "Verifying..." : "Confirm"}
            </Button>

            <p className="text-center text-xs text-white/55">
                <KeyRound className="inline-block h-4 w-4 mr-1 text-white/55"/>
                Enter the code we sent to your phone.
            </p>
        </div>
    );
}