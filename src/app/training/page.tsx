"use client";

import {useState} from 'react';
import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {useAppStore} from '@/lib/store';
import {mockTrainingProgram} from '@/lib/mockData';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
    Dumbbell,
    Clock,
    Flame,
    ChevronDown,
    ChevronUp,
    Sparkles,
    RefreshCw,
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

export default function Training() {
    const {trainingProgram, setTrainingProgram} = useAppStore();
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const {toast} = useToast();

    const program = trainingProgram || mockTrainingProgram;

    const handleGenerateProgram = async () => {
        setGenerating(true);
        // TODO: Call AI API to generate personalized training program
        // POST /api/ai/training with user profile data
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setTrainingProgram({
            ...mockTrainingProgram,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        });

        toast({
            title: 'Program Generated!',
            description: 'Your new AI training program is ready.',
        });
        setGenerating(false);
    };

    const today = new Date().toLocaleDateString('en-US', {weekday: 'long'});

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">
                            AI Training Program
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Your personalized weekly workout schedule
                        </p>
                    </div>
                    <Button onClick={handleGenerateProgram} disabled={generating}>
                        {generating ? (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5"/>
                                Generate New Program
                            </>
                        )}
                    </Button>
                </div>

                {/* Program Info */}
                <div className="p-6 rounded-2xl gradient-primary text-primary-foreground">
                    <h2 className="font-display text-xl font-semibold mb-2">{program.name}</h2>
                    <p className="text-primary-foreground/80 text-sm">
                        Created {new Date(program.createdAt).toLocaleDateString()} • 7-day cycle
                    </p>
                </div>

                {/* Weekly Plan */}
                <div className="space-y-4">
                    {program.weeklyPlan.map((day) => (
                        <div
                            key={day.day}
                            className={cn(
                                "rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300",
                                day.day === today && "ring-2 ring-primary"
                            )}
                        >
                            <button
                                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                                className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center",
                                            day.exercises.length > 0 ? "gradient-primary" : "bg-muted"
                                        )}
                                    >
                                        <Dumbbell
                                            className={cn(
                                                "h-6 w-6",
                                                day.exercises.length > 0 ? "text-primary-foreground" : "text-muted-foreground"
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-display text-lg font-semibold">{day.day}</h3>
                                            {day.day === today && (
                                                <span
                                                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                          Today
                        </span>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">
                                            {day.exercises.length > 0 ? day.name : 'Rest Day'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {day.exercises.length > 0 && (
                                        <>
                                            <div
                                                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4"/>
                                                {day.duration} min
                                            </div>
                                            <div
                                                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                                <Flame className="h-4 w-4"/>
                                                {day.calories} kcal
                                            </div>
                                        </>
                                    )}
                                    {day.exercises.length > 0 && (
                                        expandedDay === day.day ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground"/>
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground"/>
                                        )
                                    )}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedDay === day.day && day.exercises.length > 0 && (
                                <div className="px-6 pb-6 animate-fade-in">
                                    <div className="border-t border-border pt-6">
                                        <div className="grid gap-3">
                                            {day.exercises.map((exercise, index) => (
                                                <div
                                                    key={exercise.id}
                                                    className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                            <span
                                className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                                                        <div>
                                                            <p className="font-medium">{exercise.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {exercise.muscleGroup}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            {exercise.sets} × {exercise.reps}
                                                        </p>
                                                        {exercise.weight && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {exercise.weight} kg
                                                            </p>
                                                        )}
                                                        {exercise.duration && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {exercise.duration} min
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div
                                            className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
                                                Rest between sets: 60-90 seconds
                                            </p>
                                            <Button variant="outline" size="sm">
                                                Start This Workout
                                            </Button>
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
