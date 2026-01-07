// src/components/pages/profile/PersonalInfoSection.tsx

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {User as UserIcon} from "lucide-react";

type FormData = {
    name: string;
    email: string;
    gender: undefined | "male" | "female";
    dateOfBirth: string;
    height: number;
    weight: number;
};

type Props = {
    formData: FormData;
    onChange: (field: string, value: any) => void;
};

export function PersonalInfoSection({formData, onChange}: Props) {
    return (
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
                        onChange={(e) => onChange("name", e.target.value)}
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => onChange("gender", v)}>
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
                        onChange={(e) => onChange("dateOfBirth", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => onChange("height", Number(e.target.value))}
                        placeholder="0"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => onChange("weight", Number(e.target.value))}
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
}