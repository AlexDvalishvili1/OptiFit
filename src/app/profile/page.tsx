"use client";

import {useState} from 'react';
import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {useAppStore} from '@/lib/store';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {Checkbox} from '@/components/ui/checkbox';
import {User, Save, X, ChevronDown} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

const ALLERGY_OPTIONS = [
    'Lactose', 'Gluten', 'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Soy', 'Eggs',
    'Wheat', 'Sesame', 'Corn', 'Mustard', 'Celery', 'Sulphites', 'Lupin', 'Mollusks',
    'Legumes', 'Fruit', 'Vegetables', 'Garlic', 'Onion', 'Gelatin', 'Meat', 'Spices',
    'Chocolate', 'Yeast'
];

const ACTIVITY_LEVELS = [
    {value: 'bmr', label: 'Basal Metabolic Rate (BMR)'},
    {value: 'sedentary', label: 'Sedentary — little or no exercise'},
    {value: 'light', label: 'Light — exercise 1–3 times per week'},
    {value: 'moderate', label: 'Moderate — exercise 4–5 times per week'},
    {value: 'very_active', label: 'Very Active — intense exercise 6–7 times per week'},
];

export default function Profile() {
    const {user, updateProfile} = useAppStore();
    const {toast} = useToast();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        gender: user?.gender || 'male',
        dateOfBirth: user?.dateOfBirth || '',
        height: user?.height || 175,
        weight: user?.weight || 75,
        activityLevel: user?.activityLevel || 'moderate',
        fitnessGoal: user?.fitnessGoal || 'build_muscle',
        allergies: user?.allergies || [],
    });

    const [allergyPopoverOpen, setAllergyPopoverOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateProfile(formData);

        toast({
            title: 'Profile Updated',
            description: 'Your profile has been saved successfully.',
        });
    };

    const handleChange = (field: string, value: string | number | string[]) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const toggleAllergy = (allergy: string) => {
        const currentAllergies = formData.allergies;
        const newAllergies = currentAllergies.includes(allergy)
            ? currentAllergies.filter((a) => a !== allergy)
            : [...currentAllergies, allergy];
        handleChange('allergies', newAllergies);
    };

    const removeAllergy = (allergy: string) => {
        handleChange('allergies', formData.allergies.filter((a) => a !== allergy));
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">
                        Profile Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Update your personal information and fitness preferences
                    </p>
                </div>

                {/* Avatar Section - Simplified without upload */}
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border">
                    <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-primary-foreground">
              {formData.name.charAt(0) || 'U'}
            </span>
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold">{formData.name || 'User'}</h2>
                        <p className="text-sm text-muted-foreground">{formData.email || 'user@example.com'}</p>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5"/>
                            Personal Information
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleChange('gender', value)}
                                >
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
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                                    placeholder="175"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                                    placeholder="75"
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
                                    onValueChange={(value) => handleChange('activityLevel', value)}
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
                                    onValueChange={(value) => handleChange('fitnessGoal', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select goal"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lose_weight">Lose Weight</SelectItem>
                                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                                        <SelectItem value="build_muscle">Build Muscle</SelectItem>
                                        <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="sm:col-span-2 space-y-3">
                                <Label>Food Allergies</Label>

                                {/* Selected Allergies as Badges */}
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

                                {/* Multi-select Popover */}
                                <Popover open={allergyPopoverOpen} onOpenChange={setAllergyPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between"
                                        >
                      <span className="text-muted-foreground">
                        {formData.allergies.length === 0
                            ? 'Select allergies...'
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
                        <Button type="submit" size="lg">
                            <Save className="mr-2 h-5 w-5"/>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
