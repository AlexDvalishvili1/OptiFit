"use client";

import * as React from "react";
import {Label} from "@/components/ui/label";
import {CheckCircle2, AlertCircle} from "lucide-react";

import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";

export function PhoneField({
                               value,
                               onChange,
                               onBlur,
                               showOk,
                               showError,
                           }: {
    value: string;
    onChange: (v: string) => void;
    onBlur: () => void;
    showOk: boolean;
    showError: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-white/80">Phone Number</Label>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-white/25">
                <PhoneInput
                    defaultCountry="ge"
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    inputClassName="!bg-transparent !text-white !outline-none !border-0 !shadow-none !w-full"
                    countrySelectorStyleProps={{
                        buttonClassName:
                            "!bg-transparent !border-0 !shadow-none !px-1 !py-0 !text-white hover:!bg-white/5 rounded-md",
                        dropdownStyleProps: {
                            className:
                                "dark:!bg-zinc-950 dark:!text-zinc-100 !bg-white !text-zinc-900 !border !rounded-xl !shadow-xl !mt-2 !overflow-y-auto overflow-hidden",
                        },
                    }}
                />
            </div>

            <div className="min-h-[18px] text-xs">
                {showOk ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4"/>
                        <span>Valid phone number</span>
                    </div>
                ) : showError ? (
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="h-4 w-4"/>
                        <span>Please enter a valid phone number</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}