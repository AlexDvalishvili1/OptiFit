// src/components/pages/settings/AppearanceCard.tsx

import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Moon, Sun} from "lucide-react";

type Props = {
    mounted: boolean;
    isDark: boolean;
    onToggle: (enabled: boolean) => void;
};

export function AppearanceCard({mounted, isDark, onToggle}: Props) {
    const dark = mounted ? isDark : false;

    return (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                {dark ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
                Appearance
            </h3>

            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch checked={dark} onCheckedChange={onToggle} disabled={!mounted}/>
            </div>
        </div>
    );
}
