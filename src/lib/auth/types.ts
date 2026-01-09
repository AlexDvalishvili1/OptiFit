export type AuthUser = {
    id: string;
    name?: string;
    email: string;
    phone: string;

    advanced?: boolean;

    gender?: "male" | "female" | null;
    dob?: string | null; // ISO string
    height?: number | null;
    weight?: number | null;
    activity?: string | null;
    goal?: string | null;
    allergies?: string[];
} | null;