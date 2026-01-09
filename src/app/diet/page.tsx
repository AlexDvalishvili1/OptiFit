"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout";
import {useToast} from "@/hooks/use-toast";
import DietHeader from "@/components/pages/diet/DietHeader";
import DietEmptyState from "@/components/pages/diet/DietEmptyState";
import DietMacroOverview from "@/components/pages/diet/DietMacroOverview";
import DietModifyCard from "@/components/pages/diet/DietModifyCard";
import DietMealCard from "@/components/pages/diet/DietMealCard";
import {postJson} from "@/lib/api/postJson";
import type {DietPlan} from "@/lib/pages/diet/types";
import {tryParseDietJson} from "@/lib/pages/diet/parse";
import {calcMealTotals} from "@/lib/pages/diet/totals";

const API = {
    getDietByDate: "/api/diet/get", // POST { date }
    aiDiet: "/api/diet/generate", // POST { modifying, userModifications? }
};

type ApiResp = { result?: unknown; error?: unknown };

export default function DietPage() {
    const {toast} = useToast();

    const [loading, setLoading] = React.useState(true);

    const [plan, setPlan] = React.useState<DietPlan | null>(null);
    const [rawPlan, setRawPlan] = React.useState<string | null>(null);

    const [generating, setGenerating] = React.useState(false);
    const [modifying, setModifying] = React.useState(false);

    const [prompt, setPrompt] = React.useState("");
    const promptTrimmed = prompt.trim();

    async function loadTodayDiet() {
        setLoading(true);
        try {
            const {data} = await postJson<ApiResp>(API.getDietByDate, {
                date: new Date().toISOString(),
            });

            if (data?.error) {
                toast({title: "Diet", description: String(data.error)});
                setPlan(null);
                setRawPlan(null);
                return;
            }

            const raw: string | null = typeof data?.result === "string" ? data.result : null;
            setRawPlan(raw);

            if (!raw) {
                setPlan(null);
                return;
            }

            const parsed = tryParseDietJson(raw);
            if (!parsed) {
                toast({
                    title: "Diet JSON error",
                    description: "Saved diet is not valid JSON. (Check AI output / storage).",
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

    function validateBackendResult(raw: unknown) {
        const text = raw as string | undefined;

        // IMPORTANT: your backend MUST return { result: text } not { result: "text" }
        if (!text || text === "text") {
            toast({
                title: "Backend response issue",
                description: 'Fix your backend to: return Response(JSON.stringify({ result: text }))',
                variant: "destructive",
            });
            return null;
        }

        return text;
    }

    async function handleGenerate() {
        setGenerating(true);
        try {
            const {data} = await postJson<ApiResp>(API.aiDiet, {modifying: false});

            if (data?.error) {
                toast({title: "Diet", description: String(data.error), variant: "destructive"});
                return;
            }

            const raw = validateBackendResult(data?.result);
            if (!raw) return;

            const parsed = tryParseDietJson(raw);
            if (!parsed) {
                toast({
                    title: "AI JSON invalid",
                    description: "AI returned invalid JSON. Backend should treat JSON.parse failure as mistake/ban.",
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

            const {data} = await postJson<ApiResp>(API.aiDiet, {
                modifying: true,
                userModifications: promptTrimmed,
            });

            if (data?.error) {
                toast({title: "Diet", description: String(data.error), variant: "destructive"});
                return;
            }

            const raw = validateBackendResult(data?.result);
            if (!raw) return;

            const parsed = tryParseDietJson(raw);
            if (!parsed) {
                toast({title: "AI JSON invalid", description: "AI returned invalid JSON.", variant: "destructive"});
                return;
            }

            setRawPlan(raw);
            setPlan(parsed);

            toast({title: "Diet updated", description: "Your plan was modified."});
        } finally {
            setModifying(false);
        }
    }

    const mealTotals = React.useMemo(() => {
        if (!plan) return [];
        return calcMealTotals(plan);
    }, [plan]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <DietHeader/>

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
                {!loading && !plan && <DietEmptyState generating={generating} onGenerate={handleGenerate}/>}

                {!loading && plan && (
                    <>
                        <DietMacroOverview
                            calories={plan.calories}
                            protein={plan.protein}
                            carbs={plan.carbohydrates}
                            fat={plan.fat}
                        />

                        <DietModifyCard
                            prompt={prompt}
                            setPrompt={setPrompt}
                            modifying={modifying}
                            canApply={!modifying && promptTrimmed.length >= 6}
                            onApply={handleModify}
                        />

                        <div className="space-y-4">
                            {plan.meals.map((meal, i) => (
                                <DietMealCard key={`${meal.name}-${meal.time}-${i}`} meal={meal} totals={mealTotals[i]}
                                              index={i}/>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
