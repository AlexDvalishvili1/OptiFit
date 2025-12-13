"use client";

import {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Dumbbell, Lock, ArrowLeft, Mail, Phone} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";
import {normalizePhone} from "@/hooks/normalize-phone.ts";

export default function SignIn() {
    const [identifier, setIdentifier] = useState(""); // email OR phone
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const {toast} = useToast();

    // 🔤 any letter → email | 🔢 only digits/symbols → phone
    const hasLetter = identifier ? /[a-zA-Z]/.test(identifier) : true;
    const identifierToSend = hasLetter ? identifier.trim() : normalizePhone(identifier);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({identifier: identifierToSend, password}),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Sign in failed",
                    description: json?.error || "Invalid credentials",
                });
                return;
            }

            toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
            });

            router.push("/dashboard");
            router.refresh();
        } catch {
            toast({
                variant: "destructive",
                title: "Network error",
                description: "Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="w-full max-w-sm mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to home
                    </Link>

                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                            <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-2xl font-bold">OptiFit</span>
                    </div>

                    <h1 className="font-display text-2xl font-bold mb-2">Welcome back</h1>
                    <p className="text-muted-foreground mb-8">
                        Sign in to continue your fitness journey
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="identifier">Email or phone number</Label>
                            <div className="relative">
                                {hasLetter ? (
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                ) : (
                                    <Phone
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                )}

                                <Input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    placeholder="you@example.com or +1 234 567 8900"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center gradient-primary p-12">
                <div className="max-w-md text-center text-primary-foreground">
                    <h2 className="font-display text-3xl font-bold mb-4">
                        Transform Your Fitness Journey
                    </h2>
                    <p className="text-primary-foreground/90">
                        Access personalized AI-powered training programs, nutrition plans,
                        and track your progress all in one place.
                    </p>
                </div>
            </div>
        </div>
    );
}