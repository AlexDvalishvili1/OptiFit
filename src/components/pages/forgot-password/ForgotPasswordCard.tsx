"use client";

import * as React from "react";

export function ForgotPasswordCard({children}: { children: React.ReactNode }) {
    return (
        <div
            className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            {children}
        </div>
    );
}