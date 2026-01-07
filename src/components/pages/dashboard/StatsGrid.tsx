"use client";

import {Calendar, Flame, Target, TrendingUp} from "lucide-react";

export default function StatsGrid({
                                      goalText,
                                      dailyCaloriesText,
                                      activityText,
                                      weekProgressText,
                                  }: {
    goalText: string;
    dailyCaloriesText: string;
    activityText: string;
    weekProgressText: string;
}) {
    const Item = ({
                      icon: Icon,
                      label,
                      value,
                  }: {
        icon: any;
        label: string;
        value: string;
    }) => (
        <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-shadow">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-display text-lg font-semibold">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Item icon={Target} label="Current Goal" value={goalText}/>
            <Item icon={Flame} label="Daily Calories" value={dailyCaloriesText}/>
            <Item icon={TrendingUp} label="Activity Level" value={activityText}/>
            <Item icon={Calendar} label="Week Progress" value={weekProgressText}/>
        </div>
    );
}