"use client";

import * as React from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useToast} from "@/hooks/use-toast";
import {
    Utensils,
    Flame,
    Target,
    TrendingUp,
    Calendar,
    ChevronRight,
    Zap, Dumbbell,
} from "lucide-react";

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

type DietMealFlat = {
    id?: string;
    name: string; // meal title (Breakfast, Lunch...) OR custom
    type: string; // breakfast/lunch/dinner/snack OR "Breakfast" etc
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

type DietPlan = {
    calories: number; // ✅ your DB uses calories
    meals: DietMealFlat[]; // ✅ we will FLATTEN your foods into meal totals
};

type WorkoutHistoryItem = {
    date: string; // ISO
    active?: boolean;
    workout?: any;
    timer?: number;
};

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
    const day = date.getDay(); // Sun=0
    const diff = (day === 0 ? -6 : 1) - day; // to Monday
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
function isValidProgramWeek(x: any): x is ProgramWeek {
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

    const set = new Set(x.map((d: any) => d.day));
    return days.every((d) => set.has(d));
}

function normalizeWeek(raw: any): ProgramWeek | null {
    const normalized = Array.isArray(raw) && raw.length === 1 && Array.isArray(raw[0]) ? raw[0] : raw;
    return isValidProgramWeek(normalized) ? (normalized as ProgramWeek) : null;
}

/** -------------------- DIET NORMALIZE (YOUR EXACT STRUCTURE) -------------------- */
/**
 * Your dietData structure:
 * {
 *   calories: 1900,
 *   protein: 140,
 *   fat: 60,
 *   carbohydrates: 200,
 *   meals: [
 *     { name:"Breakfast", time:"08:00", foods:[{calories,protein,fat,carbohydrates}, ...] },
 *     ...
 *   ]
 * }
 *
 * UI needs a flat list of meals with calories/protein/carbs/fat per meal.
 */
function normalizeDiet(rawInput: any): DietPlan | null {
    if (!rawInput) return null;

    // if backend returns string JSON
    let raw: any = rawInput;
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
        .map((meal: any, idx: number) => {
            const mealName = String(meal?.name ?? `Meal ${idx + 1}`);
            const mealType = String((meal?.type ?? meal?.mealType ?? mealName) || "meal");

            // Your meals have foods: [...]
            if (Array.isArray(meal?.foods) && meal.foods.length > 0) {
                let mCal = 0;
                let mProt = 0;
                let mCarb = 0;
                let mFat = 0;

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

            // fallback: already-flat meal (just in case)
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

/** -------------------- LABEL MAPS (MATCH YOUR DB STRINGS) -------------------- */
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
            // USER
            const userRes = await fetch(API.getUser, {credentials: "include"});
            const userJson = await readJsonSafe(userRes);
            const rawUser = userJson?.user ?? userJson?.result ?? null;

            if (rawUser) {
                setUser({
                    name: rawUser.name,
                    goal: rawUser.goal,
                    activity: rawUser.activity,
                });
            } else {
                setUser(null);
            }

            // TRAINING
            const workoutRes = await fetch(API.getTraining, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });
            const workoutJson = await readJsonSafe(workoutRes);
            const workoutData = workoutJson?.result ?? null;
            setPlan(workoutData ? normalizeWeek(workoutData) : null);

            // DIET
            const dietRes = await fetch(API.getDiet, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                // keep body if your backend expects it
                body: JSON.stringify({date: new Date().toISOString()}),
            });
            const dietJson = await readJsonSafe(dietRes);
            const dietData = dietJson?.result ?? dietJson?.diet ?? dietJson?.data ?? null;

            const normalizedDiet = normalizeDiet(dietData);
            setDiet(normalizedDiet);

            // HISTORY
            const historyRes = await fetch(API.getHistory, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });
            const historyJson = await readJsonSafe(historyRes);
            const historyData = historyJson?.result ?? null;
            setHistory(Array.isArray(historyData) ? historyData : []);
        } catch {
            toast({
                title: "Dashboard",
                description: "Failed to load dashboard data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const firstName = user?.name?.trim()?.split(" ")?.[0] || "User";

    // ✅ FIXED: your plan uses `calories`
    const dailyCalories = Number(diet?.calories ?? 0) || 0;
    const meals = diet?.meals ?? [];

    const totalProtein = meals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">
                            Welcome back, {firstName}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here&apos;s your fitness overview for today {loading ? "(loading…)" : ""}
                        </p>
                    </div>

                    <Link href="/notebook">
                        <Button size="lg">
                            <Zap className="mr-2 h-5 w-5"/>
                            Start Workout
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                <Target className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Current Goal</p>
                                <p className="font-display text-lg font-semibold">
                                    {user?.goal ? (goalLabels[user.goal] ?? "—") : "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                <Flame className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Daily Calories</p>
                                <p className="font-display text-lg font-semibold">
                                    {dailyCalories ? `${dailyCalories} kcal` : "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Activity Level</p>
                                <p className="font-display text-lg font-semibold">
                                    {user?.activity ? (activityLabels[user.activity] ?? "—") : "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Week Progress</p>
                                <p className="font-display text-lg font-semibold">{weekProgressText}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Overview */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Today's Workout */}
                    <div className="p-6 rounded-2xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                                    <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                                </div>
                                <div>
                                    <h2 className="font-display text-lg font-semibold">Today&apos;s Workout</h2>
                                    <p className="text-sm text-muted-foreground">{today}</p>
                                </div>
                            </div>
                            <Link href="/training" className="text-primary hover:underline text-sm font-medium">
                                View All
                            </Link>
                        </div>

                        {todayWorkout && !todayWorkout.rest && todayWorkout.exercises.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
                                    <div>
                                        <p className="font-semibold">{todayWorkout.muscles}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {todayWorkout.exercises.length} exercises
                                        </p>
                                    </div>
                                    <Link href="/notebook">
                                        <Button size="sm">
                                            Start
                                            <ChevronRight className="ml-1 h-4 w-4"/>
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-2">
                                    {todayWorkout.exercises.slice(0, 3).map((ex, idx) => (
                                        <div
                                            key={`${ex.name}-${idx}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                                        >
                                            <span className="text-sm">{ex.name}</span>
                                            <span className="text-sm text-muted-foreground">
                        {ex.sets} × {ex.reps}
                      </span>
                                        </div>
                                    ))}

                                    {todayWorkout.exercises.length > 3 && (
                                        <p className="text-sm text-muted-foreground text-center pt-2">
                                            +{todayWorkout.exercises.length - 3} more exercises
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    {plan ? "Rest day - enjoy your recovery!" : "No program yet - generate one in Training."}
                                </p>
                                <Link href="/training">
                                    <Button variant="outline">{plan ? "View Weekly Plan" : "Go to Training"}</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Today's Meals */}
                    <div className="p-6 rounded-2xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                                    <Utensils className="h-5 w-5 text-primary-foreground"/>
                                </div>
                                <div>
                                    <h2 className="font-display text-lg font-semibold">Today&apos;s Nutrition</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {dailyCalories ? `${dailyCalories} kcal target` : "No diet plan yet"}
                                    </p>
                                </div>
                            </div>
                            <Link href="/diet" className="text-primary hover:underline text-sm font-medium">
                                View All
                            </Link>
                        </div>

                        {meals.length > 0 ? (
                            <>
                                <div className="space-y-3">
                                    {meals.slice(0, 4).map((meal, i) => (
                                        <div
                                            key={meal.id ?? `${meal.name}-${i}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-medium capitalize">{meal.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{meal.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{meal.calories} kcal</p>
                                                <p className="text-xs text-muted-foreground">
                                                    P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-border">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="font-display text-xl font-bold text-primary">{totalProtein}g</p>
                                            <p className="text-xs text-muted-foreground">Protein</p>
                                        </div>
                                        <div>
                                            <p className="font-display text-xl font-bold text-primary">{totalCarbs}g</p>
                                            <p className="text-xs text-muted-foreground">Carbs</p>
                                        </div>
                                        <div>
                                            <p className="font-display text-xl font-bold text-primary">{totalFat}g</p>
                                            <p className="text-xs text-muted-foreground">Fat</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No meals found in your diet plan yet.</p>
                                <Link href="/diet">
                                    <Button variant="outline">Go to Diet</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Link
                        href="/training"
                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
                    >
                        <Dumbbell className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="font-display font-semibold mb-1">AI Training Program</h3>
                        <p className="text-sm text-muted-foreground">View or generate your personalized workout plan</p>
                    </Link>

                    <Link
                        href="/diet"
                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
                    >
                        <Utensils className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="font-display font-semibold mb-1">AI Diet Plan</h3>
                        <p className="text-sm text-muted-foreground">Get meal suggestions tailored to your goals</p>
                    </Link>

                    <Link
                        href="/analytics"
                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
                    >
                        <TrendingUp className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="font-display font-semibold mb-1">Progress Analytics</h3>
                        <p className="text-sm text-muted-foreground">Track your fitness journey with detailed
                            insights</p>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
