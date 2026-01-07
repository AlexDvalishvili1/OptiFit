// src/app/history/page.tsx

"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {Calendar, Clock, Dumbbell, ChevronRight, Search, X} from "lucide-react";
import HistoryHeader from "@/components/pages/history/HistoryHeader";
import HistorySearch from "@/components/pages/history/HistorySearch";
import HistoryEmpty from "@/components/pages/history/HistoryEmpty";
import HistoryWorkoutCard from "@/components/pages/history/HistoryWorkoutCard";

type WorkoutSetData = {
    weight: number;
    reps: number;
};

type HistoryExercise = {
    name: string;
    data: WorkoutSetData[];
};

type HistoryWorkoutDay = {
    day: string;
    muscles: string;
    rest: boolean;
    exercises: HistoryExercise[];
};

type HistoryItem = {
    date: string; // ISO date/time
    active?: boolean;
    timer?: number; // seconds
    workout: HistoryWorkoutDay;
};

// ✅ UPDATE THIS ROUTE TO MATCH YOUR APP ROUTE
const API = {
    getHistory: "/api/workout/get/history",
};

function formatDate(dateString: string) {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatDuration(timerSeconds?: number) {
    if (!timerSeconds || timerSeconds <= 0) return null;
    const mins = Math.round(timerSeconds / 60);
    return `${mins} min`;
}

function getTotalVolume(exercises: HistoryExercise[]) {
    return exercises.reduce((total, ex) => {
        const v = ex.data.reduce((s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
        return total + v;
    }, 0);
}

function getTotalSets(exercises: HistoryExercise[]) {
    return exercises.reduce((total, ex) => total + (ex.data?.length || 0), 0);
}

export default function HistoryPage() {
    const {toast} = useToast();

    const [loading, setLoading] = React.useState(true);
    const [history, setHistory] = React.useState<HistoryItem[]>([]);
    const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    async function postJson(url: string) {
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
        });

        let data = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }
        return {res, data};
    }

    async function loadHistory() {
        setLoading(true);
        try {
            const {data} = await postJson(API.getHistory);

            if (data?.error) {
                toast({title: "History", description: String(data.error), variant: "destructive"});
                setHistory([]);
                return;
            }

            const items = Array.isArray(data?.result) ? (data.result as HistoryItem[]) : [];
            // filter out active sessions (optional)
            const filtered = items.filter((x) => !x?.active);
            setHistory(filtered);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredHistory = React.useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase();
        return history.filter((w) => {
            const datePretty = formatDate(w.date).toLowerCase();
            const dateIso = String(w.date).toLowerCase();
            const dayName = String(w.workout?.day ?? "").toLowerCase();
            const muscles = String(w.workout?.muscles ?? "").toLowerCase();
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