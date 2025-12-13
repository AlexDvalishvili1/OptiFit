"use client";

import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {useAppStore} from '@/lib/store';
import {mockWorkoutHistory} from '@/lib/mockData';
import {Input} from '@/components/ui/input';
import {Calendar, Clock, Dumbbell, ChevronRight, Search, X} from 'lucide-react';
import {useState, useMemo} from 'react';
import {cn} from '@/lib/utils';

export default function History() {
    const {workoutHistory} = useAppStore();
    const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const history = workoutHistory.length > 0 ? workoutHistory : mockWorkoutHistory;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
    };

    const formatTime = (startTime: string, endTime?: string) => {
        const start = new Date(startTime);
        const startStr = start.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
        if (endTime) {
            const end = new Date(endTime);
            const duration = Math.round((end.getTime() - start.getTime()) / 60000);
            return `${startStr} • ${duration} min`;
        }
        return startStr;
    };

    const getTotalVolume = (exercises: typeof history[0]['exercises']) => {
        return exercises.reduce((total, exercise) => {
            return total + exercise.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0);
        }, 0);
    };

    const getTotalSets = (exercises: typeof history[0]['exercises']) => {
        return exercises.reduce((total, exercise) => total + exercise.sets.filter(s => s.completed).length, 0);
    };

    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const query = searchQuery.toLowerCase();
        return history.filter((workout) => {
            const dateStr = formatDate(workout.date).toLowerCase();
            const isoDate = workout.date.toLowerCase();
            return dateStr.includes(query) || isoDate.includes(query);
        });
    }, [history, searchQuery]);

    const clearSearch = () => setSearchQuery('');

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">Workout History</h1>
                    <p className="text-muted-foreground mt-1">Review your past training sessions</p>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input type="text" placeholder="Search by date (e.g., January, 2025-12-12...)" value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10"/>
                    {searchQuery && (
                        <button onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4"/>
                        </button>
                    )}
                </div>
                {filteredHistory.length > 0 ? (
                    <div className="space-y-4">
                        {filteredHistory.map((workout) => (
                            <div
                                key={workout.id}
                                className={cn(
                                    "rounded-2xl bg-card border border-border overflow-hidden transition-all",
                                    selectedWorkout === workout.id && "ring-2 ring-primary"
                                )}
                            >
                                <button
                                    onClick={() => setSelectedWorkout(selectedWorkout === workout.id ? null : workout.id)}
                                    className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                                            <Dumbbell className="h-6 w-6 text-primary-foreground"/>
                                        </div>
                                        <div>
                                            <h3 className="font-display text-lg font-semibold">
                                                {formatDate(workout.date)}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4"/>
                            {formatTime(workout.startTime, workout.endTime)}
                        </span>
                                                <span>{workout.exercises.length} exercises</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:block text-right">
                                            <p className="font-display text-lg font-semibold">
                                                {getTotalVolume(workout.exercises).toLocaleString()} kg
                                            </p>
                                            <p className="text-sm text-muted-foreground">Total Volume</p>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-5 w-5 text-muted-foreground transition-transform",
                                            selectedWorkout === workout.id && "rotate-90"
                                        )}/>
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                {selectedWorkout === workout.id && (
                                    <div className="px-6 pb-6 animate-fade-in">
                                        <div className="border-t border-border pt-6">
                                            {/* Summary Stats */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="p-4 rounded-xl bg-accent/30 text-center">
                                                    <p className="font-display text-2xl font-bold">{workout.exercises.length}</p>
                                                    <p className="text-sm text-muted-foreground">Exercises</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-accent/30 text-center">
                                                    <p className="font-display text-2xl font-bold">{getTotalSets(workout.exercises)}</p>
                                                    <p className="text-sm text-muted-foreground">Sets</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-accent/30 text-center">
                                                    <p className="font-display text-2xl font-bold">
                                                        {getTotalVolume(workout.exercises).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Volume (kg)</p>
                                                </div>
                                            </div>

                                            {/* Exercise Details */}
                                            <div className="space-y-4">
                                                {workout.exercises.map((exercise, index) => (
                                                    <div
                                                        key={exercise.exerciseId}
                                                        className="p-4 rounded-xl bg-accent/20"
                                                    >
                                                        <div className="flex items-center gap-3 mb-4">
                              <span
                                  className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                                                            <h4 className="font-semibold">{exercise.exerciseName}</h4>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                                            <span className="text-muted-foreground">Set</span>
                                                            <span className="text-muted-foreground">Weight</span>
                                                            <span className="text-muted-foreground">Reps</span>

                                                            {exercise.sets.map((set) => (
                                                                <>
                                                                    <span
                                                                        key={`set-${set.setNumber}`}>{set.setNumber}</span>
                                                                    <span
                                                                        key={`weight-${set.setNumber}`}>{set.weight} kg</span>
                                                                    <span
                                                                        key={`reps-${set.setNumber}`}>{set.reps}</span>
                                                                </>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-10 w-10 text-primary"/>
                        </div>
                        <h2 className="font-display text-xl font-semibold mb-2">No Workouts Yet</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Start logging your workouts in the Notebook to see your history here.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
