"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {
    Dumbbell,
    Clock,
    Sparkles,
    RefreshCw,
    AlertTriangle,
    Wand2,
    Youtube,
    ChevronDown,
    ChevronUp,
    Info,
} from "lucide-react";

type ProgramExercise = {
    name: string;
    sets: string;
    reps: string;
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

/** Frontend-only modify limit: 2/day */
const LS_KEYS = {
    modCount: (dayKey: string) => `optifit_training_mods_${dayKey}`,
};

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

function splitSteps(instructions: string) {
    return instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

// ✅ Your real routes
const API = {
    getTraining: "/api/workout/plan/get",
    aiTraining: "/api/workout/plan/generate",
};

export default function TrainingPage() {
    const {toast} = useToast();

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

    // per-exercise "How to do" collapses
    const [openHowTo, setOpenHowTo] = React.useState<Record<string, boolean>>({});

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

    React.useEffect(() => {
        loadTraining();
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
                    variant: "destructive",
                });
                return;
            }

            setRawPlan(parsed);
            setPlan(week);
            setOpenHowTo({}); // reset all expanded “How to do”
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

            // optional UX: collapse all how-to after changes
            setOpenHowTo({});

            toast({title: "Plan updated", description: "Your weekly program was modified."});
        } finally {
            setModifying(false);
        }
    }

    const today = todayWeekday();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">AI Training Program</h1>
                        <p className="text-muted-foreground mt-1">
                            Loads your plan from database. Regenerate is available once per week.
                        </p>
                    </div>

                    {plan &&
                        <Button onClick={handleGenerate} disabled={loading || generating} className="h-11">
                            {generating ? (
                                <>
                                    <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5"/>
                                    {plan ? "Regenerate (weekly)" : "Generate Program"}
                                </>
                            )}
                        </Button>
                    }
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

                {/* Empty */}
                {!loading && !plan && (
                    <div className="p-8 rounded-2xl bg-card border border-border">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6"/>
                            </div>
                            <div className="flex-1">
                                <h2 className="font-display text-xl font-semibold">No program yet</h2>
                                <p className="text-muted-foreground mt-1">Generate your weekly gym plan based on your
                                    profile.</p>
                                <div className="mt-4">
                                    <Button onClick={handleGenerate} disabled={generating}>
                                        {generating ? (
                                            <>
                                                <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5"/>
                                                Generate Program
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modify */}
                {!loading && plan && (
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                                    <Wand2 className="h-5 w-5"/>
                                    Modify your program
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Example: “No Friday.” / “I have scoliosis.” / “Only dumbbells available.”
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm">
                                <Clock className="h-4 w-4"/>
                                <span className="font-medium">{modsLeft}</span>
                                <span className="text-muted-foreground">mods left today</span>
                            </div>
                        </div>

                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Type a plan-related request…"
                            className="min-h-[110px]"
                            disabled={modifying}
                        />

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">⚠️ Non-plan prompts → warning, then backend
                                bans (5 min, doubles).</p>

                            <Button
                                onClick={handleModify}
                                disabled={modifying || modsLeft <= 0 || promptTrimmed.length < 4}
                                className="h-11"
                            >
                                {modifying ? (
                                    <>
                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                        Modifying...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-5 w-5"/>
                                        Apply Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Weekly Plan */}
                {!loading && plan && (
                    <div className="space-y-4">
                        {plan.map((day) => {
                            const isToday = day.day === today;
                            const expanded = expandedDay === day.day;

                            return (
                                <div
                                    key={day.day}
                                    className={cn(
                                        "rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300",
                                        isToday && "ring-2 ring-primary"
                                    )}
                                >
                                    {/* Day header */}
                                    <button
                                        onClick={() => setExpandedDay(expanded ? null : day.day)}
                                        className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center",
                                                    day.rest ? "bg-muted" : "gradient-primary"
                                                )}
                                            >
                                                <Dumbbell
                                                    className={cn(
                                                        "h-6 w-6",
                                                        day.rest ? "text-muted-foreground" : "text-primary-foreground"
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-display text-lg font-semibold">{day.day}</h3>
                                                    {isToday && (
                                                        <span
                                                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                              Today
                            </span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground">{day.rest ? "Rest Day" : day.muscles}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{day.rest ? "Rest" : `${day.exercises.length} exercises`}</span>
                                            {expanded ? (
                                                <ChevronUp className="h-5 w-5 text-muted-foreground"/>
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground"/>
                                            )}
                                        </div>
                                    </button>

                                    {/* Day body */}
                                    {expanded && (
                                        <div className="px-6 pb-6 animate-fade-in">
                                            <div className="border-t border-border pt-6">
                                                {day.rest ? (
                                                    <div
                                                        className="p-4 rounded-xl bg-accent/30 text-sm text-muted-foreground">
                                                        Recovery day. Optional: light walk, mobility, easy stretching.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {day.exercises.map((ex, idx) => {
                                                            const key = `${day.day}__${idx}__${ex.name}`;
                                                            const open = !!openHowTo[key];
                                                            const steps = splitSteps(ex.instructions || "");
                                                            const hasHowTo = steps.length > 0;

                                                            return (
                                                                <div
                                                                    key={key}
                                                                    className="rounded-2xl border border-border bg-accent/20 hover:bg-accent/30 transition-colors"
                                                                >
                                                                    {/* Exercise row */}
                                                                    <div
                                                                        className="p-4 flex items-start justify-between gap-4">
                                                                        <div className="flex items-start gap-4 min-w-0">
                                      <span
                                          className="h-9 w-9 shrink-0 rounded-xl bg-background flex items-center justify-center text-sm font-semibold">
                                        {idx + 1}
                                      </span>

                                                                            <div className="min-w-0">
                                                                                <p className="font-medium truncate">{ex.name}</p>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {ex.sets} sets · {ex.reps}
                                                                                </p>

                                                                                <div
                                                                                    className="mt-3 flex flex-wrap items-center gap-2">
                                                                                    {hasHowTo && (
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() => toggleHowTo(key)}
                                                                                            className="h-9 rounded-xl"
                                                                                        >
                                                                                            <Info
                                                                                                className="mr-2 h-4 w-4"/>
                                                                                            How to do
                                                                                            <span
                                                                                                className="ml-2 inline-flex">
                                                {open ? (
                                                    <ChevronUp className="h-4 w-4"/>
                                                ) : (
                                                    <ChevronDown className="h-4 w-4"/>
                                                )}
                                              </span>
                                                                                        </Button>
                                                                                    )}

                                                                                    {ex.video?.startsWith("https://") && (
                                                                                        <a
                                                                                            href={ex.video}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                                                                        >
                                                                                            <Youtube
                                                                                                className="h-5 w-5"/>
                                                                                            Video
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* How-to panel */}
                                                                    {hasHowTo && open && (
                                                                        <div className="px-4 pb-4">
                                                                            <div
                                                                                className="rounded-xl bg-background/70 border border-border p-4">
                                                                                <div
                                                                                    className="flex items-center justify-between gap-3">
                                                                                    <p className="text-sm font-medium">How
                                                                                        to do it</p>
                                                                                    <span
                                                                                        className="text-xs text-muted-foreground">
                                            {steps.length} steps
                                          </span>
                                                                                </div>

                                                                                <div className="mt-3 grid gap-2">
                                                                                    {steps.map((s, i) => (
                                                                                        <div
                                                                                            key={`${key}-step-${i}`}
                                                                                            className="flex items-start gap-3 rounded-lg bg-accent/30 px-3 py-2"
                                                                                        >
                                              <span
                                                  className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-background flex items-center justify-center text-xs font-semibold">
                                                {i + 1}
                                              </span>
                                                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                                                {s}
                                                                                            </p>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                        <div
                                                            className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                                                            <p className="text-sm text-muted-foreground">Rest between
                                                                sets: 60-90 seconds</p>
                                                            <Button variant="outline" size="sm">
                                                                Start This Workout
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Optional debug */}
                                            {/* <pre className="mt-4 text-xs overflow-auto">{JSON.stringify(rawPlan, null, 2)}</pre> */}
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