"use client";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Clock, RefreshCw, Wand2} from "lucide-react";

type Props = {
    modsLeft: number;
    prompt: string;
    setPrompt: (v: string) => void;
    modifying: boolean;
    canApply: boolean;
    onApply: () => void;
};

export default function TrainingModifyCard({
                                               modsLeft,
                                               prompt,
                                               setPrompt,
                                               modifying,
                                               canApply,
                                               onApply,
                                           }: Props) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        <Wand2 className="h-5 w-5"/>
                        Modify your program
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Example: “No Friday.” / “I have scoliosis.” / “Only dumbbells available.”
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm">
                    <Clock className="h-4 w-4"/>
                    <span className="font-medium">{modsLeft}</span>
                    <span className="text-muted-foreground">mods left today</span>
                </div>
            </div>

            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type a plan-related request…"
                className="min-h-[110px]"
                disabled={modifying}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                    ⚠️ Non-plan prompts → warning, then backend bans (5 min, doubles).
                </p>

                <Button onClick={onApply} disabled={!canApply} className="h-11">
                    {modifying ? (
                        <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin"/>
                            Modifying...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5"/>
                            Apply Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}