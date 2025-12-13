"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {Calendar, Clock, Dumbbell, ChevronRight, Search, X} from "lucide-react";

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
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">Workout History</h1>
                    <p className="text-muted-foreground mt-1">Review your past training sessions</p>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="text"
                        placeholder="Search by date, day, muscles…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="p-8 rounded-2xl bg-card border border-border">
                        <div className="animate-pulse space-y-3">
                            <div className="h-6 w-56 bg-accent rounded"/>
                            <div className="h-4 w-80 bg-accent rounded"/>
                            <div className="h-28 w-full bg-accent rounded"/>
                        </div>
                    </div>
                )}

                {!loading && filteredHistory.length === 0 && (
                    <div className="text-center py-16">
                        <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-10 w-10 text-primary"/>
                        </div>
                        <h2 className="font-display text-xl font-semibold mb-2">No Workouts Yet</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Start logging your workouts in the Notebook to see your history here.
                        </p>
                    </div>
                )}

                {!loading && filteredHistory.length > 0 && (
                    <div className="space-y-4">
                        {filteredHistory.map((workout, idx) => {
                            const selected = selectedIdx === idx;
                            const volume = getTotalVolume(workout.workout?.exercises || []);
                            const sets = getTotalSets(workout.workout?.exercises || []);
                            const duration = formatDuration(workout.timer);
                            const exCount = workout.workout?.exercises?.length || 0;

                            return (
                                <div
                                    key={`${workout.date}-${idx}`}
                                    className={cn(
                                        "rounded-2xl bg-card border border-border overflow-hidden transition-all",
                                        selected && "ring-2 ring-primary"
                                    )}
                                >
                                    <button
                                        onClick={() => setSelectedIdx(selected ? null : idx)}
                                        className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div
                                                className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                                                <Dumbbell className="h-6 w-6 text-primary-foreground"/>
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="font-display text-lg font-semibold truncate">{formatDate(workout.date)}</h3>
                                                <div
                                                    className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4"/>
                              {duration ?? "—"}
                          </span>
                                                    <span>{exCount} exercises</span>
                                                    <span
                                                        className="hidden sm:inline truncate">• {workout.workout?.muscles}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="hidden sm:block text-right">
                                                <p className="font-display text-lg font-semibold">{volume.toLocaleString()} kg</p>
                                                <p className="text-sm text-muted-foreground">Total Volume</p>
                                            </div>

                                            <ChevronRight
                                                className={cn("h-5 w-5 text-muted-foreground transition-transform", selected && "rotate-90")}
                                            />
                                        </div>
                                    </button>

                                    {selected && (
                                        <div className="px-6 pb-6 animate-fade-in">
                                            <div className="border-t border-border pt-6">
                                                {/* Summary */}
                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                                                        <p className="font-display text-2xl font-bold">{exCount}</p>
                                                        <p className="text-sm text-muted-foreground">Exercises</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                                                        <p className="font-display text-2xl font-bold">{sets}</p>
                                                        <p className="text-sm text-muted-foreground">Sets</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                                                        <p className="font-display text-2xl font-bold">{volume.toLocaleString()}</p>
                                                        <p className="text-sm text-muted-foreground">Volume (kg)</p>
                                                    </div>
                                                </div>

                                                {/* Exercise details */}
                                                <div className="space-y-4">
                                                    {(workout.workout?.exercises || []).map((ex, exIdx) => (
                                                        <div key={`${ex.name}-${exIdx}`}
                                                             className="p-4 rounded-2xl bg-accent/20 border border-border">
                                                            <div className="flex items-center gap-3 mb-4">
                                <span
                                    className="h-8 w-8 rounded-xl bg-background flex items-center justify-center text-sm font-semibold">
                                  {exIdx + 1}
                                </span>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-semibold truncate">{ex.name}</h4>
                                                                    <p className="text-sm text-muted-foreground">{ex.data?.length || 0} sets</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <span className="text-muted-foreground">Set</span>
                                                                <span className="text-muted-foreground">Weight</span>
                                                                <span className="text-muted-foreground">Reps</span>

                                                                {ex.data?.map((s, i) => (
                                                                    <React.Fragment key={`${ex.name}-row-${i}`}>
                                                                        <span className="font-medium">{i + 1}</span>
                                                                        <span>{Number(s.weight || 0)} kg</span>
                                                                        <span>{Number(s.reps || 0)}</span>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}