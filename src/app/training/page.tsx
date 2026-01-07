"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {useToast} from "@/hooks/use-toast";
import type {ProgramDay, ProgramWeek} from "@/components/pages/training/types.ts";
import TrainingHeader from "@/components/pages/training/TrainingHeader";
import TrainingEmptyState from "@/components/pages/training/TrainingEmptyState";
import TrainingModifyCard from "@/components/pages/training/TrainingModifyCard";
import TrainingDayCard from "@/components/pages/training/TrainingDayCard";
import {postJson} from "@/lib/api/postJson";
import {normalizeWeek, todayWeekday} from "@/lib/pages/training/plan.ts";
import {getLocalNumber, LS_KEYS, setLocalNumber, todayISODateKey} from "@/lib/pages/training/storage.ts";
import {toActiveWorkoutDay} from "@/lib/pages/training/transform.ts";
import {parseJsonSafe} from "@/lib/api/parseJsonSafe.ts";

const API = {
    getTraining: "/api/workout/plan/get",
    aiTraining: "/api/workout/plan/generate",
    startWorkout: "/api/workout/start",
    getActiveWorkout: "/api/workout/get/active",
};

const ROUTES = {notebook: "/notebook"};

type ApiResp = { result?: unknown; error?: unknown };
type EmptyObj = Record<string, never>;

type UnknownRecord = Record<string, unknown>;

function isObject(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function get(obj: unknown, key: string): unknown {
    return isObject(obj) ? obj[key] : undefined;
}

export default function TrainingPage() {
    const {toast} = useToast();
    const router = useRouter();

    const [loading, setLoading] = React.useState(true);
    const [plan, setPlan] = React.useState<ProgramWeek | null>(null);
    const [rawPlan, setRawPlan] = React.useState<unknown>(null);

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

    async function loadTraining() {
        setLoading(true);
        try {
            const {data} = await postJson<ApiResp, EmptyObj>(API.getTraining, {});
            const err = get(data, "error");
            if (err != null) {
                toast({title: "Training", description: String(err), variant: "destructive"});
                setPlan(null);
                setRawPlan(null);
                return;
            }

            const raw = get(data, "result") ?? null;
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
        const {data} = await postJson<ApiResp, EmptyObj>(API.getActiveWorkout, {});
        const err = get(data, "error");
        if (err != null) return;
        setHasActiveWorkout(Boolean(get(data, "result")));
    }

    React.useEffect(() => {
        void loadTraining();
        void loadActiveWorkoutFlag();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleGenerate() {
        setGenerating(true);
        try {
            const {data} = await postJson<ApiResp, { regenerate: boolean }>(API.aiTraining, {regenerate: true});
            const err = get(data, "error");
            if (err != null) {
                toast({title: "Training", description: String(err), variant: "destructive"});
                return;
            }

            const raw = get(data, "result");
            if (raw == null) {
                toast({
                    title: "Backend response issue",
                    description: "AI route must return { result: <JSON> }.",
                    variant: "destructive",
                });
                return;
            }

            const parsed = typeof raw === "string" ? parseJsonSafe(raw) : raw;
            const week = normalizeWeek(parsed);
            if (!week) {
                toast({
                    title: "AI JSON invalid",
                    description: "AI returned invalid JSON structure.",
                    variant: "destructive",
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
            const {data} = await postJson<ApiResp, { modifying: string }>(API.aiTraining, {modifying: promptTrimmed});
            const err = get(data, "error");
            if (err != null) {
                toast({title: "Training", description: String(err), variant: "destructive"});
                return;
            }

            const raw = get(data, "result");
            if (raw == null) {
                toast({
                    title: "Backend response issue",
                    description: "AI route must return { result: <JSON> }.",
                    variant: "destructive",
                });
                return;
            }

            const parsed = typeof raw === "string" ? parseJsonSafe(raw) : raw;
            const week = normalizeWeek(parsed);
            if (!week) {
                toast({
                    title: "AI JSON invalid",
                    description: "AI returned invalid JSON structure.",
                    variant: "destructive",
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
            const {data} = await postJson<ApiResp, { day: ReturnType<typeof toActiveWorkoutDay> }>(API.startWorkout, {
                day: payload,
            });

            const err = get(data, "error");
            if (err != null) {
                toast({title: "Start workout", description: String(err), variant: "destructive"});
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
                <TrainingHeader hasPlan={!!plan} loading={loading} generating={generating} onGenerate={handleGenerate}/>

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
                                    onStartWorkout={() => void handleStartWorkout(day)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}