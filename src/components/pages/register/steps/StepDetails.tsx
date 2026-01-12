"use client";

import * as React from "react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

import {Eye, EyeOff, Mail, Lock, User, CheckCircle2, RotateCcw} from "lucide-react";
import {maskedPhone} from "@/lib/pages/register/utils";

import {RegisterCardShell} from "../RegisterCardShell";

export function StepDetails({
                                name,
                                setName,
                                email,
                                setEmail,
                                password,
                                setPassword,
                                password2,
                                setPassword2,
                                showPass1,
                                setShowPass1,
                                showPass2,
                                setShowPass2,
                                detailsValid,
                                loadingCreate,
                                onSubmit,
                                onStartOver,
                                phoneE164,
                            }: {
    name: string;
    setName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    password2: string;
    setPassword2: (v: string) => void;
    showPass1: boolean;
    setShowPass1: React.Dispatch<React.SetStateAction<boolean>>;
    showPass2: boolean;
    setShowPass2: React.Dispatch<React.SetStateAction<boolean>>;
    detailsValid: boolean;
    loadingCreate: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onStartOver: () => void;
    phoneE164: string;
}) {
    return (
        <form onSubmit={onSubmit}>
            <RegisterCardShell
                title="Account details"
                subtitle="Create your login credentials to finish."
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-400"/>}
            >
                <div className="space-y-5">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-emerald-200">
                                <CheckCircle2 className="h-4 w-4"/>
                                <span className="font-medium">Phone verified</span>
                            </div>
                            <span className="text-xs text-white/80 font-medium">{maskedPhone(phoneE164)}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white/80">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-11 pl-10 bg-white/[0.03] border-white/10 focus:border-white/25"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white/80">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 pl-10 bg-white/[0.03] border-white/10 focus:border-white/25"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/80">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                <Input
                                    id="password"
                                    type={showPass1 ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass1((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                                >
                                    {showPass1 ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </button>
                            </div>
                            <p className="text-xs text-white/45">Must be at least 8 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password2" className="text-white/80">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                                <Input
                                    id="password2"
                                    type={showPass2 ? "text" : "password"}
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass2((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white"
                                >
                                    {showPass2 ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </button>
                            </div>

                            {password2 && password !== password2 ?
                                <p className="text-xs text-red-400">Passwords do not match</p> : null}
                        </div>
                    </div>

                    <div className="space-y-2 pt-1">
                        <Button className="w-full h-11" type="submit" disabled={!detailsValid || loadingCreate}>
                            {loadingCreate ? "Creating..." : "Create Account"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
                            onClick={onStartOver}
                            disabled={loadingCreate}
                        >
                            <RotateCcw className="mr-2 h-4 w-4"/>
                            Start over
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
        </form>
    );
}