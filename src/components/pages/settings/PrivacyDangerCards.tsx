// src/components/pages/settings/PrivacyDangerCards.tsx

"use client";

import {useMemo, useState} from "react";
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
import {Input} from "@/components/ui/input";
import {Download, Eye, EyeOff, Shield, Trash2} from "lucide-react";

type Props = {
    onExportData: () => void;
    onDeleteAccount: (password: string) => Promise<void> | void;
};

export function PrivacyDangerCards({onExportData, onDeleteAccount}: Props) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDelete = useMemo(
        () => password.trim().length >= 6 && !busy,
        [password, busy]
    );

    const resetState = () => {
        setPassword("");
        setShowPassword(false);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canDelete) return;

        setError(null);
        setBusy(true);
        try {
            await onDeleteAccount(password);
            setOpen(false);
            resetState();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Delete failed");
        } finally {
            setBusy(false);
        }
    };

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

                    <AlertDialog
                        open={open}
                        onOpenChange={(v) => {
                            if (busy) return;
                            setOpen(v);
                            if (!v) resetState();
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <form onSubmit={handleSubmit}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and
                                        remove
                                        all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="mt-4 space-y-2">
                                    <label className="text-sm font-medium">Confirm with your password</label>

                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={busy}
                                            className="pr-10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            aria-pressed={showPassword}
                                            disabled={busy}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                        </button>
                                    </div>

                                    {error ? <p className="text-sm text-destructive">{error}</p> : null}

                                    <p className="text-xs text-muted-foreground">
                                        For your security, we require your password to delete the account.
                                    </p>
                                </div>

                                <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel
                                        type="button"
                                        onClick={resetState}
                                        disabled={busy}
                                    >
                                        Cancel
                                    </AlertDialogCancel>

                                    {/* IMPORTANT: use normal Button, not AlertDialogAction, to avoid auto-close */}
                                    <Button type="submit" variant="destructive" disabled={!canDelete}>
                                        {busy ? "Deleting…" : "Delete Account"}
                                    </Button>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </>
    );
}