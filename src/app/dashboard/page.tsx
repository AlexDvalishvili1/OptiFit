"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {useToast} from "@/hooks/use-toast";

import DashboardHeader from "@/components/pages/dashboard/DashboardHeader.tsx";
import StatsGrid from "@/components/pages/dashboard/StatsGrid";
import TodayOverview from "@/components/pages/dashboard/TodayOverview";
import QuickActions from "@/components/pages/dashboard/QuickActions";

/** -------------------- YOUR API ROUTES -------------------- */
const API = {
    getTraining: "/api/workout/plan/get",
    getHistory: "/api/workout/get/history",
    getUser: "/api/auth/me",
    getDiet: "/api/diet/get",
};

/** -------------------- TYPES -------------------- */
type DbUser = {
    name?: string;
    goal?: "lose weight" | "maintain" | "build muscle" | "improve endurance";
    activity?: "bmr" | "sedentary" | "light" | "moderate" | "active" | "very active";
};

type ProgramExercise = { name: string; sets: string; reps: string; instructions: string; video: string };
type ProgramDay = { day: string; rest: boolean; muscles: string; exercises: ProgramExercise[] };
type ProgramWeek = ProgramDay[];

type DietMealFlat = {
    id?: string;
    name: string;
    type: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number
};
type DietPlan = { calories: number; meals: DietMealFlat[] };

type WorkoutHistoryItem = { date: string; active?: boolean; workout?; timer?: number };

/** -------------------- HELPERS -------------------- */
function todayWeekday() {
    return new Date().toLocaleDateString("en-US", {weekday: "long"});
}

function parseISODate(s: string) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfWeekMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function endOfWeekSunday(d: Date) {
    const start = startOfWeekMonday(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

/** -------------------- TRAINING NORMALIZE -------------------- */
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

/** -------------------- DIET NORMALIZE -------------------- */
function normalizeDiet(rawInput): DietPlan | null {
    if (!rawInput) return null;
    let raw = rawInput;

    if (typeof raw === "string") {
        try {
            raw = JSON.parse(raw);
        } catch {
            return null;
        }
    }
    if (!raw || typeof raw !== "object") return null;

    const calories = Number(raw.calories ?? raw.dailyCalories ?? raw.targetCalories ?? NaN);
    if (!Number.isFinite(calories)) return null;

    const mealsRaw = raw.meals;
    if (!Array.isArray(mealsRaw)) return {calories, meals: []};

    const meals: DietMealFlat[] = mealsRaw
        .map((meal, idx: number) => {
            const mealName = String(meal?.name ?? `Meal ${idx + 1}`);
            const mealType = String((meal?.type ?? meal?.mealType ?? mealName) || "meal");

            if (Array.isArray(meal?.foods) && meal.foods.length > 0) {
                let mCal = 0, mProt = 0, mCarb = 0, mFat = 0;
                for (const f of meal.foods) {
                    mCal += Number(f?.calories ?? 0) || 0;
                    mProt += Number(f?.protein ?? 0) || 0;
                    mFat += Number(f?.fat ?? 0) || 0;
                    mCarb += Number(f?.carbohydrates ?? f?.carbs ?? 0) || 0;
                }
                return {
                    id: meal?.id,
                    name: mealName,
                    type: mealType,
                    calories: Math.round(mCal),
                    protein: Math.round(mProt),
                    carbs: Math.round(mCarb),
                    fat: Math.round(mFat),
                };
            }

            const c = Number(meal?.calories ?? NaN);
            if (!Number.isFinite(c)) return null;

            return {
                id: meal?.id,
                name: mealName,
                type: mealType,
                calories: c,
                protein: Number(meal?.protein ?? 0) || 0,
                carbs: Number(meal?.carbohydrates ?? meal?.carbs ?? 0) || 0,
                fat: Number(meal?.fat ?? 0) || 0,
            };
        })
        .filter(Boolean) as DietMealFlat[];

    return {calories, meals};
}

/** -------------------- LABEL MAPS -------------------- */
const goalLabels: Record<NonNullable<DbUser["goal"]>, string> = {
    "lose weight": "Lose Weight",
    maintain: "Maintain",
    "build muscle": "Build Muscle",
    "improve endurance": "Improve Endurance",
};
const activityLabels: Record<NonNullable<DbUser["activity"]>, string> = {
    bmr: "BMR",
    sedentary: "Sedentary",
    light: "Lightly Active",
    moderate: "Moderately Active",
    active: "Active",
    "very active": "Very Active",
};

async function readJsonSafe(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
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
        for (const w of history || []) {
            const d = parseISODate(w?.date);
            if (!d) continue;
            if (d < start || d > end) continue;
            if (w?.active === true) continue;
            doneDates.add(d.toISOString().slice(0, 10));
        }
        const done = Math.min(7, doneDates.size);
        return `${done}/7 Days`;
    }, [history]);

    async function loadAll() {
        setLoading(true);
        try {
            const userRes = await fetch(API.getUser, {credentials: "include"});
            const userJson = await readJsonSafe(userRes);
            const rawUser = userJson?.user ?? userJson?.result ?? null;

            if (rawUser) {
                setUser({name: rawUser.name, goal: rawUser.goal, activity: rawUser.activity});
            } else setUser(null);

            const workoutRes = await fetch(API.getTraining, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });
            const workoutJson = await readJsonSafe(workoutRes);
            const workoutData = workoutJson?.result ?? null;
            setPlan(workoutData ? normalizeWeek(workoutData) : null);

            const dietRes = await fetch(API.getDiet, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({date: new Date().toISOString()}),
            });
            const dietJson = await readJsonSafe(dietRes);
            const dietData = dietJson?.result ?? dietJson?.diet ?? dietJson?.data ?? null;
            setDiet(normalizeDiet(dietData));

            const historyRes = await fetch(API.getHistory, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });
            const historyJson = await readJsonSafe(historyRes);
            const historyData = historyJson?.result ?? null;
            setHistory(Array.isArray(historyData) ? historyData : []);
        } catch {
            toast({title: "Dashboard", description: "Failed to load dashboard data.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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