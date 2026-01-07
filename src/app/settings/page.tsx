"use client";

import {useState} from "react";
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {useAppStore} from "@/lib/store";
import {useToast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";
import {useTheme} from "@/components/providers/ThemeProvider.tsx";
import {SettingsHeader} from "@/components/pages/settings/SettingsHeader";
import {AppearanceCard} from "@/components/pages/settings/AppearanceCard";
import {NotificationsCard} from "@/components/pages/settings/NotificationsCard";
import {PrivacyDangerCards} from "@/components/pages/settings/PrivacyDangerCards";

export default function Page() {
    const {isDark, setTheme, mounted} = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(true);

    const {logout} = useAppStore();
    const router = useRouter();
    const {toast} = useToast();

    const handleDeleteAccount = () => {
        // TODO: Call API to delete account
        // DELETE /api/user/delete
        logout();
        toast({
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
        });
        router.push("/");
    };

    const handleExportData = () => {
        // TODO: Call API to export user data
        toast({
            title: "Export Started",
            description: "Your data export will be sent to your email shortly.",
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <SettingsHeader/>

                <AppearanceCard
                    mounted={mounted}
                    isDark={isDark}
                    onToggle={(enabled) => setTheme(enabled ? "dark" : "light")}
                />

                <NotificationsCard
                    notifications={notifications}
                    setNotifications={setNotifications}
                    emailUpdates={emailUpdates}
                    setEmailUpdates={setEmailUpdates}
                />

                <PrivacyDangerCards onExportData={handleExportData} onDeleteAccount={handleDeleteAccount}/>

                {/* App Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>OptiFit v1.0.0</p>
                    <p className="mt-1">© 2025 OptiFit. All rights reserved.</p>
                </div>
            </div>
        </DashboardLayout>
    );
}