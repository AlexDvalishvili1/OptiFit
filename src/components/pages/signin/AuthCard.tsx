"use client";

import * as React from "react";

export function AuthCard({children}: { children: React.ReactNode }) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">{children}</div>;
}