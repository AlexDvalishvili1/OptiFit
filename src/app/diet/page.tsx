"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import {
    Sparkles,
    RefreshCw,
    Flame,
    Clock,
    Utensils,
    AlertTriangle,
    Wand2,
} from "lucide-react";

type DietFood = {
    name: string;
    serving: string;
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
};

type DietMeal = {
    name: string;
    time: string; // "08:00"
    foods: DietFood[];
};

type DietPlan = {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    meals: DietMeal[];
};

function isValidDietPlan(x): x is DietPlan {
    return (
        x &&
        typeof x === "object" &&
        typeof x.calories === "number" &&
        typeof x.protein === "number" &&
        typeof x.fat === "number" &&
        typeof x.carbohydrates === "number" &&
        Array.isArray(x.meals) &&
        x.meals.every(
            (m) =>
                m &&
                typeof m.name === "string" &&
                typeof m.time === "string" &&
                Array.isArray(m.foods) &&
                m.foods.every(
                    (f) =>
                        f &&
                        typeof f.name === "string" &&
                        typeof f.serving === "string" &&
                        typeof f.calories === "number" &&
                        typeof f.protein === "number" &&
                        typeof f.fat === "number" &&
                        typeof f.carbohydrates === "number"
                )
        )
    );
}

function tryParseDietJson(raw: string): DietPlan | null {
    try {
        const parsed = JSON.parse(raw);
        return isValidDietPlan(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

// ✅ Put your real routes here
const API = {
    getDietByDate: "/api/diet/get", // POST { date }
    aiDiet: "/api/diet/generate", // POST { modifying, userModifications? }
};

export default function DietPage() {
    const {toast} = useToast();

    const [loading, setLoading] = React.useState(true);

    const [plan, setPlan] = React.useState<DietPlan | null>(null);
    const [rawPlan, setRawPlan] = React.useState<string | null>(null);

    const [generating, setGenerating] = React.useState(false);
    const [modifying, setModifying] = React.useState(false);

    const [prompt, setPrompt] = React.useState("");
    const promptTrimmed = prompt.trim();

    async function postJson(url: string, body) {
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        let data = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }

        return {res, data};
    }

    async function loadTodayDiet() {
        setLoading(true);
        try {
            const {data} = await postJson(API.getDietByDate, {
                date: new Date().toISOString(),
            });

            if (data?.error) {
                toast({
                    title: "Diet",
                    description: String(data.error),
                });
                setPlan(null);
                setRawPlan(null);
                return;
            }

            const raw: string | null = data?.result ?? null;
            setRawPlan(raw);

            if (!raw) {
                setPlan(null);
                return;
            }

            const parsed = tryParseDietJson(raw);
            if (!parsed) {
                toast({
                    title: "Diet JSON error",
                    description:
                        "Saved diet is not valid JSON. (Check AI output / storage).",
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
        loadTodayDiet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleGenerate() {
        setGenerating(true);
        try {
            const {data} = await postJson(API.aiDiet, {modifying: false});

            if (data?.error) {
                toast({
                    title: "Diet",
                    description: String(data.error),
                    variant: "destructive",
                });
                return;
            }

            const raw: string | undefined = data?.result;

            // IMPORTANT: your backend MUST return { result: text } not { result: "text" }
            if (!raw || raw === "text") {
                toast({
                    title: "Backend response issue",
                    description:
                        'Fix your backend to: return Response(JSON.stringify({ result: text }))',
                    variant: "destructive",
                });
                return;
            }

            const parsed = tryParseDietJson(raw);
            if (!parsed) {
                toast({
                    title: "AI JSON invalid",
                    description:
                        "AI returned invalid JSON. Backend should treat JSON.parse failure as mistake/ban.",
                    variant: "destructive",
                });
                return;
            }

            setRawPlan(raw);
            setPlan(parsed);

            toast({
                title: "Diet generated",
                description: "Today’s diet plan is ready.",
                variant: "success",
            });
        } finally {
            setGenerating(false);
        }
    }

    async function handleModify() {
        if (!plan) {
            toast({
                title: "No diet yet",
                description: "Generate today’s diet first.",
                variant: "destructive",
            });
            return;
        }

        if (promptTrimmed.length < 6) {
            toast({
                title: "Too short",
                description: "Write a clear diet-related request.",
                variant: "destructive",
            });
            return;
        }

        setModifying(true);
        try {
            setPrompt("");

            const {data} = await postJson(API.aiDiet, {
                modifying: true,
                userModifications: promptTrimmed,
            });

            if (data?.error) {
                toast({
                    title: "Diet",
                    description: String(data.error),
                    variant: "destructive",
                });
                return;
            }

            const raw: string | undefined = data?.result;

            if (!raw || raw === "text") {
                toast({
                    title: "Backend response issue",
                    description:
                        'Fix your backend to: return Response(JSON.stringify({ result: text }))',
                    variant: "destructive",
                });
                return;
            }

            const parsed = tryParseDietJson(raw);
            if (!parsed) {
                toast({
                    title: "AI JSON invalid",
                    description: "AI returned invalid JSON.",
                    variant: "destructive",
                });
                return;
            }

            setRawPlan(raw);
            setPlan(parsed);

            toast({title: "Diet updated", description: "Your plan was modified."});
        } finally {
            setModifying(false);
        }
    }

    // totals per meal
    const mealTotals = React.useMemo(() => {
        if (!plan) return [];
        return plan.meals.map((m) => {
            return m.foods.reduce(
                (acc, f) => {
                    acc.calories += Number(f.calories) || 0;
                    acc.protein += Number(f.protein) || 0;
                    acc.fat += Number(f.fat) || 0;
                    acc.carbohydrates += Number(f.carbohydrates) || 0;
                    return acc;
                },
                {calories: 0, protein: 0, fat: 0, carbohydrates: 0}
            );
        });
    }, [plan]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">
                            AI Diet Plan
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Opens today’s diet if it exists. Otherwise generate it. You can
                            request modifications using the textarea.
                        </p>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="p-8 rounded-2xl bg-card border border-border">
                        <div className="animate-pulse space-y-3">
                            <div className="h-6 w-40 bg-accent rounded"/>
                            <div className="h-4 w-72 bg-accent rounded"/>
                            <div className="h-24 w-full bg-accent rounded"/>
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
                                <h2 className="font-display text-xl font-semibold">
                                    No diet for today
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Generate your meal plan based on your profile.
                                </p>
                                <div className="mt-4">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={loading || generating}
                                        className="h-11"
                                    >
                                        {generating ? (
                                            <>
                                                <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5"/>
                                                Generate Diet
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan */}
                {!loading && plan && (
                    <>
                        {/* Macro Overview */}
                        <div className="p-6 rounded-2xl gradient-primary text-primary-foreground">
                            <div className="flex items-center gap-3 mb-6">
                                <Flame className="h-6 w-6"/>
                                <h2 className="font-display text-xl font-semibold">
                                    Daily Targets
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="font-display text-3xl font-bold">
                                        {plan.calories}
                                    </p>
                                    <p className="text-primary-foreground/80 text-sm">Calories</p>
                                </div>
                                <div>
                                    <p className="font-display text-3xl font-bold">
                                        {plan.protein}g
                                    </p>
                                    <p className="text-primary-foreground/80 text-sm">Protein</p>
                                </div>
                                <div>
                                    <p className="font-display text-3xl font-bold">
                                        {plan.carbohydrates}g
                                    </p>
                                    <p className="text-primary-foreground/80 text-sm">Carbs</p>
                                </div>
                                <div>
                                    <p className="font-display text-3xl font-bold">{plan.fat}g</p>
                                    <p className="text-primary-foreground/80 text-sm">Fat</p>
                                </div>
                            </div>
                        </div>

                        {/* Modify */}
                        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                                        <Wand2 className="h-5 w-5"/>
                                        Modify today’s diet
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Example: “Avocado is expensive, replace it with something
                                        similar.”
                                    </p>
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm">
                                    <Clock className="h-4 w-4"/>
                                    <span className="text-muted-foreground">
                    Backend controls warnings/bans
                  </span>
                                </div>
                            </div>

                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Type a diet-related request…"
                                className="min-h-[110px]"
                                disabled={modifying}
                            />

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground">
                                    ⚠️ Non-diet prompts: first warning, then backend bans you (5
                                    min, doubles).
                                </p>

                                <Button
                                    onClick={handleModify}
                                    disabled={modifying || promptTrimmed.length < 6}
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

                        {/* Meals */}
                        <div className="space-y-4">
                            {plan.meals.map((meal, idx) => {
                                const t = mealTotals[idx];
                                return (
                                    <div
                                        key={`${meal.name}-${meal.time}-${idx}`}
                                        className="rounded-2xl bg-card border border-border overflow-hidden"
                                    >
                                        <div
                                            className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                                    <Utensils className="h-5 w-5"/>
                                                </div>

                                                <div>
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4"/>
                                {meal.time}
                            </span>
                                                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40"/>
                                                        <span className="uppercase tracking-wide text-xs">
                              Meal {idx + 1}
                            </span>
                                                    </div>
                                                    <h3 className="font-display text-lg font-semibold mt-1">
                                                        {meal.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-display text-lg font-semibold">
                                                    {t.calories} kcal
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    P: {t.protein}g · C: {t.carbohydrates}g · F: {t.fat}g
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-border">
                                            <div className="p-6 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                    <tr className="text-left text-muted-foreground">
                                                        <th className="pb-3 font-medium">Food</th>
                                                        <th className="pb-3 font-medium">Serving</th>
                                                        <th className="pb-3 font-medium text-right">
                                                            Cal
                                                        </th>
                                                        <th className="pb-3 font-medium text-right">P</th>
                                                        <th className="pb-3 font-medium text-right">C</th>
                                                        <th className="pb-3 font-medium text-right">F</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {meal.foods.map((f, i) => (
                                                        <tr
                                                            key={`${f.name}-${i}`}
                                                            className="border-t border-border/60"
                                                        >
                                                            <td className="py-3 font-medium">{f.name}</td>
                                                            <td className="py-3 text-muted-foreground">
                                                                {f.serving}
                                                            </td>
                                                            <td className="py-3 text-right">{f.calories}</td>
                                                            <td className="py-3 text-right">{f.protein}</td>
                                                            <td className="py-3 text-right">
                                                                {f.carbohydrates}
                                                            </td>
                                                            <td className="py-3 text-right">{f.fat}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>

                                                {/* Debug */}
                                                {/* <pre className="mt-4 text-xs overflow-auto">{rawPlan}</pre> */}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}