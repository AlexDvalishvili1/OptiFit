// src/components/pages/settings/NotificationsCard.tsx

import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Bell} from "lucide-react";

type Props = {
    notifications: boolean;
    setNotifications: (v: boolean) => void;
    emailUpdates: boolean;
    setEmailUpdates: (v: boolean) => void;
};

export function NotificationsCard({
                                      notifications,
                                      setNotifications,
                                      emailUpdates,
                                      setEmailUpdates,
                                  }: Props) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5"/>
                Notifications
            </h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive workout reminders and updates</p>
                    </div>
                    <Switch
                        id="push-notifications"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="email-updates">Email Updates</Label>
                        <p className="text-sm text-muted-foreground">Weekly progress reports and tips</p>
                    </div>
                    <Switch id="email-updates" checked={emailUpdates} onCheckedChange={setEmailUpdates}/>
                </div>
            </div>
        </div>
    );
}