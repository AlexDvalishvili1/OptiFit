"use client";

export default function ActiveWorkoutIntro({
                                               day,
                                               muscles,
                                           }: {
    day: string;
    muscles: string;
}) {
    return (
        <div className="p-6 rounded-2xl gradient-primary text-primary-foreground">
            <h2 className="font-display text-xl font-semibold mb-1">{day} Workout</h2>
            <p className="text-primary-foreground/80 text-sm">{muscles}</p>
        </div>
    );
}