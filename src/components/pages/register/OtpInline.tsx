"use client";

import * as React from "react";
import {cn} from "@/lib/utils";

export function OtpInline({
                              value,
                              onChange,
                              disabled,
                          }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    const refs = React.useRef<(HTMLInputElement | null)[]>([]);

    return (
        <div className="flex justify-center gap-2 max-[350px]:gap-1">
            {Array.from({length: 6}).map((_, i) => {
                const c = value[i] ?? "";
                return (
                    <input
                        key={i}
                        ref={(el) => {
                            refs.current[i] = el;
                        }}
                        value={c}
                        disabled={disabled}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className={cn(
                            "h-12 w-10 rounded-xl border border-white/10 bg-white/[0.03] text-center text-lg text-white outline-none",
                            "focus:border-white/25 focus:bg-white/[0.05] disabled:opacity-60"
                        )}
                        onChange={(e) => {
                            const digit = e.target.value.replace(/\D/g, "").slice(-1);
                            const arr = value.split("");
                            arr[i] = digit;

                            const next = arr.join("").slice(0, 6);
                            onChange(next);

                            if (digit && i < 5) refs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus();
                            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
                            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
                        }}
                    />
                );
            })}
        </div>
    );
}