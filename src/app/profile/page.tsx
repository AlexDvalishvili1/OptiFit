"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {Button} from "@/components/ui/button";
import {Save} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {ProfileHeader} from "@/components/pages/profile/ProfileHeader";
import {AvatarCard} from "@/components/pages/profile/AvatarCard";
import {PersonalInfoSection} from "@/components/pages/profile/PersonalInfoSection";
import {FitnessPreferencesSection} from "@/components/pages/profile/FitnessPreferencesSection";
import {readJsonSafe} from "@/lib/api/readJsonSafe";
import type {MeUser, ProfileFormData} from "@/lib/pages/profile/types.ts";
import {formDataToPatchPayload, userToFormData} from "@/lib/pages/profile/mappers.ts";

const ALLERGY_OPTIONS = [
    "Lactose",
    "Gluten",
    "Peanuts",
    "Tree Nuts",
    "Shellfish",
    "Fish",
    "Soy",
    "Eggs",
    "Wheat",
    "Sesame",
    "Corn",
    "Mustard",
    "Celery",
    "Sulphites",
    "Lupin",
    "Mollusks",
    "Legumes",
    "Fruit",
    "Vegetables",
    "Garlic",
    "Onion",
    "Gelatin",
    "Meat",
    "Spices",
    "Chocolate",
    "Yeast",
];

const ACTIVITY_LEVELS = [
    {value: "sedentary", label: "Sedentary — little or no exercise"},
    {value: "light", label: "Light — exercise 1–3 times per week"},
    {value: "moderate", label: "Moderate — exercise 4–5 times per week"},
    {value: "very_active", label: "Very Active — intense exercise 6–7 times per week"},
];

const DEFAULT_FORM: ProfileFormData = {
    name: "",
    email: "",
    gender: undefined,
    dateOfBirth: "",
    height: 0,
    weight: 0,
    activityLevel: undefined,
    fitnessGoal: undefined,
    allergies: [],
};

type ApiMeResp = { user?: unknown; result?: unknown; error?: unknown };
type ApiProfileResp = { user?: unknown; result?: unknown; error?: unknown };

type UnknownRecord = Record<string, unknown>;

function isObject(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function get(obj: unknown, key: string): unknown {
    return isObject(obj) ? obj[key] : undefined;
}

// Minimal guard so TS allows userToFormData(user, prev)
function isMeUser(v: unknown): v is Exclude<MeUser, null> {
    if (!isObject(v)) return false;

    // Require the stable “identity” fields you showed in your MeUser type
    const id = v.id;
    const email = v.email;
    const phone = v.phone;

    return typeof id === "string" && typeof email === "string" && typeof phone === "string";
}

export default function Profile() {
    const {toast} = useToast();

    const [loadingMe, setLoadingMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [allergyPopoverOpen, setAllergyPopoverOpen] = useState(false);

    const [me, setMe] = useState<MeUser>(null);
    const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoadingMe(true);
            try {
                const res = await fetch("/api/auth/me", {credentials: "include"});
                const json = (await readJsonSafe(res)) as ApiMeResp;

                const userUnknown = get(json, "user") ?? get(json, "result") ?? null;

                if (!cancelled) {
                    setMe(isMeUser(userUnknown) ? userUnknown : null);
                }

                if (!cancelled && isMeUser(userUnknown)) {
                    setFormData((prev) => userToFormData(userUnknown, prev));
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

    const handleChange = <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const toggleAllergy = (allergy: string) => {
        const current = formData.allergies;
        const next = current.includes(allergy) ? current.filter((a) => a !== allergy) : [...current, allergy];
        handleChange("allergies", next);
    };

    const removeAllergy = (allergy: string) => {
        handleChange(
            "allergies",
            formData.allergies.filter((a) => a !== allergy)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: {"Content-Type": "application/json", Accept: "application/json"},
                credentials: "include",
                body: JSON.stringify(formDataToPatchPayload(formData)),
            });

            const json = (await readJsonSafe(res)) as ApiProfileResp;

            const err = get(json, "error");
            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Profile update failed",
                    description: err ? String(err) : "Something went wrong",
                });
                return;
            }

            toast({
                variant: "success",
                title: "Profile Updated",
                description: "Your profile has been saved successfully.",
            });

            const userUnknown = get(json, "user") ?? get(json, "result") ?? null;
            setMe(isMeUser(userUnknown) ? userUnknown : me);
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

                <AvatarCard loadingMe={loadingMe} name={formData.name} email={formData.email}/>

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