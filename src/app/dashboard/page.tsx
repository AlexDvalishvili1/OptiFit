"use client";

import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {useAppStore} from '@/lib/store';
import {mockTrainingProgram, mockDietPlan} from '@/lib/mockData';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {
    Dumbbell,
    Utensils,
    Flame,
    Target,
    TrendingUp,
    Calendar,
    ChevronRight,
    Zap,
} from 'lucide-react';

export default function Dashboard() {
    const {user, trainingProgram, dietPlan} = useAppStore();

    const currentProgram = trainingProgram || mockTrainingProgram;
    const currentDiet = dietPlan || mockDietPlan;

    const today = new Date().toLocaleDateString('en-US', {weekday: 'long'});
    const todayWorkout = currentProgram.weeklyPlan.find(
        (day) => day.day === today
    );

    const goalLabels = {
        lose_weight: 'Lose Weight',
        maintain: 'Maintain',
        build_muscle: 'Build Muscle',
        improve_endurance: 'Improve Endurance',
    };

    const activityLabels = {
        sedentary: 'Sedentary',
        light: 'Lightly Active',
        moderate: 'Moderately Active',
        active: 'Active',
        very_active: 'Very Active',
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here's your fitness overview for today
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
                                    {user?.fitnessGoal ? goalLabels[user.fitnessGoal] : 'Build Muscle'}
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
                                    {currentDiet.dailyCalories} kcal
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
                                    {user?.activityLevel ? activityLabels[user.activityLevel] : 'Active'}
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
                                <p className="font-display text-lg font-semibold">4/7 Days</p>
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
                                    <h2 className="font-display text-lg font-semibold">Today's Workout</h2>
                                    <p className="text-sm text-muted-foreground">{today}</p>
                                </div>
                            </div>
                            <Link href="/training" className="text-primary hover:underline text-sm font-medium">
                                View All
                            </Link>
                        </div>

                        {todayWorkout && todayWorkout.exercises.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
                                    <div>
                                        <p className="font-semibold">{todayWorkout.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {todayWorkout.exercises.length} exercises • {todayWorkout.duration} min
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
                                    {todayWorkout.exercises.slice(0, 3).map((exercise) => (
                                        <div
                                            key={exercise.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                                        >
                                            <span className="text-sm">{exercise.name}</span>
                                            <span className="text-sm text-muted-foreground">
                        {exercise.sets} × {exercise.reps}
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
                                <p className="text-muted-foreground mb-4">Rest day - enjoy your recovery!</p>
                                <Link href="/training">
                                    <Button variant="outline">View Weekly Plan</Button>
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
                                    <h2 className="font-display text-lg font-semibold">Today's Nutrition</h2>
                                    <p className="text-sm text-muted-foreground">{currentDiet.dailyCalories} kcal
                                        target</p>
                                </div>
                            </div>
                            <Link href="/diet" className="text-primary hover:underline text-sm font-medium">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {currentDiet.meals.slice(0, 4).map((meal) => (
                                <div
                                    key={meal.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium capitalize">{meal.type}</p>
                                        <p className="text-xs text-muted-foreground">{meal.name}</p>
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

                        {/* Macro Summary */}
                        <div className="mt-6 pt-4 border-t border-border">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="font-display text-xl font-bold text-primary">
                                        {currentDiet.meals.reduce((sum, m) => sum + m.protein, 0)}g
                                    </p>
                                    <p className="text-xs text-muted-foreground">Protein</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-primary">
                                        {currentDiet.meals.reduce((sum, m) => sum + m.carbs, 0)}g
                                    </p>
                                    <p className="text-xs text-muted-foreground">Carbs</p>
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-primary">
                                        {currentDiet.meals.reduce((sum, m) => sum + m.fat, 0)}g
                                    </p>
                                    <p className="text-xs text-muted-foreground">Fat</p>
                                </div>
                            </div>
                        </div>
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
                        <p className="text-sm text-muted-foreground">
                            View or generate your personalized workout plan
                        </p>
                    </Link>

                    <Link
                        href="/diet"
                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
                    >
                        <Utensils className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="font-display font-semibold mb-1">AI Diet Plan</h3>
                        <p className="text-sm text-muted-foreground">
                            Get meal suggestions tailored to your goals
                        </p>
                    </Link>

                    <Link
                        href="/analytics"
                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
                    >
                        <TrendingUp className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="font-display font-semibold mb-1">Progress Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                            Track your fitness journey with detailed insights
                        </p>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}