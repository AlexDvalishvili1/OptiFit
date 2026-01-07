"use client";

import {Input} from "@/components/ui/input";
import {Search, X} from "lucide-react";

export default function HistorySearch({
                                          value,
                                          onChange,
                                          onClear,
                                      }: {
    value: string;
    onChange: (v: string) => void;
    onClear: () => void;
}) {
    return (
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input
                type="text"
                placeholder="Search by date, day, muscles…"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-10"
            />
            {value && (
                <button
                    onClick={onClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4"/>
                </button>
            )}
        </div>
    );
}