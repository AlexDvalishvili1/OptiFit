"use client";

import {Button} from "@/components/ui/button";
import {RefreshCw, Sparkles} from "lucide-react";

type Props = {
    hasPlan: boolean;
    loading: boolean;
    generating: boolean;
    onGenerate: () => void;
};

export default function TrainingHeader({hasPlan, loading, generating, onGenerate}: Props) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold">AI Training Program</h1>
                <p className="text-muted-foreground mt-1">
                    Loads your plan from database. Regenerate is available once per week.
                </p>
            </div>

            {hasPlan && (
                <Button onClick={onGenerate} disabled={loading || generating} className="h-11">
                    {generating ? (
                        <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5"/>
                            Regenerate (weekly)
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}