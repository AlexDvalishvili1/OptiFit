"use client";

import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useQuery, useQueryClient} from "@tanstack/react-query";

import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Save} from "lucide-react";
import {useToast} from "@/hooks/use-toast";

import {ProfileHeader} from "@/components/pages/profile/ProfileHeader";
import {AvatarCard} from "@/components/pages/profile/AvatarCard";
import {PersonalInfoSection} from "@/components/pages/profile/PersonalInfoSection";
import {FitnessPreferencesSection} from "@/components/pages/profile/FitnessPreferencesSection";

import type {MeUser, ProfileFormData} from "@/lib/pages/profile/types";
import {formDataToPatchPayload, userToFormData} from "@/lib/pages/profile/mappers";
import {useAuth} from "@/components/providers/AuthProvider";

type ActivityLevelOption = { value: string; label: string };

const ALLERGY_OPTIONS = [
    "Lactose", "Gluten", "Peanuts", "Tree Nuts", "Shellfish", "Fish", "Soy", "Eggs", "Wheat", "Sesame", "Corn",
    "Mustard", "Celery", "Sulphites", "Lupin", "Mollusks", "Legumes", "Fruit", "Vegetables", "Garlic", "Onion",
    "Gelatin", "Meat", "Spices", "Chocolate", "Yeast",
] satisfies string[];

const ACTIVITY_LEVELS = [
    {value: "sedentary", label: "Sedentary — little or no exercise"},
    {value: "light", label: "Light — exercise 1–3 times per week"},
    {value: "moderate", label: "Moderate — exercise 4–5 times per week"},
    {value: "very_active", label: "Very Active — intense exercise 6–7 times per week"},
] satisfies ActivityLevelOption[];

const DEFAULT_FORM: ProfileFormData = {
    name: "",
    gender: undefined,
    dateOfBirth: "",
    height: "",
    weight: "",
    activityLevel: undefined,
    fitnessGoal: undefined,
    allergies: [],
};

type UnknownRecord = Record<string, unknown>;

function isObject(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function isMeUser(v: unknown): v is Exclude<MeUser, null> {
    if (!isObject(v)) return false;
    const id = v["id"];
    const phone = v["phone"];
    return typeof id === "string" && typeof phone === "string";
}

async function fetchProfile(): Promise<MeUser> {
    const res = await fetch("/api/profile", {
        credentials: "include",
        headers: {"Cache-Control": "no-store"},
    });
    const json = (await res.json().catch(() => null)) as unknown;

    if (!res.ok) return null;

    const raw =
        (isObject(json) && ("user" in json) ? (json).user : null) ??
        (isObject(json) && ("result" in json) ? (json).result : null) ??
        json;

    return isMeUser(raw) ? (raw as Exclude<MeUser, null>) : null;
}

export default function Profile() {
    const {toast} = useToast();
    const router = useRouter();
    const queryClient = useQueryClient();
    const {refresh: refreshMe} = useAuth();

    const [saving, setSaving] = useState(false);
    const [allergyPopoverOpen, setAllergyPopoverOpen] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM);
    const [dirty, setDirty] = useState(false);

    const {data: me, isPending, isFetching, refetch} = useQuery({
        queryKey: ["profile"],
        queryFn: fetchProfile,
        staleTime: 0,
        gcTime: 5 * 60_000,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const loadingMe = isPending || isFetching;

    const basePhone = typeof (me)?.phone === "string" ? (me).phone : "";
    const [phoneLive, setPhoneLive] = useState(basePhone);

    useEffect(() => {
        setPhoneLive(basePhone);
    }, [basePhone]);

    // Hydrate from profile endpoint (server-truth), never from auth/me
    useEffect(() => {
        if (loadingMe) return;
        if (dirty) return;

        if (me) setFormData(userToFormData(me as Exclude<MeUser, null>, DEFAULT_FORM));
        else setFormData(DEFAULT_FORM);
    }, [loadingMe, me, dirty]);

    const handleChange = <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
        setDirty(true);
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const toggleAllergy = (allergy: string) => {
        setDirty(true);
        setFormData((prev) => {
            const current = prev.allergies;
            const next = current.includes(allergy) ? current.filter((a) => a !== allergy) : [...current, allergy];
            return {...prev, allergies: next};
        });
    };

    const removeAllergy = (allergy: string) => {
        setDirty(true);
        setFormData((prev) => ({...prev, allergies: prev.allergies.filter((a) => a !== allergy)}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: {"Content-Type": "application/json", Accept: "application/json"},
                credentials: "include",
                body: JSON.stringify(formDataToPatchPayload(formData)),
            });

            const json = (await res.json().catch(() => ({}))) as { error?: unknown; user?: unknown; result?: unknown };

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Profile update failed",
                    description: json?.error ? String(json.error) : "Something went wrong",
                });
                return;
            }

            toast({
                variant: "success",
                title: "Profile Updated",
                description: "Your profile has been saved successfully.",
            });

            setDirty(false);

            // profile truth
            await queryClient.invalidateQueries({queryKey: ["profile"]});
            // auth header/sidebar
            await refreshMe();

            router.refresh();

            const raw = (json.user ?? json.result ?? null) as unknown;
            if (isMeUser(raw)) queryClient.setQueryData(["profile"], raw);
            else await refetch();
        } catch {
            toast({variant: "destructive", title: "Network error", description: "Please try again."});
        } finally {
            setSaving(false);
        }
    };

    const avatarName = useMemo(() => formData.name, [formData.name]);

    return (
        <DashboardLayout>
            {/* MUST stay mounted */}
            <div id="recaptcha-phone-change" className="hidden"/>

            <div className="max-w-2xl mx-auto space-y-8">
                <ProfileHeader/>
                <AvatarCard loadingMe={loadingMe} name={avatarName} phone={phoneLive}/>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <PersonalInfoSection
                        formData={formData}
                        onChange={handleChange}
                        phone={phoneLive}
                        onPhoneChanged={async (newPhone) => {
                            setPhoneLive(newPhone);
                            setDirty(false);
                            await queryClient.invalidateQueries({queryKey: ["profile"]});
                            await refreshMe();
                            router.refresh();
                        }}
                    />

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
                        <Button type="submit" size="lg" disabled={saving}>
                            <Save className="mr-2 h-5 w-5"/>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}