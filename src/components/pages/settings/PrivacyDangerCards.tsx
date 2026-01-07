// src/components/pages/settings/PrivacyDangerCards.tsx

import {Button} from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import {Download, Shield, Trash2} from "lucide-react";

type Props = {
    onExportData: () => void;
    onDeleteAccount: () => void;
};

export function PrivacyDangerCards({onExportData, onDeleteAccount}: Props) {
    return (
        <>
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
                        <Button variant="outline" onClick={onExportData}>
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
                                    This action cannot be undone. This will permanently delete your account and remove
                                    all your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onDeleteAccount}>Delete Account</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </>
    );
}