"use client";

import {useState} from 'react';
import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {useAppStore, WorkoutSession, WorkoutLog, WorkoutSet} from '@/lib/store';
import {mockTrainingProgram} from '@/lib/mockData';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {
    Play,
    Square,
    Plus,
    Minus,
    Check,
    Clock,
    Dumbbell,
    Save,
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

export default function Notebook() {
    const {
        trainingProgram,
        currentWorkout,
        startWorkout,
        updateCurrentWorkout,
        endWorkout,
    } = useAppStore();
    const {toast} = useToast();

    const program = trainingProgram || mockTrainingProgram;
    const today = new Date().toLocaleDateString('en-US', {weekday: 'long'});
    const todayWorkout = program.weeklyPlan.find((day) => day.day === today);

    const [elapsedTime, setElapsedTime] = useState(0);

    const handleStartWorkout = () => {
        if (!todayWorkout || todayWorkout.exercises.length === 0) {
            toast({
                title: 'No workout scheduled',
                description: 'Today is a rest day. Choose a different workout from the training page.',
                variant: 'destructive',
            });
            return;
        }

        const exercises: WorkoutLog[] = todayWorkout.exercises.map((exercise) => ({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: Array.from({length: exercise.sets}, (_, i) => ({
                setNumber: i + 1,
                reps: 0,
                weight: exercise.weight || 0,
                completed: false,
            })),
        }));

        const session: WorkoutSession = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            startTime: new Date().toISOString(),
            exercises,
            completed: false,
        };

        startWorkout(session);
        toast({
            title: 'Workout Started!',
            description: 'Good luck with your training session.',
        });

        // Start timer
        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        // Store interval ID in session storage for cleanup
        sessionStorage.setItem('workoutTimer', interval.toString());
    };

    const handleEndWorkout = () => {
        const timerId = sessionStorage.getItem('workoutTimer');
        if (timerId) {
            clearInterval(parseInt(timerId));
            sessionStorage.removeItem('workoutTimer');
        }

        endWorkout();
        setElapsedTime(0);
        toast({
            title: 'Workout Complete!',
            description: 'Great job! Your workout has been saved.',
        });
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: number | boolean) => {
        if (!currentWorkout) return;

        const updatedExercises = [...currentWorkout.exercises];
        const updatedSets = [...updatedExercises[exerciseIndex].sets];
        updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            [field]: value,
        };
        updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            sets: updatedSets,
        };

        updateCurrentWorkout({
            ...currentWorkout,
            exercises: updatedExercises,
        });
    };

    const addSet = (exerciseIndex: number) => {
        if (!currentWorkout) return;

        const updatedExercises = [...currentWorkout.exercises];
        const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
        updatedExercises[exerciseIndex].sets.push({
            setNumber: lastSet.setNumber + 1,
            reps: 0,
            weight: lastSet.weight,
            completed: false,
        });

        updateCurrentWorkout({
            ...currentWorkout,
            exercises: updatedExercises,
        });
    };

    const removeSet = (exerciseIndex: number) => {
        if (!currentWorkout) return;
        if (currentWorkout.exercises[exerciseIndex].sets.length <= 1) return;

        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises[exerciseIndex].sets.pop();

        updateCurrentWorkout({
            ...currentWorkout,
            exercises: updatedExercises,
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl font-bold">
                            Workout Notebook
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {currentWorkout ? 'Track your sets and reps' : 'Start a workout session to begin logging'}
                        </p>
                    </div>

                    {!currentWorkout ? (
                        <Button size="lg" onClick={handleStartWorkout}>
                            <Play className="mr-2 h-5 w-5"/>
                            Start Workout
                        </Button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent">
                                <Clock className="h-5 w-5 text-primary"/>
                                <span className="font-display text-lg font-semibold">
                  {formatTime(elapsedTime)}
                </span>
                            </div>
                            <Button size="lg" variant="destructive" onClick={handleEndWorkout}>
                                <Square className="mr-2 h-5 w-5"/>
                                End Workout
                            </Button>
                        </div>
                    )}
                </div>

                {/* No Workout State */}
                {!currentWorkout && (
                    <div className="text-center py-16">
                        <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                            <Dumbbell className="h-10 w-10 text-primary"/>
                        </div>
                        <h2 className="font-display text-xl font-semibold mb-2">Ready to Train?</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8">
                            {todayWorkout && todayWorkout.exercises.length > 0
                                ? `Today's workout: ${todayWorkout.name} with ${todayWorkout.exercises.length} exercises`
                                : "Today is a rest day. You can start a workout from the Training page."}
                        </p>
                        {todayWorkout && todayWorkout.exercises.length > 0 && (
                            <Button size="lg" onClick={handleStartWorkout}>
                                <Play className="mr-2 h-5 w-5"/>
                                Start {todayWorkout.name}
                            </Button>
                        )}
                    </div>
                )}

                {/* Active Workout */}
                {currentWorkout && (
                    <div className="space-y-6">
                        {currentWorkout.exercises.map((exercise, exerciseIndex) => (
                            <div
                                key={exercise.exerciseId}
                                className="p-6 rounded-2xl bg-card border border-border"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                    <span
                        className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {exerciseIndex + 1}
                    </span>
                                        <h3 className="font-display text-lg font-semibold">
                                            {exercise.exerciseName}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeSet(exerciseIndex)}
                                            disabled={exercise.sets.length <= 1}
                                        >
                                            <Minus className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => addSet(exerciseIndex)}
                                        >
                                            <Plus className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>

                                {/* Sets Header */}
                                <div
                                    className="grid grid-cols-4 gap-4 mb-3 px-4 text-sm font-medium text-muted-foreground">
                                    <span>Set</span>
                                    <span>Weight (kg)</span>
                                    <span>Reps</span>
                                    <span className="text-center">Done</span>
                                </div>

                                {/* Sets */}
                                <div className="space-y-2">
                                    {exercise.sets.map((set, setIndex) => (
                                        <div
                                            key={setIndex}
                                            className={cn(
                                                "grid grid-cols-4 gap-4 items-center p-4 rounded-xl transition-colors",
                                                set.completed ? "bg-success/10" : "bg-accent/30"
                                            )}
                                        >
                                            <span className="font-medium">{set.setNumber}</span>
                                            <Input
                                                type="number"
                                                value={set.weight || ''}
                                                onChange={(e) =>
                                                    updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)
                                                }
                                                className="h-10"
                                                placeholder="0"
                                            />
                                            <Input
                                                type="number"
                                                value={set.reps || ''}
                                                onChange={(e) =>
                                                    updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                                                }
                                                className="h-10"
                                                placeholder="0"
                                            />
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)}
                                                    className={cn(
                                                        "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                                                        set.completed
                                                            ? "bg-success text-success-foreground"
                                                            : "bg-muted hover:bg-accent"
                                                    )}
                                                >
                                                    <Check className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Save Button */}
                        <div className="flex justify-center pt-4">
                            <Button size="lg" onClick={handleEndWorkout}>
                                <Save className="mr-2 h-5 w-5"/>
                                Complete & Save Workout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
