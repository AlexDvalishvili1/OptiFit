"use client";

import * as React from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Eye, EyeOff, Lock} from "lucide-react";

export function PasswordField({
                                  label,
                                  value,
                                  onChange,
                                  show,
                                  onToggle,
                                  helper,
                                  error,
                              }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    helper?: React.ReactNode;
    error?: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-white/80">{label}</Label>

            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 pl-10 pr-11 bg-white/[0.03] border-white/10 focus:border-white/25"
                    placeholder="••••••••"
                    minLength={8}
                    required
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/50 hover:text-white focus:outline-none"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
            </div>

            {helper ? helper : null}
            {error ? error : null}
        </div>
    );
}