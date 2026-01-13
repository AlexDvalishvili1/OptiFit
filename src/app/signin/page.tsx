"use client";

import * as React from "react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Lock, Eye, EyeOff} from "lucide-react";
import {useSignInFlow} from "@/hooks/useSignInFlow";
import {AuthHero} from "@/components/pages/signin/AuthHero";
import {AuthPanelShell} from "@/components/pages/signin/AuthPanelShell";
import {AuthCard} from "@/components/pages/signin/AuthCard";
import {PhoneField} from "@/components/pages/signin/PhoneField";

export default function SignInPage() {
    const flow = useSignInFlow();

    return (
        <div className="min-h-screen bg-[#05070b] text-white">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* LEFT panel */}
                <AuthPanelShell title="Welcome back" subtitle="Sign in to continue your fitness journey">
                    <AuthCard>
                        <form onSubmit={flow.submit} className="space-y-5">
                            <PhoneField
                                value={flow.phoneRaw}
                                onChange={flow.onPhoneChange}
                                onBlur={flow.onPhoneBlur}
                                showOk={flow.showPhoneOk}
                                showError={flow.showPhoneError}
                            />

                            {/* PASSWORD + working forgot link (right place) */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-white/80">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-[#10d3d3] hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>

                                    <Input
                                        type={flow.showPassword ? "text" : "password"}
                                        value={flow.password}
                                        onChange={(e) => flow.setPassword(e.target.value)}
                                        className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                        placeholder="••••••••"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => flow.setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white focus:outline-none"
                                        aria-label={flow.showPassword ? "Hide password" : "Show password"}
                                    >
                                        {flow.showPassword ? (
                                            <EyeOff className="h-4 w-4"/>
                                        ) : (
                                            <Eye className="h-4 w-4"/>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={flow.loading}>
                                {flow.loading ? "Signing in..." : "Sign in"}
                            </Button>

                            <div className="text-center text-xs text-white/60">
                                Don&apos;t have an account?{" "}
                                <Link href="/register" className="text-[#10d3d3] hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </AuthCard>
                </AuthPanelShell>

                {/* RIGHT hero */}
                <AuthHero/>
            </div>
        </div>
    );
}