"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {ArrowLeft} from "lucide-react";

import {RegisterStepper} from "@/components/pages/register/RegisterStepper";
import {StepPhone} from "@/components/pages/register/steps/StepPhone";
import {StepOtp} from "@/components/pages/register/steps/StepOtp";
import {StepDetails} from "@/components/pages/register/steps/StepDetails";

import {useRegisterFlow} from "@/hooks/useRegisterFlow";

export default function Register() {
    const flow = useRegisterFlow();

    return (
        <div className="min-h-screen bg-[#05070b] text-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* LEFT hero */}
                <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 gradient-primary"/>
                    <div
                        className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]"/>
                    <div className="relative max-w-md text-center px-10 text-primary-foreground">
                        <h2 className="font-display text-4xl font-bold mb-4 text-black">
                            Start Your Transformation <br/> Today
                        </h2>
                        <p className="text-black/80 text-sm leading-relaxed">
                            Join thousands of fitness enthusiasts achieving their goals with AI-powered personalized
                            training.
                        </p>
                    </div>
                </div>

                {/* RIGHT panel */}
                <div className="flex flex-col">
                    {/* top area with logo + back */}
                    <div className="px-5 sm:px-8 lg:px-10 pt-8">
                        <div className="mx-auto w-full">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4"/>
                                    Back to home
                                </Link>

                                <Link href="/" className="hidden sm:inline-flex">
                                    <Image src="/logo.svg" alt="OptiFit" width={140} height={32} priority/>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* center area */}
                    <div className="px-5 sm:px-8 lg:px-10 pb-10 flex items-start justify-center my-auto">
                        <div className="w-full max-w-md pt-6 space-y-5">
                            <div className="mt-6 flex items-center justify-center sm:hidden">
                                <Image src="/logo.svg" alt="OptiFit" width={170} height={40} priority/>
                            </div>

                            <div className="text-center space-y-1">
                                <h1 className="font-display text-2xl font-bold">Create your account</h1>
                                <p className="text-white/60 text-sm">Complete verification in 3 quick steps</p>
                            </div>

                            <RegisterStepper step={flow.step}/>

                            {/* MUST stay mounted (required by your current recaptcha lifecycle) */}
                            <div id="recaptcha-container" className="hidden"/>

                            {flow.step === 1 ? (
                                <StepPhone
                                    phoneRaw={flow.phoneRaw}
                                    onPhoneBlur={flow.onPhoneBlur}
                                    onPhoneChange={flow.onPhoneChange}
                                    showPhoneOk={flow.showPhoneOk}
                                    showPhoneError={flow.showPhoneError}
                                    phoneValid={flow.phoneValid}
                                    cooldown={flow.cooldown}
                                    loadingSend={flow.loadingSend}
                                    onSendCode={flow.sendCode}
                                />
                            ) : null}

                            {flow.step === 2 ? (
                                <StepOtp
                                    otp={flow.otp}
                                    setOtp={flow.setOtp}
                                    loadingVerify={flow.loadingVerify}
                                    cooldown={flow.cooldown}
                                    onResend={flow.sendCode}
                                    onChangePhone={flow.goToStep1}
                                    onVerify={flow.verifyCode}
                                    phoneE164={flow.phoneE164}
                                    phoneRaw={flow.phoneRaw}
                                />
                            ) : null}

                            {flow.step === 3 ? (
                                <StepDetails
                                    name={flow.name}
                                    setName={flow.setName}
                                    email={flow.email}
                                    setEmail={flow.setEmail}
                                    password={flow.password}
                                    setPassword={flow.setPassword}
                                    password2={flow.password2}
                                    setPassword2={flow.setPassword2}
                                    showPass1={flow.showPass1}
                                    setShowPass1={flow.setShowPass1}
                                    showPass2={flow.showPass2}
                                    setShowPass2={flow.setShowPass2}
                                    detailsValid={flow.detailsValid}
                                    loadingCreate={flow.loadingCreate}
                                    onSubmit={flow.createAccount}
                                    onStartOver={flow.resetAll}
                                    phoneE164={flow.phoneE164}
                                />
                            ) : null}

                            <div className="pt-2 text-center text-[11px] text-white/45">
                                By creating an account, you agree to our{" "}
                                <Link href="/terms" className="text-white/65 underline underline-offset-4">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-white/65 underline underline-offset-4">
                                    Privacy Policy
                                </Link>
                                .
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}