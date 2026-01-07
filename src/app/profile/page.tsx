"use client";

import {useEffect, useState} from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {Button} from "@/components/ui/button";
import {Save} from "lucide-react";
import {useToast} from "@/hooks/use-toast";

import {ProfileHeader} from "@/components/pages/profile/ProfileHeader";
import {AvatarCard} from "@/components/pages/profile/AvatarCard";
import {PersonalInfoSection} from "@/components/pages/profile/PersonalInfoSection";
import {FitnessPreferencesSection} from "@/components/pages/profile/FitnessPreferencesSection";

const ALLERGY_OPTIONS = [
    "Lactose", "Gluten", "Peanuts", "Tree Nuts", "Shellfish", "Fish", "Soy", "Eggs",
    "Wheat", "Sesame", "Corn", "Mustard", "Celery", "Sulphites", "Lupin", "Mollusks",
    "Legumes", "Fruit", "Vegetables", "Garlic", "Onion", "Gelatin", "Meat", "Spices",
    "Chocolate", "Yeast",
];

const ACTIVITY_LEVELS = [
    {value: "sedentary", label: "Sedentary — little or no exercise"},
    {value: "light", label: "Light — exercise 1–3 times per week"},
    {value: "moderate", label: "Moderate — exercise 4–5 times per week"},
    {value: "very_active", label: "Very Active — intense exercise 6–7 times per week"},
];

type MeUser = {
    id: string;
    name?: string;
    email: string;
    phone: string;
    gender?: "male" | "female";
    dob?: string;
    height?: number;
    weight?: number;
    activity?: string;
    goal?: string;
    allergies?: string[];
    advanced?: boolean;
} | null;

export default function Profile() {
    const {toast} = useToast();

    const [loadingMe, setLoadingMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [allergyPopoverOpen, setAllergyPopoverOpen] = useState(false);

    const [me, setMe] = useState<MeUser>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gender: undefined as undefined | "male" | "female",
        dateOfBirth: "", // yyyy-mm-dd
        height: 0,
        weight: 0,
        activityLevel: undefined as string | undefined,
        fitnessGoal: undefined as string | undefined,
        allergies: [] as string[],
    });

    // Load profile from your API
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoadingMe(true);
            try {
                const res = await fetch("/api/auth/me", {credentials: "include"});
                const json = await res.json().catch(() => ({}));

                const user = json.user;
                if (!cancelled) setMe(user);

                if (!cancelled && user) {
                    setFormData((prev) => ({
                        ...prev,
                        name: user.name ?? "",
                        email: user.email ?? "",
                        gender: (user.gender) ?? undefined,
                        dateOfBirth: user.dob ? String(user.dob).slice(0, 10) : "",
                        height: typeof user.height === "number" ? user.height : prev.height,
                        weight: typeof user.weight === "number" ? user.weight : prev.weight,
                        activityLevel: (user.activity) ?? prev.activityLevel,
                        fitnessGoal: (user.goal) ?? prev.fitnessGoal,
                        allergies: Array.isArray(user.allergies) ? user.allergies : prev.allergies,
                    }));
                }
            } catch {
                if (!cancelled) setMe(null);
            } finally {
                if (!cancelled) setLoadingMe(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (field: string, value) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const toggleAllergy = (allergy: string) => {
        const current = formData.allergies;
        const next = current.includes(allergy)
            ? current.filter((a) => a !== allergy)
            : [...current, allergy];

        handleChange("allergies", next);
    };

    const removeAllergy = (allergy: string) => {
        handleChange("allergies", formData.allergies.filter((a) => a !== allergy));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: {"Content-Type": "application/json", Accept: "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    gender: formData.gender,
                    dob: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                    height: Number(formData.height),
                    weight: Number(formData.weight),
                    activity: formData.activityLevel,
                    goal: formData.fitnessGoal,
                    allergies: formData.allergies,
                }),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Profile update failed",
                    description: json?.error || "Something went wrong",
                });
                return;
            }

            toast({
                variant: "success",
                title: "Profile Updated",
                description: "Your profile has been saved successfully.",
            });

            setMe(json.user ?? me);
        } catch {
            toast({
                variant: "destructive",
                title: "Network error",
                description: "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <ProfileHeader/>

                <AvatarCard
                    loadingMe={loadingMe}
                    name={formData.name}
                    email={formData.email}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <PersonalInfoSection formData={formData} onChange={handleChange}/>

                    <FitnessPreferencesSection
                        activityLevels={ACTIVITY_LEVELS}
                        allergyOptions={ALLERGY_OPTIONS}
                        allergyPopoverOpen={allergyPopoverOpen}
                        setAllergyPopoverOpen={setAllergyPopoverOpen}
                        formData={{
                            activityLevel: formData.activityLevel,
                            fitnessGoal: formData.fitnessGoal,
                            allergies: formData.allergies,
                        }}
                        onChange={handleChange}
                        toggleAllergy={toggleAllergy}
                        removeAllergy={removeAllergy}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={loading}>
                            <Save className="mr-2 h-5 w-5"/>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}