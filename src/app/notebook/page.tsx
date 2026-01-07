// src/app/notebook/page.tsx

"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {
    Play,
    Square,
    Plus,
    Minus,
    Check,
    Clock,
    Dumbbell,
    Save,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import NotebookHeader from "@/components/pages/notebook/NotebookHeader";
import NotebookEmptyCard from "@/components/pages/notebook/NotebookEmptyCard";
import ActiveWorkoutIntro from "@/components/pages/notebook/ActiveWorkoutIntro";
import ExerciseAccordion from "@/components/pages/notebook/ExerciseAccordion";

type ProgramExercise = {
    name: string;
    sets: string; // "4"
    reps: string; // "6-10"
    instructions: string;
    video: string;
};

type ProgramDay = {
    day: string;
    rest: boolean;
    muscles: string;
    exercises: ProgramExercise[];
};

type ProgramWeek = ProgramDay[];

/** What we store/send to your workout endpoints */
type WorkoutSetData = {
    weight: number; // must be number >= 0
    reps: number; // must be number >= 0
};

type ActiveExercise = {
    name: string;
    data: WorkoutSetData[]; // each set is {weight, reps}
};

type ActiveWorkoutDay = {
    day: string;
    muscles: string;
    rest: boolean;
    exercises: ActiveExercise[];
};

type ActiveWorkoutResponse =
    | null
    | {
    date: string; // start date/time
    workout: ActiveWorkoutDay;
};

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
    // your plan getter returns [[week]] sometimes
    const normalized = Array.isArray(raw) && raw.length === 1 && Array.isArray(raw[0]) ? raw[0] : raw;
    return isValidProgramWeek(normalized) ? (normalized as ProgramWeek) : null;
}

function todayWeekday() {
    return new Date().toLocaleDateString("en-US", {weekday: "long"});
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function safeNumber(v: string) {
    if (v === "") return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}

// ✅ UPDATE THESE ROUTES TO MATCH YOUR APP ROUTES
const API = {
    getTrainingPlan: "/api/workout/plan/get",
    getActiveWorkout: "/api/workout/get/active",
    startWorkout: "/api/workout/start",
    endWorkout: "/api/workout/end",
};

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

    function makeDefaultWorkoutFromToday(planWeek: ProgramWeek): ActiveWorkoutDay | null {
        const today = todayWeekday();
        const day = planWeek.find((d) => d.day === today);
        if (!day || day.rest || !day.exercises?.length) return null;

        const exercises: ActiveExercise[] = day.exercises.map((ex) => {
            const setsCount = Math.max(1, Number(ex.sets) || 1);
            return {
                name: ex.name,
                data: Array.from({length: setsCount}).map(() => ({
                    weight: 0,
                    reps: 0,
                })),
            };
        });

        return {
            day: day.day,
            muscles: day.muscles,
            rest: false,
            exercises,
        };
    }

    async function loadAll() {
        setLoading(true);
        try {
            // 1) Load plan
            const planRes = await postJson(API.getTrainingPlan);
            if (planRes.data?.error) {
                toast({title: "Notebook", description: String(planRes.data.error), variant: "destructive"});
                setPlan(null);
            } else {
                const raw = planRes.data?.result ?? null;
                const parsed = raw ? normalizeWeek(raw) : null;
                setPlan(parsed);
            }

            // 2) Load active workout (resume if exists)
            const activeRes = await postJson(API.getActiveWorkout);
            if (activeRes.data?.error) {
                toast({title: "Notebook", description: String(activeRes.data.error), variant: "destructive"});
                setActive(null);
                setWorkoutDay(null);
                stopTimer();
                setElapsed(0);
                return;
            }

            const a = (activeRes.data?.result ?? null) as ActiveWorkoutResponse;
            setActive(a);

            if (a?.workout) {
                setWorkoutDay(a.workout);

                // restore elapsed from start date (best-effort)
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
        loadAll();
        return () => stopTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleStartWorkout() {
        if (!plan) {
            toast({
                title: "No training plan",
                description: "Generate your training plan first.",
                variant: "destructive"
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

        // persist start in DB
        const {data} = await postJson(API.startWorkout, {day: candidate});
        if (data?.error) {
            toast({title: "Start workout", description: String(data.error), variant: "destructive"});
            return;
        }

        setWorkoutDay(candidate);
        setActive({date: new Date().toISOString(), workout: candidate});
        setExpandedExercise(candidate.exercises[0]?.name ?? null);
        startTimer(0);

        toast({title: "Workout started", description: "Tracking is live. Fill sets and hit Save at the end."});
    }

    function validateWorkoutBeforeSave(day: ActiveWorkoutDay) {
        for (const ex of day.exercises) {
            for (const s of ex.data) {
                const keys = Object.keys(s) as (keyof WorkoutSetData)[];
                for (const k of keys) {
                    const v = s[k];
                    if (v === null || v === undefined) return "Invalid input";
                    if (Number.isNaN(v)) return "Invalid input";
                    if (typeof v !== "number") return "Invalid input";
                    if (v < 0) return "Invalid input";
                }
            }
        }
        return null;
    }

    async function handleEndWorkout() {
        if (!workoutDay) return;

        const err = validateWorkoutBeforeSave(workoutDay);
        if (err) {
            toast({title: "Cannot save", description: err, variant: "destructive"});
            return;
        }

        const {data} = await postJson(API.endWorkout, {day: workoutDay, timer: elapsed});
        if (data?.error) {
            toast({title: "Save workout", description: String(data.error), variant: "destructive"});
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
                <NotebookHeader
                    hasWorkout={!!workoutDay}
                    elapsedText={formatTime(elapsed)}
                    onSave={handleEndWorkout}
                    onEnd={handleEndWorkout}
                />

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

                {!loading && !workoutDay && (
                    <NotebookEmptyCard
                        todaysPlan={todaysPlan as any}
                        canStart={!!plan}
                        onStart={handleStartWorkout}
                    />
                )}

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