"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {CheckCircle2, RotateCcw} from "lucide-react";

import {useForgotPasswordFlow} from "@/hooks/useForgotPasswordFlow";
import {PasswordField} from "@/components/pages/forgot-password/PasswordField";

export function StepNewPassword({flow}: { flow: ReturnType<typeof useForgotPasswordFlow> }) {
    const mismatch = flow.newPassword2 && flow.newPassword !== flow.newPassword2;

    return (
        <form onSubmit={flow.submitReset} className="space-y-5">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4"/>
                    <span className="font-medium">Phone verified</span>
                </div>
            </div>

            <PasswordField
                label="New password"
                value={flow.newPassword}
                onChange={flow.setNewPassword}
                show={flow.showPass1}
                onToggle={() => flow.setShowPass1(!flow.showPass1)}
                helper={<p className="text-xs text-white/45">Must be at least 8 characters</p>}
            />

            <PasswordField
                label="Confirm new password"
                value={flow.newPassword2}
                onChange={flow.setNewPassword2}
                show={flow.showPass2}
                onToggle={() => flow.setShowPass2(!flow.showPass2)}
                error={mismatch ? <p className="text-xs text-red-400">Passwords do not match</p> : null}
            />

            <Button className="w-full h-11" type="submit" disabled={!flow.resetValid || flow.loadingReset}>
                {flow.loadingReset ? "Updating..." : "Update password"}
            </Button>

            <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
                onClick={flow.goBackToPhone}
                disabled={flow.loadingReset}
            >
                <RotateCcw className="mr-2 h-4 w-4"/>
                Start over
            </Button>
        </form>
    );
}