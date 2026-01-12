"use client";

import * as React from "react";
import {cn} from "@/lib/utils";
import {CheckCircle2} from "lucide-react";
import type {RegisterStep} from "@/lib/pages/register/utils";

export function RegisterStepper({step}: { step: RegisterStep }) {
    const items = [
        {n: 1, label: "Phone", sub: "Enter number"},
        {n: 2, label: "OTP", sub: "Confirm code"},
        {n: 3, label: "Details", sub: "Create account"},
    ] as const;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3 max-[350px]:gap-2">
                {items.map((it, idx) => {
                    const done = step > it.n;
                    const active = step === it.n;

                    return (
                        <div key={it.n} className="flex-1">
                            <div className="flex items-center gap-3 max-[350px]:gap-1.5">
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold",
                                        done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
                                        active && !done && "border-white/20 bg-white/5 text-white",
                                        !active && !done && "border-white/10 text-white/55"
                                    )}
                                >
                                    {done ? <CheckCircle2 className="h-4 w-4"/> : it.n}
                                </div>

                                <div className="min-w-0">
                                    <div
                                        className={cn("text-xs font-semibold", active ? "text-white" : "text-white/70")}>
                                        {it.label}
                                    </div>
                                    <div className="text-[11px] text-white/45">{it.sub}</div>
                                </div>
                            </div>

                            {idx < items.length - 1 ? (
                                <div className="mt-3 h-[2px] w-full rounded-full bg-white/10">
                                    <div
                                        className={cn(
                                            "h-[2px] rounded-full transition-all",
                                            step > it.n ? "w-full bg-emerald-400/60" : active ? "w-1/2 bg-white/25" : "w-0 bg-white/0"
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="mt-3 h-[2px]"/>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}