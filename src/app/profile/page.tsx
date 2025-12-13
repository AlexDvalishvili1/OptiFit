"use client";

import {useEffect, useState} from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Checkbox} from "@/components/ui/checkbox";
import {User as UserIcon, Save, X, ChevronDown} from "lucide-react";
import {useToast} from "@/hooks/use-toast";

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
    // optional fields you may return from /me (recommended)
    gender?: "male" | "female";
    dob?: string; // ISO
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
        gender: undefined,
        dateOfBirth: "", // yyyy-mm-dd
        height: 0,
        weight: 0,
        activityLevel: undefined,
        fitnessGoal: undefined,
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
            // send to your profile update API (see route below)
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: {"Content-Type": "application/json", Accept: "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name.trim(),
                    // usually you don't allow changing email here, but keeping since your UI has it
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

            // refresh /me in memory (optional)
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
                {/* Header */}
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Update your personal information and fitness preferences
                    </p>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border">
                    <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-primary-foreground">
              {(formData.name?.charAt(0) || "U").toUpperCase()}
            </span>
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold">
                            {loadingMe ? "Loading..." : formData.name || "User"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {loadingMe ? "" : formData.email || "user@example.com"}
                        </p>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                            <UserIcon className="h-5 w-5"/>
                            Personal Information
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => handleChange("height", Number(e.target.value))}
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => handleChange("weight", Number(e.target.value))}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                        <h3 className="font-display text-lg font-semibold">Fitness Preferences</h3>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="activity">Activity Level</Label>
                                <Select
                                    value={formData.activityLevel}
                                    onValueChange={(v) => handleChange("activityLevel", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select activity level"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACTIVITY_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goal">Fitness Goal</Label>
                                <Select
                                    value={formData.fitnessGoal}
                                    onValueChange={(v) => handleChange("fitnessGoal", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select goal"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lose weight">Lose Weight</SelectItem>
                                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                                        <SelectItem value="build muscle">Build Muscle</SelectItem>
                                        <SelectItem value="improve endurance">Improve Endurance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="sm:col-span-2 space-y-3">
                                <Label>Food Allergies</Label>

                                {formData.allergies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.allergies.map((allergy) => (
                                            <Badge
                                                key={allergy}
                                                variant="secondary"
                                                className="pl-2 pr-1 py-1 flex items-center gap-1"
                                            >
                                                {allergy}
                                                <button
                                                    type="button"
                                                    onClick={() => removeAllergy(allergy)}
                                                    className="h-4 w-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                                                >
                                                    <X className="h-3 w-3"/>
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <Popover open={allergyPopoverOpen} onOpenChange={setAllergyPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="w-full justify-between">
                      <span className="text-muted-foreground">
                        {formData.allergies.length === 0
                            ? "Select allergies..."
                            : `${formData.allergies.length} selected`}
                      </span>
                                            <ChevronDown className="h-4 w-4 opacity-50"/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0" align="start">
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            <div className="grid grid-cols-2 gap-1">
                                                {ALLERGY_OPTIONS.map((allergy) => (
                                                    <label
                                                        key={allergy}
                                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-sm"
                                                    >
                                                        <Checkbox
                                                            checked={formData.allergies.includes(allergy)}
                                                            onCheckedChange={() => toggleAllergy(allergy)}
                                                        />
                                                        {allergy}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

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