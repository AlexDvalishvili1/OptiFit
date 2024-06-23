import {z} from "zod";

export const userSchema = z.object({
    email: z.string().email({message: "Invalid email format"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"}).max(100, {message: "Password must be at most 100 characters long"}),
});

export const userDataSchema = z.object({
    gender: z.boolean({message: "Choose gender"}),
    dob: z.date({message: "Enter birthdate"}),
    height: z.number({message: "Height must be number"}).min(1),
    weight: z.number({message: "Weight must be number"}).min(1),
    activity: z.number({message: "Choose activity"}).min(1, {message: "Activity level must be at least 1"}).max(5, {message: "Activity level must be at most 5"}),
    goal: z.number({message: "Choose goal"}).min(1, {message: "Goal must be at least 1"}).max(3, {message: "Goal must be at most 3"}),
    allergies: z.array(z.object({
        title: z.string()
    })),
});