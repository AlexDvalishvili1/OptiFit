"use client";

import {useState} from 'react';
import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {useAppStore} from '@/lib/store';
import {mockDietPlan} from '@/lib/mockData';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
    Utensils,
    Sparkles,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Flame,
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

const mealTypeIcons = {
    breakfast: '🍳',
    lunch: '🥗',
    dinner: '🍽️',
    snack: '🥜',
};

const mealTypeColors = {
    breakfast: 'bg-warning/10 text-warning',
    lunch: 'bg-success/10 text-success',
    dinner: 'bg-primary/10 text-primary',
    snack: 'bg-info/10 text-info',
};

export default function Diet() {
    const {dietPlan, setDietPlan} = useAppStore();
    const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const {toast} = useToast();

    const plan = dietPlan || mockDietPlan;

    const handleGeneratePlan = async () => {
        setGenerating(true);
        // TODO: Call AI API to generate personalized diet plan
        // POST /api/ai/diet with user profile data (weight, goals, allergies, etc.)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setDietPlan({
            ...mockDietPlan,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        });

        toast({
            title: 'Diet Plan Generated!',
            description: 'Your new AI nutrition plan is ready.',
        });
        setGenerating(false);
    };

    const totalCalories = plan.meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = plan.meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = plan.meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = plan.meals.reduce((sum, m) => sum + m.fat, 0);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">
                            AI Diet Plan
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Personalized nutrition for your fitness goals
                        </p>
                    </div>
                    <Button onClick={handleGeneratePlan} disabled={generating}>
                        {generating ? (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5"/>
                                Generate New Plan
                            </>
                        )}
                    </Button>
                </div>

                {/* Macro Overview */}
                <div className="p-6 rounded-2xl gradient-primary text-primary-foreground">
                    <div className="flex items-center gap-3 mb-6">
                        <Flame className="h-6 w-6"/>
                        <h2 className="font-display text-xl font-semibold">Daily Targets</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="font-display text-3xl font-bold">{plan.dailyCalories}</p>
                            <p className="text-primary-foreground/80 text-sm">Calories</p>
                        </div>
                        <div>
                            <p className="font-display text-3xl font-bold">{totalProtein}g</p>
                            <p className="text-primary-foreground/80 text-sm">Protein</p>
                        </div>
                        <div>
                            <p className="font-display text-3xl font-bold">{totalCarbs}g</p>
                            <p className="text-primary-foreground/80 text-sm">Carbs</p>
                        </div>
                        <div>
                            <p className="font-display text-3xl font-bold">{totalFat}g</p>
                            <p className="text-primary-foreground/80 text-sm">Fat</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Today's Progress</span>
                        <span className="text-sm text-muted-foreground">
              {totalCalories} / {plan.dailyCalories} kcal
            </span>
                    </div>
                    <div className="h-3 rounded-full bg-accent overflow-hidden">
                        <div
                            className="h-full rounded-full gradient-primary transition-all duration-500"
                            style={{width: `${Math.min((totalCalories / plan.dailyCalories) * 100, 100)}%`}}
                        />
                    </div>
                </div>

                {/* Meals */}
                <div className="space-y-4">
                    {plan.meals.map((meal) => (
                        <div
                            key={meal.id}
                            className="rounded-2xl bg-card border border-border overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                                className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center text-2xl",
                                            mealTypeColors[meal.type]
                                        )}
                                    >
                                        {mealTypeIcons[meal.type]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent capitalize">
                        {meal.type}
                      </span>
                                        </div>
                                        <h3 className="font-display text-lg font-semibold mt-1">{meal.name}</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-display text-lg font-semibold">{meal.calories} kcal</p>
                                        <p className="text-xs text-muted-foreground">
                                            P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                                        </p>
                                    </div>
                                    {expandedMeal === meal.id ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground"/>
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground"/>
                                    )}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedMeal === meal.id && (
                                <div className="px-6 pb-6 animate-fade-in">
                                    <div className="border-t border-border pt-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Ingredients */}
                                            <div>
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    <Utensils className="h-4 w-4"/>
                                                    Ingredients
                                                </h4>
                                                <ul className="space-y-2">
                                                    {meal.ingredients.map((ingredient, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
                                                            {ingredient}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Instructions */}
                                            {meal.instructions && (
                                                <div>
                                                    <h4 className="font-semibold mb-3">Instructions</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {meal.instructions}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Macro Breakdown */}
                                        <div className="mt-6 pt-4 border-t border-border">
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="text-center p-3 rounded-lg bg-accent/30">
                                                    <p className="font-display text-lg font-bold">{meal.calories}</p>
                                                    <p className="text-xs text-muted-foreground">Calories</p>
                                                </div>
                                                <div className="text-center p-3 rounded-lg bg-accent/30">
                                                    <p className="font-display text-lg font-bold">{meal.protein}g</p>
                                                    <p className="text-xs text-muted-foreground">Protein</p>
                                                </div>
                                                <div className="text-center p-3 rounded-lg bg-accent/30">
                                                    <p className="font-display text-lg font-bold">{meal.carbs}g</p>
                                                    <p className="text-xs text-muted-foreground">Carbs</p>
                                                </div>
                                                <div className="text-center p-3 rounded-lg bg-accent/30">
                                                    <p className="font-display text-lg font-bold">{meal.fat}g</p>
                                                    <p className="text-xs text-muted-foreground">Fat</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
