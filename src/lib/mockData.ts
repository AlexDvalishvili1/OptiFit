import {TrainingProgram, DietPlan, WorkoutSession, UserProfile} from './store';

export const mockUser: UserProfile = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    gender: 'male',
    dateOfBirth: '1995-06-15',
    height: 180,
    weight: 78,
    activityLevel: 'moderate',
    fitnessGoal: 'build_muscle',
    allergies: ['peanuts'],
};

export const mockTrainingProgram: TrainingProgram = {
    id: '1',
    name: 'Hypertrophy Focus',
    createdAt: new Date().toISOString(),
    weeklyPlan: [
        {
            day: 'Monday',
            name: 'Push Day',
            duration: 60,
            calories: 450,
            exercises: [
                {id: '1', name: 'Bench Press', muscleGroup: 'Chest', sets: 4, reps: '8-10', weight: 80, restTime: 90},
                {
                    id: '2',
                    name: 'Incline Dumbbell Press',
                    muscleGroup: 'Chest',
                    sets: 3,
                    reps: '10-12',
                    weight: 30,
                    restTime: 60
                },
                {
                    id: '3',
                    name: 'Overhead Press',
                    muscleGroup: 'Shoulders',
                    sets: 4,
                    reps: '8-10',
                    weight: 50,
                    restTime: 90
                },
                {
                    id: '4',
                    name: 'Lateral Raises',
                    muscleGroup: 'Shoulders',
                    sets: 3,
                    reps: '12-15',
                    weight: 12,
                    restTime: 45
                },
                {id: '5', name: 'Tricep Dips', muscleGroup: 'Triceps', sets: 3, reps: '10-12', restTime: 60},
                {
                    id: '6',
                    name: 'Cable Pushdowns',
                    muscleGroup: 'Triceps',
                    sets: 3,
                    reps: '12-15',
                    weight: 25,
                    restTime: 45
                },
            ],
        },
        {
            day: 'Tuesday',
            name: 'Pull Day',
            duration: 55,
            calories: 420,
            exercises: [
                {id: '7', name: 'Deadlift', muscleGroup: 'Back', sets: 4, reps: '5-6', weight: 120, restTime: 120},
                {id: '8', name: 'Pull-ups', muscleGroup: 'Back', sets: 4, reps: '8-10', restTime: 90},
                {id: '9', name: 'Barbell Rows', muscleGroup: 'Back', sets: 3, reps: '10-12', weight: 70, restTime: 90},
                {
                    id: '10',
                    name: 'Face Pulls',
                    muscleGroup: 'Rear Delts',
                    sets: 3,
                    reps: '15-20',
                    weight: 15,
                    restTime: 45
                },
                {
                    id: '11',
                    name: 'Barbell Curls',
                    muscleGroup: 'Biceps',
                    sets: 3,
                    reps: '10-12',
                    weight: 30,
                    restTime: 60
                },
                {
                    id: '12',
                    name: 'Hammer Curls',
                    muscleGroup: 'Biceps',
                    sets: 3,
                    reps: '12-15',
                    weight: 14,
                    restTime: 45
                },
            ],
        },
        {
            day: 'Wednesday',
            name: 'Rest Day',
            duration: 0,
            calories: 0,
            exercises: [],
        },
        {
            day: 'Thursday',
            name: 'Legs',
            duration: 65,
            calories: 500,
            exercises: [
                {id: '13', name: 'Squats', muscleGroup: 'Quads', sets: 4, reps: '6-8', weight: 100, restTime: 120},
                {
                    id: '14',
                    name: 'Romanian Deadlift',
                    muscleGroup: 'Hamstrings',
                    sets: 3,
                    reps: '10-12',
                    weight: 80,
                    restTime: 90
                },
                {id: '15', name: 'Leg Press', muscleGroup: 'Quads', sets: 3, reps: '12-15', weight: 180, restTime: 90},
                {
                    id: '16',
                    name: 'Leg Curls',
                    muscleGroup: 'Hamstrings',
                    sets: 3,
                    reps: '12-15',
                    weight: 40,
                    restTime: 60
                },
                {
                    id: '17',
                    name: 'Calf Raises',
                    muscleGroup: 'Calves',
                    sets: 4,
                    reps: '15-20',
                    weight: 60,
                    restTime: 45
                },
            ],
        },
        {
            day: 'Friday',
            name: 'Upper Body',
            duration: 55,
            calories: 400,
            exercises: [
                {
                    id: '18',
                    name: 'Incline Bench Press',
                    muscleGroup: 'Chest',
                    sets: 4,
                    reps: '8-10',
                    weight: 70,
                    restTime: 90
                },
                {id: '19', name: 'Cable Rows', muscleGroup: 'Back', sets: 4, reps: '10-12', weight: 60, restTime: 60},
                {
                    id: '20',
                    name: 'Arnold Press',
                    muscleGroup: 'Shoulders',
                    sets: 3,
                    reps: '10-12',
                    weight: 20,
                    restTime: 60
                },
                {id: '21', name: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10-12', weight: 55, restTime: 60},
                {
                    id: '22',
                    name: 'Skull Crushers',
                    muscleGroup: 'Triceps',
                    sets: 3,
                    reps: '10-12',
                    weight: 25,
                    restTime: 60
                },
                {
                    id: '23',
                    name: 'Preacher Curls',
                    muscleGroup: 'Biceps',
                    sets: 3,
                    reps: '10-12',
                    weight: 20,
                    restTime: 60
                },
            ],
        },
        {
            day: 'Saturday',
            name: 'Active Recovery',
            duration: 30,
            calories: 150,
            exercises: [
                {
                    id: '24',
                    name: 'Light Cardio',
                    muscleGroup: 'Full Body',
                    sets: 1,
                    reps: '20 min',
                    duration: 20,
                    restTime: 0
                },
                {
                    id: '25',
                    name: 'Stretching',
                    muscleGroup: 'Full Body',
                    sets: 1,
                    reps: '10 min',
                    duration: 10,
                    restTime: 0
                },
            ],
        },
        {
            day: 'Sunday',
            name: 'Rest Day',
            duration: 0,
            calories: 0,
            exercises: [],
        },
    ],
};

export const mockDietPlan: DietPlan = {
    id: '1',
    dailyCalories: 2500,
    createdAt: new Date().toISOString(),
    meals: [
        {
            id: '1',
            name: 'Protein Oatmeal Bowl',
            type: 'breakfast',
            calories: 550,
            protein: 35,
            carbs: 65,
            fat: 15,
            ingredients: ['Oats', 'Whey protein', 'Banana', 'Almond butter', 'Honey', 'Cinnamon'],
            instructions: 'Cook oats, mix in protein powder, top with sliced banana, almond butter and honey.',
        },
        {
            id: '2',
            name: 'Grilled Chicken Salad',
            type: 'lunch',
            calories: 650,
            protein: 45,
            carbs: 40,
            fat: 25,
            ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Feta cheese', 'Olive oil', 'Quinoa'],
            instructions: 'Grill chicken, toss with fresh vegetables and cooked quinoa, dress with olive oil.',
        },
        {
            id: '3',
            name: 'Greek Yogurt Parfait',
            type: 'snack',
            calories: 300,
            protein: 20,
            carbs: 35,
            fat: 8,
            ingredients: ['Greek yogurt', 'Granola', 'Mixed berries', 'Honey'],
            instructions: 'Layer yogurt with granola and berries, drizzle with honey.',
        },
        {
            id: '4',
            name: 'Salmon with Sweet Potato',
            type: 'dinner',
            calories: 700,
            protein: 40,
            carbs: 55,
            fat: 30,
            ingredients: ['Salmon fillet', 'Sweet potato', 'Broccoli', 'Olive oil', 'Lemon', 'Garlic'],
            instructions: 'Bake salmon with lemon and garlic, roast sweet potato, steam broccoli.',
        },
        {
            id: '5',
            name: 'Protein Shake',
            type: 'snack',
            calories: 300,
            protein: 30,
            carbs: 25,
            fat: 10,
            ingredients: ['Whey protein', 'Almond milk', 'Banana', 'Peanut butter', 'Ice'],
            instructions: 'Blend all ingredients until smooth.',
        },
    ],
};

export const mockWorkoutHistory: WorkoutSession[] = [
    {
        id: '1',
        date: '2025-01-15',
        startTime: '2025-01-15T09:00:00Z',
        endTime: '2025-01-15T10:05:00Z',
        completed: true,
        exercises: [
            {
                exerciseId: '1',
                exerciseName: 'Bench Press',
                sets: [
                    {setNumber: 1, reps: 10, weight: 75, completed: true},
                    {setNumber: 2, reps: 9, weight: 80, completed: true},
                    {setNumber: 3, reps: 8, weight: 80, completed: true},
                    {setNumber: 4, reps: 7, weight: 80, completed: true},
                ],
            },
            {
                exerciseId: '2',
                exerciseName: 'Incline Dumbbell Press',
                sets: [
                    {setNumber: 1, reps: 12, weight: 28, completed: true},
                    {setNumber: 2, reps: 11, weight: 30, completed: true},
                    {setNumber: 3, reps: 10, weight: 30, completed: true},
                ],
            },
        ],
    },
    {
        id: '2',
        date: '2025-01-14',
        startTime: '2025-01-14T17:30:00Z',
        endTime: '2025-01-14T18:25:00Z',
        completed: true,
        exercises: [
            {
                exerciseId: '7',
                exerciseName: 'Deadlift',
                sets: [
                    {setNumber: 1, reps: 6, weight: 115, completed: true},
                    {setNumber: 2, reps: 5, weight: 120, completed: true},
                    {setNumber: 3, reps: 5, weight: 120, completed: true},
                    {setNumber: 4, reps: 4, weight: 125, completed: true},
                ],
            },
            {
                exerciseId: '8',
                exerciseName: 'Pull-ups',
                sets: [
                    {setNumber: 1, reps: 10, weight: 0, completed: true},
                    {setNumber: 2, reps: 9, weight: 0, completed: true},
                    {setNumber: 3, reps: 8, weight: 0, completed: true},
                ],
            },
        ],
    },
];

export const mockWeightData = [
    {date: 'Jan 1', weight: 80},
    {date: 'Jan 8', weight: 79.5},
    {date: 'Jan 15', weight: 79.2},
    {date: 'Jan 22', weight: 78.8},
    {date: 'Jan 29', weight: 78.5},
    {date: 'Feb 5', weight: 78.2},
    {date: 'Feb 12', weight: 78},
];

export const mockCalorieData = [
    {date: 'Mon', calories: 2450, target: 2500},
    {date: 'Tue', calories: 2520, target: 2500},
    {date: 'Wed', calories: 2380, target: 2500},
    {date: 'Thu', calories: 2600, target: 2500},
    {date: 'Fri', calories: 2480, target: 2500},
    {date: 'Sat', calories: 2700, target: 2500},
    {date: 'Sun', calories: 2300, target: 2500},
];

export const mockVolumeData = [
    {week: 'Week 1', volume: 45000},
    {week: 'Week 2', volume: 48000},
    {week: 'Week 3', volume: 52000},
    {week: 'Week 4', volume: 50000},
    {week: 'Week 5', volume: 55000},
    {week: 'Week 6', volume: 58000},
];
