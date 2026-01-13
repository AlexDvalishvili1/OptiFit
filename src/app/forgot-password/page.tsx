"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, KeyRound, RotateCcw} from "lucide-react";
import {useForgotPasswordFlow} from "@/hooks/useForgotPasswordFlow";
import {PhoneField} from "@/components/pages/signin/PhoneField";
import {OtpInline} from "@/components/pages/register/OtpInline";

export default function ForgotPasswordPage() {
    const flow = useForgotPasswordFlow();

    return (
        <div className="min-h-screen bg-[#05070b] text-white">
            <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10 sm:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/signin"
                          className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
                        <ArrowLeft className="h-4 w-4"/>
                        Back to sign in
                    </Link>

                    <Link href="/" className="hidden sm:inline-flex">
                        <Image src="/logo.svg" alt="OptiFit" width={140} height={32} priority/>
                    </Link>
                </div>

                <div className="mb-6 flex items-center justify-center sm:hidden">
                    <Image src="/logo.svg" alt="OptiFit" width={170} height={40} priority/>
                </div>

                <div className="text-center space-y-1">
                    <h1 className="font-display text-2xl font-bold">Reset password</h1>
                    <p className="text-white/60 text-sm">
                        Verify your phone and set a new password.
                    </p>
                </div>

                {/* MUST stay mounted for invisible recaptcha */}
                <div id="recaptcha-container" className="hidden"/>

                <div
                    className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                    {flow.step === 1 ? (
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
                                {flow.loadingSend ? "Sending..." : flow.cooldown > 0 ? `Resend in ${flow.cooldown}s` : "Send code"}
                            </Button>

                            <p className="text-center text-xs text-white/55">
                                We will send a 6-digit code to your phone.
                            </p>
                        </div>
                    ) : null}

                    {flow.step === 2 ? (
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
                                        className={cn("text-[#10d3d3] hover:underline", flow.cooldown > 0 && "opacity-40 pointer-events-none")}
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
                    ) : null}

                    {flow.step === 3 ? (
                        <form onSubmit={flow.submitReset} className="space-y-5">
                            <div
                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
                                <div className="flex items-center gap-2 text-emerald-200">
                                    <CheckCircle2 className="h-4 w-4"/>
                                    <span className="font-medium">Phone verified</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/80">New password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                    <Input
                                        type={flow.showPass1 ? "text" : "password"}
                                        value={flow.newPassword}
                                        onChange={(e) => flow.setNewPassword(e.target.value)}
                                        className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                        placeholder="••••••••"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => flow.setShowPass1(!flow.showPass1)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                                    >
                                        {flow.showPass1 ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>
                                <p className="text-xs text-white/45">Must be at least 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/80">Confirm new password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                    <Input
                                        type={flow.showPass2 ? "text" : "password"}
                                        value={flow.newPassword2}
                                        onChange={(e) => flow.setNewPassword2(e.target.value)}
                                        className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                        placeholder="••••••••"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => flow.setShowPass2(!flow.showPass2)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                                    >
                                        {flow.showPass2 ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>
                                {flow.newPassword2 && flow.newPassword !== flow.newPassword2 ? (
                                    <p className="text-xs text-red-400">Passwords do not match</p>
                                ) : null}
                            </div>

                            <Button className="w-full h-11" type="submit"
                                    disabled={!flow.resetValid || flow.loadingReset}>
                                {flow.loadingReset ? "Updating..." : "Update password"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
                                onClick={flow.goBackToPhone}
                                disabled={flow.loadingReset}
                            >
                                <RotateCcw className="mr-2 h-4 w-4"/>
                                Start over
                            </Button>
                        </form>
                    ) : null}

                    {flow.step === 4 ? (
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
                    ) : null}
                </div>

                <div className="pt-6 text-center text-[11px] text-white/45">
                    Need help?{" "}
                    <Link href="/support" className="text-white/65 underline underline-offset-4">
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}