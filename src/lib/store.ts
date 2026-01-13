import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export interface UserProfile {
    id: string;
    name: string;
    phone?: string;
    avatar?: string;
    gender: 'male' | 'female';
    dateOfBirth: string;
    height: number; // cm
    weight: number; // kg
    activityLevel: 'bmr' | 'sedentary' | 'light' | 'moderate' | 'very_active';
    fitnessGoal: 'lose_weight' | 'maintain' | 'build_muscle' | 'improve_endurance';
    allergies: string[];
}

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string;
    weight?: number;
    duration?: number;
    restTime: number;
    notes?: string;
}

export interface WorkoutDay {
    day: string;
    name: string;
    exercises: Exercise[];
    duration: number;
    calories: number;
}

export interface TrainingProgram {
    id: string;
    name: string;
    weeklyPlan: WorkoutDay[];
    createdAt: string;
}

export interface Meal {
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions?: string;
}

export interface DietPlan {
    id: string;
    dailyCalories: number;
    meals: Meal[];
    createdAt: string;
}

export interface WorkoutSet {
    setNumber: number;
    reps: number;
    weight: number;
    completed: boolean;
}

export interface WorkoutLog {
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
}

export interface WorkoutSession {
    id: string;
    date: string;
    startTime: string;
    endTime?: string;
    exercises: WorkoutLog[];
    notes?: string;
    completed: boolean;
}

interface AppState {
    isAuthenticated: boolean;
    user: UserProfile | null;
    trainingProgram: TrainingProgram | null;
    dietPlan: DietPlan | null;
    workoutHistory: WorkoutSession[];
    currentWorkout: WorkoutSession | null;

    // Actions
    login: (user: UserProfile) => void;
    logout: () => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    setTrainingProgram: (program: TrainingProgram) => void;
    setDietPlan: (plan: DietPlan) => void;
    startWorkout: (session: WorkoutSession) => void;
    updateCurrentWorkout: (session: WorkoutSession) => void;
    endWorkout: () => void;
    addWorkoutToHistory: (session: WorkoutSession) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            trainingProgram: null,
            dietPlan: null,
            workoutHistory: [],
            currentWorkout: null,

            login: (user) => set({isAuthenticated: true, user}),

            logout: () => set({
                isAuthenticated: false,
                user: null,
                trainingProgram: null,
                dietPlan: null,
                currentWorkout: null,
            }),

            updateProfile: (profile) => set((state) => ({
                user: state.user ? {...state.user, ...profile} : null
            })),

            setTrainingProgram: (program) => set({trainingProgram: program}),

            setDietPlan: (plan) => set({dietPlan: plan}),

            startWorkout: (session) => set({currentWorkout: session}),

            updateCurrentWorkout: (session) => set({currentWorkout: session}),

            endWorkout: () => {
                const {currentWorkout, workoutHistory} = get();
                if (currentWorkout) {
                    const completedWorkout = {
                        ...currentWorkout,
                        endTime: new Date().toISOString(),
                        completed: true,
                    };
                    set({
                        currentWorkout: null,
                        workoutHistory: [completedWorkout, ...workoutHistory],
                    });
                }
            },

            addWorkoutToHistory: (session) => set((state) => ({
                workoutHistory: [session, ...state.workoutHistory]
            })),
        }),
        {
            name: 'optifit-storage',
        }
    )
);
