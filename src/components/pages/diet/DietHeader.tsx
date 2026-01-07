"use client";

export default function DietHeader() {
    return (
        <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">AI Diet Plan</h1>
            <p className="text-muted-foreground mt-1">
                Opens today’s diet if it exists. Otherwise generate it. You can request modifications below.
            </p>
        </div>
    );
}