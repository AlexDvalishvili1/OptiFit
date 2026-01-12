"use client";

import * as React from "react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

import {KeyRound, ShieldCheck} from "lucide-react";
import {maskedPhone} from "@/lib/pages/register/utils";

import {RegisterCardShell} from "../RegisterCardShell";
import {OtpInline} from "../OtpInline";

export function StepOtp({
                            otp,
                            setOtp,
                            loadingVerify,
                            cooldown,
                            onResend,
                            onChangePhone,
                            onVerify,
                            phoneE164,
                            phoneRaw,
                        }: {
    otp: string;
    setOtp: (v: string) => void;
    loadingVerify: boolean;
    cooldown: number;
    onResend: () => void;
    onChangePhone: () => void;
    onVerify: () => void;
    phoneE164: string;
    phoneRaw: string;
}) {
    return (
        <RegisterCardShell
            title="Confirm OTP"
            subtitle="Enter the 6-digit code we sent you."
            icon={<KeyRound className="h-5 w-5 text-white/80"/>}
        >
            <div className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-white/70">
                            <ShieldCheck className="h-4 w-4 text-emerald-400"/>
                            <span>Code sent to</span>
                        </div>
                        <span className="text-xs text-white/85 font-medium">{maskedPhone(phoneE164 || phoneRaw)}</span>
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
                            onClick={onResend}
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
                        onClick={onChangePhone}
                        disabled={loadingVerify}
                    >
                        Change phone
                    </Button>

                    <Button type="button" className="flex-1 h-11" onClick={onVerify}
                            disabled={otp.length !== 6 || loadingVerify}>
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
        </RegisterCardShell>
    );
}