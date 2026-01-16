"use client";

import * as React from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Loader2, ShieldCheck, Smartphone, KeyRound} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {usePhoneChangeFlow} from "@/hooks/usePhoneChangeFlow";

import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";

import {OtpInline} from "@/components/pages/register/OtpInline";
import {cn} from "@/lib/utils";
import {getErrInfo, isFirebaseExpectedCode} from "@/lib/pages/register/utils";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPhone: string;
    onSuccess: (newPhone: string) => Promise<void> | void;
};

function isOtpComplete(v: string) {
    return v.length === 6 && /^\d{6}$/.test(v);
}

export function PhoneChangeDialog({open, onOpenChange, currentPhone, onSuccess}: Props) {
    const {toast} = useToast();
    const f = usePhoneChangeFlow(currentPhone);

    const lastAutoVerifiedRef = React.useRef<string>("");

    React.useEffect(() => {
        if (!open) {
            f.reset();
            lastAutoVerifiedRef.current = "";
        }
    }, [open, f]);

    const sendCurrent = async () => {
        if (f.cooldownCurrent > 0) return;

        f.setBusy(true);
        try {
            await f.startVerifyCurrent();
            toast({
                variant: "success",
                title: "Code sent",
                description: "We sent a 6-digit code to your current phone."
            });
        } catch (e: unknown) {
            toast({variant: "destructive", title: "Cannot send code", description: f.getSendErrorMessage(e)});
        } finally {
            f.setBusy(false);
        }
    };

    const verifyCurrent = async () => {
        if (!isOtpComplete(f.otp)) return;

        f.setBusy(true);
        try {
            await f.confirmCurrentOtp();
            lastAutoVerifiedRef.current = "";
            toast({variant: "success", title: "Phone verified", description: "Now verify your new phone."});
        } catch (err) {
            const {code, message} = getErrInfo(err);
            if (!isFirebaseExpectedCode(code)) console.error(err);

            if (code.includes("auth/invalid-verification-code")) {
                toast({variant: "destructive", title: "Incorrect code", description: "Try again."});
            } else if (code.includes("auth/code-expired") || code.includes("auth/session-expired")) {
                toast({variant: "destructive", title: "Code expired", description: "Request a new code."});
            } else {
                toast({variant: "destructive", title: "Verification failed", description: message || "Try again."});
            }

            f.setOtp("");
            lastAutoVerifiedRef.current = "";
        } finally {
            f.setBusy(false);
        }
    };

    const sendNew = async () => {
        if (f.cooldownNew > 0) return;

        f.setBusy(true);
        try {
            await f.startVerifyNew();
            lastAutoVerifiedRef.current = "";
            toast({variant: "success", title: "Code sent", description: "We sent a 6-digit code to your new phone."});
        } catch (e: unknown) {
            toast({variant: "destructive", title: "Cannot send code", description: f.getSendErrorMessage(e)});
        } finally {
            f.setBusy(false);
        }
    };

    const verifyAndUpdate = async () => {
        if (!isOtpComplete(f.otp)) return;

        f.setBusy(true);
        try {
            if (!f.currentToken) {
                toast({
                    variant: "destructive",
                    title: "Phone verification missing",
                    description: "Verify current phone again."
                });
                return;
            }

            const tokenNew = await f.confirmNewOtpGetIdToken();

            const res = await fetch("/api/profile/phone", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    newPhone: f.newPhoneE164,
                    firebaseIdTokenCurrent: f.currentToken,
                    firebaseIdTokenNew: tokenNew,
                }),
            });

            const json = (await res.json().catch(() => ({}))) as { error?: unknown };

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Phone change failed",
                    description: String(json?.error || "Try again")
                });
                return;
            }

            await f.signOutFirebase();
            toast({variant: "success", title: "Phone updated", description: "Your phone number has been changed."});
            await onSuccess(f.newPhoneE164);
            onOpenChange(false);
        } catch (err) {
            const {code, message} = getErrInfo(err);
            if (!isFirebaseExpectedCode(code)) console.error(err);

            if (code.includes("auth/invalid-verification-code")) {
                toast({variant: "destructive", title: "Incorrect code", description: "Try again."});
            } else if (code.includes("auth/code-expired") || code.includes("auth/session-expired")) {
                toast({variant: "destructive", title: "Code expired", description: "Request a new code."});
            } else {
                toast({variant: "destructive", title: "Verification failed", description: message || "Try again."});
            }

            f.setOtp("");
            lastAutoVerifiedRef.current = "";
        } finally {
            f.setBusy(false);
        }
    };

    // ✅ Auto-verify when OTP becomes complete (like Register)
    React.useEffect(() => {
        if (!open) return;
        if (f.busy) return;
        if (!isOtpComplete(f.otp)) return;

        if (lastAutoVerifiedRef.current === f.otp) return;

        if (f.step === 2) {
            lastAutoVerifiedRef.current = f.otp;
            void verifyCurrent();
            return;
        }

        if (f.step === 3) {
            lastAutoVerifiedRef.current = f.otp;
            void verifyAndUpdate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, f.otp, f.busy, f.step]);

    const title = f.step === 1 ? "Verify current phone" : f.step === 2 ? "Enter current OTP" : "Verify new phone";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5"/>
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {f.step === 1 ? (
                    <div className="space-y-4">
                        <div className="rounded-xl border p-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Smartphone className="h-4 w-4"/>
                                    <span>Current phone</span>
                                </div>
                                <span className="font-medium">{currentPhone}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                                    disabled={f.busy}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={sendCurrent} disabled={f.busy || f.cooldownCurrent > 0}>
                                {f.busy ? <Loader2
                                    className="h-4 w-4 animate-spin"/> : f.cooldownCurrent > 0 ? `Wait ${f.cooldownCurrent}s` : "Send code"}
                            </Button>
                        </div>
                    </div>
                ) : null}

                {f.step === 2 ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4"/>
                                OTP code
                            </Label>

                            <OtpInline
                                value={f.otp}
                                onChange={(v) => {
                                    f.setOtp(v);
                                    if (!isOtpComplete(v)) lastAutoVerifiedRef.current = "";
                                }}
                                disabled={f.busy}
                            />

                            <p className="text-xs text-muted-foreground">Auto-verifies when all 6 digits are
                                entered.</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                                    disabled={f.busy}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={verifyCurrent} disabled={f.busy || !isOtpComplete(f.otp)}>
                                {f.busy ? <Loader2 className="h-4 w-4 animate-spin"/> : "Verify"}
                            </Button>
                        </div>
                    </div>
                ) : null}

                {f.step === 3 ? (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label>New phone number</Label>

                            <div className="flex gap-2 items-center">
                                <div className={cn("flex-1 rounded-xl border bg-background px-3 py-2")}>
                                    <PhoneInput
                                        defaultCountry="ge"
                                        value={f.newPhoneRaw}
                                        onChange={(v) => {
                                            f.setNewPhoneRaw(v);
                                            f.setOtp("");
                                            lastAutoVerifiedRef.current = "";
                                        }}
                                        inputClassName="!bg-transparent !outline-none !border-0 !shadow-none !w-full"
                                        countrySelectorStyleProps={{
                                            buttonClassName: "!bg-transparent !border-0 !shadow-none !px-1 !py-0 hover:!bg-muted rounded-md",
                                            dropdownStyleProps: {className: "!bg-background !border !rounded-xl !shadow-xl !mt-2"},
                                        }}
                                    />
                                </div>

                                <Button type="button" variant="outline" onClick={sendNew}
                                        disabled={f.busy || !f.newPhoneE164 || f.cooldownNew > 0}>
                                    {f.busy ? <Loader2
                                        className="h-4 w-4 animate-spin"/> : f.cooldownNew > 0 ? `Wait ${f.cooldownNew}s` : "Send code"}
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">Send OTP to your new phone, then enter the code
                                below.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4"/>
                                New phone OTP
                            </Label>

                            <OtpInline
                                value={f.otp}
                                onChange={(v) => {
                                    f.setOtp(v);
                                    if (!isOtpComplete(v)) lastAutoVerifiedRef.current = "";
                                }}
                                disabled={f.busy || !f.hasConfirmation}
                            />

                            <p className="text-xs text-muted-foreground">
                                {f.hasConfirmation ? "Auto-updates when all 6 digits are entered." : "Send code first."}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                                    disabled={f.busy}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={verifyAndUpdate}
                                    disabled={f.busy || !f.hasConfirmation || !isOtpComplete(f.otp)}>
                                {f.busy ? <Loader2 className="h-4 w-4 animate-spin"/> : "Verify & Update"}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}