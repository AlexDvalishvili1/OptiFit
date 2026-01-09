// src/components/pages/profile/FitnessPreferencesSection.tsx

import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Checkbox} from "@/components/ui/checkbox";
import {ChevronDown, X} from "lucide-react";
import type {ProfileFormData} from "@/lib/pages/profile/types";

type ActivityOption = { value: string; label: string };

type FitnessFields = Pick<ProfileFormData, "activityLevel" | "fitnessGoal" | "allergies">;

type FitnessOnChange = (
    field: "activityLevel" | "fitnessGoal" | "allergies",
    value: ProfileFormData["activityLevel"] | ProfileFormData["fitnessGoal"] | ProfileFormData["allergies"]
) => void;

type Props = {
    activityLevels: ActivityOption[];
    allergyOptions: string[];
    allergyPopoverOpen: boolean;
    setAllergyPopoverOpen: (open: boolean) => void;
    formData: FitnessFields;
    onChange: FitnessOnChange;
    toggleAllergy: (allergy: string) => void;
    removeAllergy: (allergy: string) => void;
};

export function FitnessPreferencesSection({
                                              activityLevels,
                                              allergyOptions,
                                              allergyPopoverOpen,
                                              setAllergyPopoverOpen,
                                              formData,
                                              onChange,
                                              toggleAllergy,
                                              removeAllergy,
                                          }: Props) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="font-display text-lg font-semibold">Fitness Preferences</h3>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="activity">Activity Level</Label>
                    <Select
                        value={formData.activityLevel ?? ""}
                        onValueChange={(v) => onChange("activityLevel", (v || undefined) as FitnessFields["activityLevel"])}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select activity level"/>
                        </SelectTrigger>
                        <SelectContent>
                            {activityLevels.map((level) => (
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
                        value={formData.fitnessGoal ?? ""}
                        onValueChange={(v) => onChange("fitnessGoal", (v || undefined) as FitnessFields["fitnessGoal"])}
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
                                <Badge key={allergy} variant="secondary"
                                       className="pl-2 pr-1 py-1 flex items-center gap-1">
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
                  {formData.allergies.length === 0 ? "Select allergies..." : `${formData.allergies.length} selected`}
                </span>
                                <ChevronDown className="h-4 w-4 opacity-50"/>
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-80 p-0" align="start">
                            <div className="max-h-64 overflow-y-auto p-2">
                                <div className="grid grid-cols-2 gap-1">
                                    {allergyOptions.map((allergy) => (
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
    );
}