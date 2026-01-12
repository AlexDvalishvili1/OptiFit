"use client";

import * as React from "react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

import {CheckCircle2, AlertCircle, Smartphone, ChevronRight} from "lucide-react";
import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";

import {RegisterCardShell} from "../RegisterCardShell";

export function StepPhone({
                              phoneRaw,
                              onPhoneChange,
                              onPhoneBlur,
                              showPhoneOk,
                              showPhoneError,
                              phoneValid,
                              cooldown,
                              loadingSend,
                              onSendCode,
                          }: {
    phoneRaw: string;
    onPhoneChange: (v: string) => void;
    onPhoneBlur: () => void;
    showPhoneOk: boolean;
    showPhoneError: boolean;
    phoneValid: boolean;
    cooldown: number;
    loadingSend: boolean;
    onSendCode: () => void;
}) {
    return (
        <RegisterCardShell
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
                            onBlur={onPhoneBlur}
                            onChange={onPhoneChange}
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
                            Dev: use test phone <span className="font-medium text-white/70">+995568740497</span> and
                            code{" "}
                            <span className="font-medium text-white/70">111111</span>.
                        </p>
                    )}
                </div>

                <Button
                    type="button"
                    className="w-full h-11 flex"
                    size="lg"
                    onClick={onSendCode}
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
        </RegisterCardShell>
    );
}