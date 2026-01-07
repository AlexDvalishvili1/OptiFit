"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {useToast} from "@/hooks/use-toast";
import type {ProgramDay, ProgramWeek, ActiveWorkoutDay} from "@/components/pages/training/types.ts";
import TrainingHeader from "@/components/pages/training/TrainingHeader";
import TrainingEmptyState from "@/components/pages/training/TrainingEmptyState";
import TrainingModifyCard from "@/components/pages/training/TrainingModifyCard";
import TrainingDayCard from "@/components/pages/training/TrainingDayCard";

function isValidProgramWeek(x): x is ProgramWeek {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!Array.isArray(x) || x.length !== 7) return false;
    for (const d of x) {
        if (!d || typeof d !== "object") return false;
        if (typeof d.day !== "string") return false;
        if (typeof d.rest !== "boolean") return false;
        if (typeof d.muscles !== "string") return false;
        if (!Array.isArray(d.exercises)) return false;
        for (const e of d.exercises) {
            if (!e || typeof e !== "object") return false;
            if (typeof e.name !== "string") return false;
            if (typeof e.sets !== "string") return false;
            if (typeof e.reps !== "string") return false;
            if (typeof e.instructions !== "string") return false;
            if (typeof e.video !== "string") return false;
        }
    }
    const set = new Set(x.map((d) => d.day));
    return days.every((d) => set.has(d));
}

function normalizeWeek(raw): ProgramWeek | null {
    const normalized = Array.isArray(raw) && raw.length === 1 && Array.isArray(raw[0]) ? raw[0] : raw;
    return isValidProgramWeek(normalized) ? (normalized as ProgramWeek) : null;
}

function todayWeekday() {
    return new Date().toLocaleDateString("en-US", {weekday: "long"});
}

function todayISODateKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

const LS_KEYS = {modCount: (dayKey: string) => `optifit_training_mods_${dayKey}`};

function getLocalNumber(key: string, fallback = 0) {
    try {
        const v = localStorage.getItem(key);
        if (!v) return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    } catch {
        return fallback;
    }
}

function setLocalNumber(key: string, n: number) {
    try {
        localStorage.setItem(key, String(n));
    } catch {
        return false;
    }
}

const API = {
    getTraining: "/api/workout/plan/get",
    aiTraining: "/api/workout/plan/generate",
    startWorkout: "/api/workout/start",
    getActiveWorkout: "/api/workout/get/active",
};

const ROUTES = {notebook: "/notebook"};

function toActiveWorkoutDay(day: ProgramDay): ActiveWorkoutDay {
    return {
        day: day.day,
        muscles: day.muscles,
        rest: day.rest,
        exercises: (day.exercises || []).map((ex) => {
            const setsCount = Math.max(1, Number(ex.sets) || 1);
            return {name: ex.name, data: Array.from({length: setsCount}).map(() => ({weight: 0, reps: 0}))};
        }),
    };
}

export default function TrainingPage() {
    const {toast} = useToast();
    const router = useRouter();

    const [loading, setLoading] = React.useState(true);
    const [plan, setPlan] = React.useState<ProgramWeek | null>(null);
    const [rawPlan, setRawPlan] = React.useState<string | null>(null);

    const [expandedDay, setExpandedDay] = React.useState<string | null>(todayWeekday());
    const [generating, setGenerating] = React.useState(false);
    const [modifying, setModifying] = React.useState(false);

    const [prompt, setPrompt] = React.useState("");
    const promptTrimmed = prompt.trim();

    const dayKey = React.useMemo(() => todayISODateKey(), []);
    const [modsLeft, setModsLeft] = React.useState(2);

    const [openHowTo, setOpenHowTo] = React.useState<Record<string, boolean>>({});
    const [startingDay, setStartingDay] = React.useState<string | null>(null);
    const [hasActiveWorkout, setHasActiveWorkout] = React.useState(false);

    function toggleHowTo(key: string) {
        setOpenHowTo((prev) => ({...prev, [key]: !prev[key]}));
    }

    function refreshModLimit() {
        const used = getLocalNumber(LS_KEYS.modCount(dayKey), 0);
        setModsLeft(Math.max(0, 2 - used));
    }

    React.useEffect(() => {
        refreshModLimit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function postJson(url: string, body?) {
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: body ? JSON.stringify(body) : undefined,
        });

        let data = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }
        return {res, data};
    }

    async function loadTraining() {
        setLoading(true);
        try {
            const {data} = await postJson(API.getTraining);
            if (data?.error) {
                toast({title: "Training", description: String(data.error), variant: "destructive"});
                setPlan(null);
                setRawPlan(null);
                return;
            }

            const raw = data?.result ?? null;
            setRawPlan(raw);
            if (!raw) {
                setPlan(null);
                return;
            }

            const parsed = normalizeWeek(raw);
            if (!parsed) {
                toast({
                    title: "Training JSON error",
                    description: "Saved training plan has wrong structure in DB.",
                    variant: "destructive",
                });
                setPlan(null);
                return;
            }
            setPlan(parsed);
        } finally {
            setLoading(false);
        }
    }

    async function loadActiveWorkoutFlag() {
        const {data} = await postJson(API.getActiveWorkout);
        if (data?.error) return;
        setHasActiveWorkout(!!data?.result);
    }

    React.useEffect(() => {
        loadTraining();
        loadActiveWorkoutFlag();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleGenerate() {
        setGenerating(true);
        try {
            const {data} = await postJson(API.aiTraining, {regenerate: true});
            if (data?.error) {
                toast({title: "Training", description: String(data.error), variant: "destructive"});
                return;
            }

            const raw = data?.result;
            if (!raw) {
                toast({
                    title: "Backend response issue",
                    description: "AI route must return { result: <JSON> }.",
                    variant: "destructive",
                });
                return;
            }

            let parsed = null;
            try {
                parsed = JSON.parse(raw);
            } catch {
                parsed = null;
            }

            const week = normalizeWeek(parsed);
            if (!week) {
                toast({
                    title: "AI JSON invalid",
                    description: "AI returned invalid JSON structure.",
                    variant: "destructive"
                });
                return;
            }

            setRawPlan(parsed);
            setPlan(week);
            setOpenHowTo({});
            toast({variant: "success", title: "Program generated", description: "Your weekly plan is ready."});
        } finally {
            setGenerating(false);
        }
    }

    async function handleModify() {
        if (!plan) {
            toast({title: "No program yet", description: "Generate your weekly plan first.", variant: "destructive"});
            return;
        }

        refreshModLimit();
        if (modsLeft <= 0) {
            toast({
                title: "Limit reached",
                description: "You can modify your training plan only 2 times per day.",
                variant: "destructive",
            });
            return;
        }

        if (promptTrimmed.length < 4) {
            toast({title: "Too short", description: "Write a clear plan-related request.", variant: "destructive"});
            return;
        }

        setModifying(true);
        try {
            const {data} = await postJson(API.aiTraining, {modifying: promptTrimmed});
            if (data?.error) {
                toast({title: "Training", description: String(data.error), variant: "destructive"});
                return;
            }

            const raw = data?.result;
            if (!raw) {
                toast({
                    title: "Backend response issue",
                    description: "AI route must return { result: <JSON> }.",
                    variant: "destructive",
                });
                return;
            }

            let parsed = null;
            try {
                parsed = JSON.parse(raw);
            } catch {
                parsed = null;
            }

            const week = normalizeWeek(parsed);
            if (!week) {
                toast({
                    title: "AI JSON invalid",
                    description: "AI returned invalid JSON structure.",
                    variant: "destructive"
                });
                return;
            }

            setRawPlan(parsed);
            setPlan(week);
            setPrompt("");

            const used = getLocalNumber(LS_KEYS.modCount(dayKey), 0);
            setLocalNumber(LS_KEYS.modCount(dayKey), used + 1);
            refreshModLimit();

            setOpenHowTo({});
            toast({title: "Plan updated", description: "Your weekly program was modified."});
        } finally {
            setModifying(false);
        }
    }

    async function handleStartWorkout(day: ProgramDay) {
        if (hasActiveWorkout) {
            toast({title: "Workout in progress", description: "Resuming your active workout."});
            router.push(ROUTES.notebook);
            return;
        }

        if (day.rest || !day.exercises?.length) {
            toast({title: "Rest day", description: "No workout scheduled for this day.", variant: "destructive"});
            return;
        }

        setStartingDay(day.day);
        try {
            const payload = toActiveWorkoutDay(day);
            const {data} = await postJson(API.startWorkout, {day: payload});

            if (data?.error) {
                toast({title: "Start workout", description: String(data.error), variant: "destructive"});
                return;
            }

            setHasActiveWorkout(true);
            toast({title: "Workout started", description: `Started ${day.day}. Redirecting to Notebook…`});
            router.push(ROUTES.notebook);
        } finally {
            setStartingDay(null);
        }
    }

    const today = todayWeekday();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <TrainingHeader
                    hasPlan={!!plan}
                    loading={loading}
                    generating={generating}
                    onGenerate={handleGenerate}
                />

                {loading && (
                    <div className="p-8 rounded-2xl bg-card border border-border">
                        <div className="animate-pulse space-y-3">
                            <div className="h-6 w-56 bg-accent rounded"/>
                            <div className="h-4 w-80 bg-accent rounded"/>
                            <div className="h-28 w-full bg-accent rounded"/>
                        </div>
                    </div>
                )}

                {!loading && !plan && <TrainingEmptyState generating={generating} onGenerate={handleGenerate}/>}

                {!loading && plan && (
                    <TrainingModifyCard
                        modsLeft={modsLeft}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        modifying={modifying}
                        canApply={!modifying && modsLeft > 0 && promptTrimmed.length >= 4}
                        onApply={handleModify}
                    />
                )}

                {!loading && plan && (
                    <div className="space-y-4">
                        {plan.map((day) => {
                            const isToday = day.day === today;
                            const expanded = expandedDay === day.day;
                            const isStartingThisDay = startingDay === day.day;

                            return (
                                <TrainingDayCard
                                    key={day.day}
                                    day={day}
                                    isToday={isToday}
                                    expanded={expanded}
                                    onToggleExpand={() => setExpandedDay(expanded ? null : day.day)}
                                    openHowTo={openHowTo}
                                    onToggleHowTo={toggleHowTo}
                                    hasActiveWorkout={hasActiveWorkout}
                                    isStartingThisDay={isStartingThisDay}
                                    onStartWorkout={() => handleStartWorkout(day)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}