"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {useToast} from "@/hooks/use-toast";
import DashboardHeader from "@/components/pages/dashboard/DashboardHeader.tsx";
import StatsGrid from "@/components/pages/dashboard/StatsGrid";
import TodayOverview from "@/components/pages/dashboard/TodayOverview";
import QuickActions from "@/components/pages/dashboard/QuickActions";
import {postJson} from "@/lib/api/postJson";
import {readJsonSafe} from "@/lib/api/readJsonSafe";
import type {DbUser, DietPlan, ProgramWeek, WorkoutHistoryItem} from "@/lib/pages/dashboard/types.ts";
import {todayWeekday, parseISODate, startOfWeekMonday, endOfWeekSunday} from "@/lib/pages/dashboard/date.ts";
import {normalizeWeek} from "@/lib/pages/dashboard/training.ts";
import {normalizeDiet} from "@/lib/pages/dashboard/diet.ts";
import {goalLabels, activityLabels} from "@/lib/pages/dashboard/labels.ts";

const API = {
    getTraining: "/api/workout/plan/get",
    getHistory: "/api/workout/get/history",
    getUser: "/api/auth/me",
    getDiet: "/api/diet/get",
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

function isGoal(v: unknown): v is NonNullable<DbUser["goal"]> {
    return v === "lose weight" || v === "maintain" || v === "build muscle" || v === "improve endurance";
}

function isActivity(v: unknown): v is NonNullable<DbUser["activity"]> {
    return v === "bmr" || v === "sedentary" || v === "light" || v === "moderate" || v === "active" || v === "very active";
}

export default function Dashboard() {
    const {toast} = useToast();

    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<DbUser | null>(null);
    const [plan, setPlan] = React.useState<ProgramWeek | null>(null);
    const [diet, setDiet] = React.useState<DietPlan | null>(null);
    const [history, setHistory] = React.useState<WorkoutHistoryItem[]>([]);

    const today = todayWeekday();

    const todayWorkout = React.useMemo(() => {
        if (!plan?.length) return null;
        return plan.find((d) => d.day === today) ?? null;
    }, [plan, today]);

    const weekProgressText = React.useMemo(() => {
        const now = new Date();
        const start = startOfWeekMonday(now);
        const end = endOfWeekSunday(now);

        const doneDates = new Set<string>();

        for (const w of history) {
            const d = parseISODate(w.date);
            if (!d) continue;
            if (d < start || d > end) continue;
            if (w.active === true) continue;

            doneDates.add(d.toISOString().slice(0, 10));
        }

        const done = Math.min(7, doneDates.size);
        return `${done}/7 Days`;
    }, [history]);

    async function loadAll() {
        setLoading(true);
        try {
            // user (GET)
            const userRes = await fetch(API.getUser, {credentials: "include"});
            const userJson = await readJsonSafe(userRes);
            const rawUser = get(userJson, "user") ?? get(userJson, "result") ?? null;

            if (isObject(rawUser)) {
                const name = typeof rawUser.name === "string" ? rawUser.name : undefined;
                const goal = isGoal(rawUser.goal) ? rawUser.goal : undefined;
                const activity = isActivity(rawUser.activity) ? rawUser.activity : undefined;

                setUser({name, goal, activity});
            } else {
                setUser(null);
            }

            // training plan (POST no payload -> send {})
            const {data: workoutJson} = await postJson<ApiResp, EmptyObj>(API.getTraining, {});
            const workoutData = workoutJson?.result ?? null;
            setPlan(workoutData ? normalizeWeek(workoutData) : null);

            // diet (POST date payload)
            const {data: dietJson} = await postJson<ApiResp, { date: string }>(API.getDiet, {
                date: new Date().toISOString(),
            });
            const dietData = get(dietJson, "result") ?? get(dietJson, "diet") ?? get(dietJson, "data") ?? null;
            setDiet(normalizeDiet(dietData));

            // history (POST no payload -> send {})
            const {data: historyJson} = await postJson<ApiResp, EmptyObj>(API.getHistory, {});
            const historyData = historyJson?.result ?? null;
            setHistory(Array.isArray(historyData) ? (historyData as WorkoutHistoryItem[]) : []);
        } catch {
            toast({title: "Dashboard", description: "Failed to load dashboard data.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadAll().then(r => {
        });
    }, []);

    const firstName = user?.name?.trim()?.split(" ")?.[0] || "User";
    const dailyCalories = Number(diet?.calories ?? 0) || 0;
    const meals = diet?.meals ?? [];

    const totals = {
        protein: meals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0),
        carbs: meals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0),
        fat: meals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0),
    };

    const goalText = user?.goal ? goalLabels[user.goal] ?? "—" : "—";
    const activityText = user?.activity ? activityLabels[user.activity] ?? "—" : "—";
    const dailyCaloriesText = dailyCalories ? `${dailyCalories} kcal` : "—";

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <DashboardHeader firstName={firstName} loading={loading}/>

                <StatsGrid
                    goalText={goalText}
                    dailyCaloriesText={dailyCaloriesText}
                    activityText={activityText}
                    weekProgressText={weekProgressText}
                />

                <TodayOverview
                    today={today}
                    planExists={!!plan}
                    todayWorkout={todayWorkout}
                    dietExists={!!diet}
                    dailyCalories={dailyCalories}
                    meals={meals}
                    totals={totals}
                />

                <QuickActions/>
            </div>
        </DashboardLayout>
    );
}