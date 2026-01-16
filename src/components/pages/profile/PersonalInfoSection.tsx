import * as React from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {AlertCircle, User as UserIcon} from "lucide-react";
import type {ProfileFormData} from "@/lib/pages/profile/types";
import {PhoneChangeDialog} from "@/components/pages/profile/PhoneChangeDialog";

type PersonalFields = Pick<ProfileFormData, "name" | "gender" | "dateOfBirth" | "height" | "weight">;

type PersonalOnChange = (
    field: "name" | "gender" | "dateOfBirth" | "height" | "weight",
    value:
        | ProfileFormData["name"]
        | ProfileFormData["gender"]
        | ProfileFormData["dateOfBirth"]
        | ProfileFormData["height"]
        | ProfileFormData["weight"]
) => void;

type Props = {
    formData: PersonalFields;
    onChange: PersonalOnChange;
    phone: string;
    onPhoneChanged?: (newPhone: string) => void | Promise<void>;
};

function toNumberOrEmpty(v: string): number | "" {
    if (v.trim() === "") return "";
    const n = Number(v);
    return Number.isFinite(n) ? n : "";
}

function useHoverCapable() {
    const [hover, setHover] = React.useState(true);

    React.useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        const apply = () => setHover(mq.matches);
        apply();
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    return hover;
}

export function PersonalInfoSection({formData, onChange, phone, onPhoneChanged}: Props) {
    const [phoneDialogOpen, setPhoneDialogOpen] = React.useState(false);
    const hoverCapable = useHoverCapable();

    const tip = "Changing phone requires verification of current and new number.";

    return (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5"/>
                Personal Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => onChange("name", e.target.value)}
                           placeholder="John Doe"/>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 mb-[15px]">
                        Phone Number

                        {hoverCapable ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button type="button"
                                                className="inline-flex items-center text-muted-foreground hover:text-foreground">
                                            <AlertCircle className="h-4 w-4"/>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{tip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button type="button"
                                            className="inline-flex items-center text-muted-foreground hover:text-foreground">
                                        <AlertCircle className="h-4 w-4"/>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 text-sm">
                                    {tip}
                                </PopoverContent>
                            </Popover>
                        )}
                    </Label>

                    <div className="flex gap-2">
                        <Input id="phone" value={phone} disabled/>
                        <Button type="button" variant="outline" onClick={() => setPhoneDialogOpen(true)}>
                            Change
                        </Button>
                    </div>

                    <PhoneChangeDialog
                        open={phoneDialogOpen}
                        onOpenChange={setPhoneDialogOpen}
                        currentPhone={phone}
                        onSuccess={async (newPhone) => {
                            await onPhoneChanged?.(newPhone);
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender ?? ""}
                            onValueChange={(v) => onChange("gender", (v || undefined) as PersonalFields["gender"])}>
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
                    <Input id="dob" type="date" value={formData.dateOfBirth}
                           onChange={(e) => onChange("dateOfBirth", e.target.value)}/>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                        id="height"
                        type="number"
                        inputMode="numeric"
                        value={formData.height}
                        onChange={(e) => onChange("height", toNumberOrEmpty(e.target.value))}
                        placeholder="0"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                        id="weight"
                        type="number"
                        inputMode="numeric"
                        value={formData.weight}
                        onChange={(e) => onChange("weight", toNumberOrEmpty(e.target.value))}
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
}