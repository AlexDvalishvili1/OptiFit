"use client";

import * as React from "react";

export function RegisterCardShell({
                                      title,
                                      subtitle,
                                      icon,
                                      children,
                                  }: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="flex items-start gap-3">
                {icon ? (
                    <div className="mt-0.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">{icon}</div>
                ) : null}
                <div className="space-y-1">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    {subtitle ? <p className="text-xs text-white/60">{subtitle}</p> : null}
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </div>
    );
}