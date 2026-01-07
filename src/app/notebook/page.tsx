"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {useToast} from "@/hooks/use-toast";
import NotebookHeader from "@/components/pages/notebook/NotebookHeader";
import NotebookEmptyCard from "@/components/pages/notebook/NotebookEmptyCard";
import ActiveWorkoutIntro from "@/components/pages/notebook/ActiveWorkoutIntro";
import ExerciseAccordion from "@/components/pages/notebook/ExerciseAccordion";
import {postJson} from "@/lib/api/postJson";
import type {
    ActiveWorkoutDay,
    ActiveWorkoutResponse,
    ProgramWeek,
    WorkoutSetData,
} from "@/lib/pages/notebook/types.ts";
import {normalizeWeek, todayWeekday} from "@/lib/pages/notebook/training.ts";
import {formatTime, safeNumber} from "@/lib/pages/notebook/format.ts";
import {makeDefaultWorkoutFromToday, validateWorkoutBeforeSave} from "@/lib/pages/notebook/workout.ts";

const API = {
    getTrainingPlan: "/api/workout/plan/get",
    getActiveWorkout: "/api/workout/get/active",
    startWorkout: "/api/workout/start",
    endWorkout: "/api/workout/end",
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

function isActiveWorkoutDay(v: unknown): v is ActiveWorkoutDay {
    if (!isObject(v)) return false;
    if (typeof v.day !== "string") return false;
    if (typeof v.rest !== "boolean") return false;
    if (typeof v.muscles !== "string") return false;

    if (!Array.isArray(v.exercises)) return false;

    return v.exercises.every((ex) => {
        if (!isObject(ex)) return false;
        if (typeof ex.name !== "string") return false;
        if (!Array.isArray(ex.data)) return false;

        return ex.data.every((s) => {
            if (!isObject(s)) return false;
            const w = s.weight;
            const r = s.reps;
            return (typeof w === "number" || typeof w === "string") && (typeof r === "number" || typeof r === "string");
        });
    });
}

function isActiveWorkoutResponse(v: unknown): v is ActiveWorkoutResponse {
    // Your type is probably: { date: string; workout: ActiveWorkoutDay } | null
    if (v === null) return true;
    if (!isObject(v)) return false;

    const date = v.date;
    if (typeof date !== "string") return false;

    const workout = v.workout;
    if (workout != null && !isActiveWorkoutDay(workout)) return false;

    return true;
}

export default function NotebookPage() {
    const {toast} = useToast();

    const [loading, setLoading] = React.useState(true);

    // training plan (from DB)
    const [plan, setPlan] = React.useState<ProgramWeek | null>(null);

    // active workout (from DB)
    const [active, setActive] = React.useState<ActiveWorkoutResponse>(null);

    // local editing state for the workout day we render
    const [workoutDay, setWorkoutDay] = React.useState<ActiveWorkoutDay | null>(null);

    // timer
    const [elapsed, setElapsed] = React.useState(0);
    const timerRef = React.useRef<number | null>(null);
    const startedAtRef = React.useRef<number | null>(null);

    // expand/collapse exercises
    const [expandedExercise, setExpandedExercise] = React.useState<string | null>(null);

    function stopTimer() {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        startedAtRef.current = null;
    }

    function startTimer(fromSeconds: number) {
        stopTimer();
        setElapsed(fromSeconds);
        startedAtRef.current = Date.now() - fromSeconds * 1000;

        timerRef.current = window.setInterval(() => {
            if (!startedAtRef.current) return;
            const diff = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
            setElapsed(diff);
        }, 1000);
    }

    async function loadAll() {
        setLoading(true);
        try {
            // 1) Load plan
            const {data: planData} = await postJson<ApiResp, EmptyObj>(API.getTrainingPlan, {});
            const planErr = get(planData, "error");
            if (planErr != null) {
                toast({title: "Notebook", description: String(planErr), variant: "destructive"});
                setPlan(null);
            } else {
                const raw = get(planData, "result");
                setPlan(raw ? normalizeWeek(raw) : null);
            }

            // 2) Load active workout (resume if exists)
            const {data: activeData} = await postJson<ApiResp, EmptyObj>(API.getActiveWorkout, {});
            const activeErr = get(activeData, "error");
            if (activeErr != null) {
                toast({title: "Notebook", description: String(activeErr), variant: "destructive"});
                setActive(null);
                setWorkoutDay(null);
                stopTimer();
                setElapsed(0);
                return;
            }

            const rawActive = get(activeData, "result") ?? null;

            const a: ActiveWorkoutResponse = isActiveWorkoutResponse(rawActive) ? rawActive : null;
            setActive(a);

            if (a?.workout) {
                setWorkoutDay(a.workout);

                const startedAt = Date.parse(a.date);
                const restored = Number.isFinite(startedAt) ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0;

                startTimer(restored);
            } else {
                setWorkoutDay(null);
                stopTimer();
                setElapsed(0);
            }
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        void loadAll();
        return () => stopTimer();
    }, []);

    async function handleStartWorkout() {
        if (!plan) {
            toast({
                title: "No training plan",
                description: "Generate your training plan first.",
                variant: "destructive",
            });
            return;
        }

        const candidate = makeDefaultWorkoutFromToday(plan);
        if (!candidate) {
            toast({
                title: "No workout scheduled",
                description: "Today is a rest day (or plan missing). Start a workout from Training page by modifying schedule.",
                variant: "destructive",
            });
            return;
        }

        const {data} = await postJson<ApiResp, { day: ActiveWorkoutDay }>(API.startWorkout, {day: candidate});
        const err = get(data, "error");
        if (err != null) {
            toast({title: "Start workout", description: String(err), variant: "destructive"});
            return;
        }

        setWorkoutDay(candidate);
        setActive({date: new Date().toISOString(), workout: candidate});
        setExpandedExercise(candidate.exercises[0]?.name ?? null);
        startTimer(0);

        toast({title: "Workout started", description: "Tracking is live. Fill sets and hit Save at the end."});
    }

    async function handleEndWorkout() {
        if (!workoutDay) return;

        const errMsg = validateWorkoutBeforeSave(workoutDay);
        if (errMsg) {
            toast({title: "Cannot save", description: errMsg, variant: "destructive"});
            return;
        }

        const {data} = await postJson<ApiResp, { day: ActiveWorkoutDay; timer: number }>(API.endWorkout, {
            day: workoutDay,
            timer: elapsed,
        });

        const err = get(data, "error");
        if (err != null) {
            toast({title: "Save workout", description: String(err), variant: "destructive"});
            return;
        }

        stopTimer();
        setElapsed(0);
        setActive(null);
        setWorkoutDay(null);
        setExpandedExercise(null);

        toast({variant: "success", title: "Saved", description: "Workout saved successfully."});
    }

    function updateSet(exIdx: number, setIdx: number, patch: Partial<WorkoutSetData>) {
        setWorkoutDay((prev) => {
            if (!prev) return prev;
            const next = structuredClone(prev) as ActiveWorkoutDay;
            next.exercises[exIdx].data[setIdx] = {
                ...next.exercises[exIdx].data[setIdx],
                ...patch,
            };
            return next;
        });
    }

    function addSet(exIdx: number) {
        setWorkoutDay((prev) => {
            if (!prev) return prev;
            const next = structuredClone(prev) as ActiveWorkoutDay;
            next.exercises[exIdx].data.push({weight: 0, reps: 0});
            return next;
        });
    }

    function removeSet(exIdx: number) {
        setWorkoutDay((prev) => {
            if (!prev) return prev;
            const next = structuredClone(prev) as ActiveWorkoutDay;
            if (next.exercises[exIdx].data.length <= 1) return prev;
            next.exercises[exIdx].data.pop();
            return next;
        });
    }

    const today = todayWeekday();
    const todaysPlan = plan?.find((d) => d.day === today) ?? null;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <NotebookHeader hasWorkout={!!workoutDay} elapsedText={formatTime(elapsed)} onSave={handleEndWorkout}
                                onEnd={handleEndWorkout}/>

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

                {!loading && !workoutDay &&
                    <NotebookEmptyCard todaysPlan={todaysPlan} canStart={!!plan} onStart={handleStartWorkout}/>}

                {!loading && workoutDay && (
                    <div className="space-y-4">
                        <ActiveWorkoutIntro day={workoutDay.day} muscles={workoutDay.muscles}/>

                        <div className="space-y-4">
                            {workoutDay.exercises.map((ex, exIdx) => (
                                <ExerciseAccordion
                                    key={`${workoutDay.day}-${ex.name}-${exIdx}`}
                                    ex={ex}
                                    exIdx={exIdx}
                                    open={expandedExercise === ex.name}
                                    onToggle={() => setExpandedExercise(expandedExercise === ex.name ? null : ex.name)}
                                    onAddSet={addSet}
                                    onRemoveSet={removeSet}
                                    onUpdateSet={updateSet}
                                    safeNumber={safeNumber}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}