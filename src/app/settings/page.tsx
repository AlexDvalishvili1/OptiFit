"use client";

import {useState} from 'react';
import {DashboardLayout} from "@/components/layout/dashboard/DashboardLayout.tsx";
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {useAppStore} from '@/lib/store';
import {
    Settings as SettingsIcon,
    Bell,
    Moon,
    Sun,
    Trash2,
    Shield,
    Download,
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from "next/navigation";
import {useTheme} from "@/components/providers/ThemeProvider.tsx";

export default function Page() {
    const {isDark, setTheme, mounted} = useTheme();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(true);
    const {logout} = useAppStore();
    const router = useRouter();
    const {toast} = useToast();

    const handleDarkModeToggle = (enabled: boolean) => {
        setDarkMode(enabled);
        if (enabled) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleDeleteAccount = () => {
        // TODO: Call API to delete account
        // DELETE /api/user/delete
        logout();
        toast({
            title: 'Account Deleted',
            description: 'Your account has been permanently deleted.',
        });
        router.push('/');
    };

    const handleExportData = () => {
        // TODO: Call API to export user data
        toast({
            title: 'Export Started',
            description: 'Your data export will be sent to your email shortly.',
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your app preferences and account settings
                    </p>
                </div>

                {/* Appearance */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        {darkMode ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
                        Appearance
                    </h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark themes
                            </p>
                        </div>
                        <Switch
                            checked={mounted ? isDark : false}
                            onCheckedChange={(enabled) => setTheme(enabled ? "dark" : "light")}
                            disabled={!mounted}
                        />
                    </div>
                </div>

                {/* Notifications */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5"/>
                        Notifications
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive workout reminders and updates
                                </p>
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
                                <p className="text-sm text-muted-foreground">
                                    Weekly progress reports and tips
                                </p>
                            </div>
                            <Switch
                                id="email-updates"
                                checked={emailUpdates}
                                onCheckedChange={setEmailUpdates}
                            />
                        </div>
                    </div>
                </div>

                {/* Privacy & Data */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5"/>
                        Privacy & Data
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Export Your Data</p>
                                <p className="text-sm text-muted-foreground">
                                    Download all your workout history and profile data
                                </p>
                            </div>
                            <Button variant="outline" onClick={handleExportData}>
                                <Download className="mr-2 h-4 w-4"/>
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6 rounded-2xl bg-card border border-destructive/50 space-y-6">
                    <h3 className="font-display text-lg font-semibold text-destructive flex items-center gap-2">
                        <Trash2 className="h-5 w-5"/>
                        Danger Zone
                    </h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        account and remove all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount}>
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* App Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>OptiFit v1.0.0</p>
                    <p className="mt-1">© 2025 OptiFit. All rights reserved.</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
