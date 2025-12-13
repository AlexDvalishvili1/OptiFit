"use client";

import {FormEvent, useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dumbbell, Mail, Lock, User, ArrowLeft, Phone} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from "next/navigation";
import {normalizePhone} from "@/hooks/normalize-phone.ts";

const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {toast} = useToast();

    const validatePhone = (value: string) => {
        if (!value.trim()) {
            setPhoneError('Phone number is required');
            return false;
        }
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            setPhoneError('Please enter a valid phone number (e.g., +1 234 567 8900)');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);
        if (value) validatePhone(value);
        else setPhoneError('');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Form Validation
        // const result = userSchema.safeParse(data);
        // if (!result.success) {
        //     result.error.issues.forEach((issue) => {
        //         setErrorMessage("");
        //         errorCatcher(issue.path, issue.message);
        //     });
        //     setLoading(false);
        //     return;
        // }

        let response;

        try {
            response = await fetch(`${window.location.origin}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    phone: normalizePhone(String(data.phone)),
                })
            });
        } catch (err) {
            console.log("Fetching error: " + err);
            throw Error;
        }

        const result = await response.json();

        if (result?.error) {
            toast({variant: "destructive", title: 'Registration Error', description: result.error});
            setLoading(false);
            return;
        }

        toast({
            variant: "success",
            title: 'Account created!',
            description: 'Welcome to OptiFit. Let\'s set up your profile.'
        });
        router.push('/profile');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex flex-1 items-center justify-center gradient-primary p-12">
                <div className="max-w-md text-center text-primary-foreground">
                    <h2 className="font-display text-3xl font-bold mb-4">Start Your Transformation Today</h2>
                    <p className="text-primary-foreground/90">Join thousands of fitness enthusiasts achieving their
                        goals with AI-powered personalized training.</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="w-full max-w-sm mx-auto">
                    <Link href="/"
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4"/>Back to home
                    </Link>
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                            <Dumbbell className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-2xl font-bold">OptiFit</span>
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-2">Create your account</h1>
                    <p className="text-muted-foreground mb-8">Start your free trial today</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="name" name={"name"} type="text" placeholder="John Doe" value={name}
                                       onChange={(e) => setName(e.target.value)} className="pl-10" required/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="email" name={"email"} type="email" placeholder="you@example.com"
                                       value={email}
                                       onChange={(e) => setEmail(e.target.value)} className="pl-10" required/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="phone" name={"phone"} type="tel" placeholder="+1 234 567 8900"
                                       value={phone}
                                       onChange={handlePhoneChange}
                                       className={`pl-10 ${phoneError ? 'border-destructive' : ''}`} required/>
                            </div>
                            {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
                            <p className="text-xs text-muted-foreground">Include country code for international
                                numbers</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="password" name={"password"} type="password" placeholder="••••••••"
                                       value={password}
                                       onChange={(e) => setPassword(e.target.value)} className="pl-10" required
                                       minLength={8}/>
                            </div>
                            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                        </div>
                        <Button type="submit" className="w-full" size="lg"
                                disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
                    </form>
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}<Link href="/signin"
                                                           className="text-primary font-medium hover:underline">Sign
                        in</Link>
                    </p>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By creating an account, you agree to our{' '}<Link href="/terms"
                                                                           className="underline hover:text-foreground">Terms
                        of Service</Link>{' '}and{' '}<Link href="/privacy"
                                                            className="underline hover:text-foreground">Privacy
                        Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}