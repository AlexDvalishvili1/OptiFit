"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout";
import {useToast} from "@/hooks/use-toast";

import HistoryHeader from "@/components/pages/history/HistoryHeader";
import HistorySearch from "@/components/pages/history/HistorySearch";
import HistoryEmpty from "@/components/pages/history/HistoryEmpty";
import HistoryWorkoutCard from "@/components/pages/history/HistoryWorkoutCard";

import {postJson} from "@/lib/api/postJson";
import type {HistoryItem} from "@/lib/pages/history/types";
import {formatDate, formatDuration} from "@/lib/pages/history/format";
import {getTotalSets, getTotalVolume} from "@/lib/pages/history/stats";

const API = {
    getHistory: "/api/workout/get/history",
};

type ApiResp = { result?: unknown; error?: unknown };
type EmptyObj = Record<string, never>;

type UnknownRecord = Record<string, unknown>;

function isObject(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function get(obj: unknown, key: string): unknown {
    return isObject(obj) ? obj[key] : undefined;
}

function isHistoryItemArray(v: unknown): v is HistoryItem[] {
    if (!Array.isArray(v)) return false;

    // Lightweight structural check (keeps UI safe without being too strict)
    return v.every((x) => {
        if (!isObject(x)) return false;
        return typeof x.date === "string" || x.date instanceof Date; // depending on your app
    });
}

export default function HistoryPage() {
    const {toast} = useToast();

    const [loading, setLoading] = React.useState(true);
    const [history, setHistory] = React.useState<HistoryItem[]>([]);
    const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    async function loadHistory() {
        setLoading(true);
        try {
            const {data} = await postJson<ApiResp, EmptyObj>(API.getHistory, {});

            const err = get(data, "error");
            if (err != null) {
                toast({title: "History", description: String(err), variant: "destructive"});
                setHistory([]);
                return;
            }

            const result = get(data, "result");
            const items: HistoryItem[] = isHistoryItemArray(result) ? result : [];

            const filtered = items.filter((x) => x.active !== true);
            setHistory(filtered);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        void loadHistory();
    }, []);

    const filteredHistory = React.useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase();

        return history.filter((w) => {
            const datePretty = formatDate(w.date).toLowerCase();
            const dateIso = String(w.date).toLowerCase();

            // workout is often optional/unknown-ish; guard before reading
            const workout = isObject(w.workout) ? w.workout : null;
            const dayName = String(workout?.day ?? "").toLowerCase();
            const muscles = String(workout?.muscles ?? "").toLowerCase();

            return datePretty.includes(q) || dateIso.includes(q) || dayName.includes(q) || muscles.includes(q);
        });
    }, [history, searchQuery]);

    const clearSearch = () => setSearchQuery("");

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <HistoryHeader/>

                <HistorySearch value={searchQuery} onChange={setSearchQuery} onClear={clearSearch}/>

                {loading && (
                    <div className="p-8 rounded-2xl bg-card border border-border">
                        <div className="animate-pulse space-y-3">
                            <div className="h-6 w-56 bg-accent rounded"/>
                            <div className="h-4 w-80 bg-accent rounded"/>
                            <div className="h-28 w-full bg-accent rounded"/>
                        </div>
                    </div>
                )}

                {!loading && filteredHistory.length === 0 && <HistoryEmpty/>}

                {!loading && filteredHistory.length > 0 && (
                    <div className="space-y-4">
                        {filteredHistory.map((workout, idx) => (
                            <HistoryWorkoutCard
                                key={`${workout.date}-${idx}`}
                                workout={workout}
                                idx={idx}
                                selected={selectedIdx === idx}
                                onToggle={(i) => setSelectedIdx(selectedIdx === i ? null : i)}
                                formatDate={formatDate}
                                formatDuration={formatDuration}
                                getTotalVolume={getTotalVolume}
                                getTotalSets={getTotalSets}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}