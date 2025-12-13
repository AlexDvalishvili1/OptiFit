"use client";

import {useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dumbbell, Mail, ArrowLeft, CheckCircle2} from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4"/>
                    Back to sign in
                </Link>

                <div className="flex items-center gap-2 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                        <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                    </div>
                    <span className="font-display text-2xl font-bold">OptiFit</span>
                </div>

                {!sent ? (
                    <>
                        <h1 className="font-display text-2xl font-bold mb-2">Reset your password</h1>
                        <p className="text-muted-foreground mb-8">
                            Enter your email and we'll send you a reset link
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-8 w-8 text-primary"/>
                        </div>
                        <h1 className="font-display text-2xl font-bold mb-2">Check your email</h1>
                        <p className="text-muted-foreground mb-8">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/signin">Back to Sign In</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}