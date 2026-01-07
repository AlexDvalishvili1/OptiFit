"use client";

import {Flame} from "lucide-react";

export default function DietMacroOverview({
                                              calories,
                                              protein,
                                              carbs,
                                              fat,
                                          }: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}) {
    return (
        <div className="p-6 rounded-2xl gradient-primary text-primary-foreground">
            <div className="flex items-center gap-3 mb-6">
                <Flame className="h-6 w-6"/>
                <h2 className="font-display text-xl font-semibold">Daily Targets</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Stat label="Calories" value={calories}/>
                <Stat label="Protein" value={`${protein}g`}/>
                <Stat label="Carbs" value={`${carbs}g`}/>
                <Stat label="Fat" value={`${fat}g`}/>
            </div>
        </div>
    );
}

function Stat({label, value}: { label: string; value: string | number }) {
    return (
        <div>
            <p className="font-display text-3xl font-bold">{value}</p>
            <p className="text-primary-foreground/80 text-sm">{label}</p>
        </div>
    );
}