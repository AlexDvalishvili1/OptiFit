"use client";

import {Button} from "@/components/ui/button";
import {AlertTriangle, RefreshCw, Sparkles} from "lucide-react";

export default function DietEmptyState({
                                           generating,
                                           onGenerate,
                                       }: {
    generating: boolean;
    onGenerate: () => void;
}) {
    return (
        <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6"/>
                </div>
                <div className="flex-1">
                    <h2 className="font-display text-xl font-semibold">No diet for today</h2>
                    <p className="text-muted-foreground mt-1">
                        Generate your meal plan based on your profile.
                    </p>
                    <div className="mt-4">
                        <Button onClick={onGenerate} disabled={generating}>
                            {generating ? (
                                <>
                                    <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5"/>
                                    Generate Diet
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}