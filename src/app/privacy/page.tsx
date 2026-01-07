"use client";

import Link from "next/link";
import {Navbar} from "@/components/layout/navbar/Navbar.tsx";
import {ArrowLeft} from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar/>

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to home
                    </Link>

                    <h1 className="font-display text-3xl lg:text-4xl font-bold mb-8">
                        Privacy Policy
                    </h1>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                        <p className="text-muted-foreground text-lg">
                            Last updated: December 2025
                        </p>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">1. Introduction</h2>
                            <p className="text-muted-foreground">
                                OptiFit ("we", "our", or "us") is committed to protecting your privacy. This Privacy
                                Policy explains how we collect, use, disclose, and safeguard your information when you
                                use our fitness platform and related services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">2. Information We Collect</h2>
                            <p className="text-muted-foreground">
                                We collect information you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Account information (name, email, phone number, password)</li>
                                <li>Profile data (age, gender, height, weight, fitness goals)</li>
                                <li>Health and fitness information (workout history, dietary preferences, allergies)
                                </li>
                                <li>Usage data (app interactions, features used, time spent)</li>
                                <li>Device information (device type, operating system, browser type)</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">3. How We Use Your Information</h2>
                            <p className="text-muted-foreground">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Generate personalized workout and nutrition plans</li>
                                <li>Track your fitness progress and provide analytics</li>
                                <li>Send you notifications and updates about your account</li>
                                <li>Respond to your comments, questions, and support requests</li>
                                <li>Analyze usage patterns to enhance user experience</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">4. Data Security</h2>
                            <p className="text-muted-foreground">
                                We implement appropriate technical and organizational measures to protect your personal
                                information against unauthorized access, alteration, disclosure, or destruction.
                                However, no method of transmission over the Internet or electronic storage is 100%
                                secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">5. Data Sharing</h2>
                            <p className="text-muted-foreground">
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Service providers who assist in operating our platform</li>
                                <li>Analytics partners to help us understand usage patterns</li>
                                <li>Legal authorities when required by law</li>
                                <li>Business partners with your explicit consent</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">6. Your Rights</h2>
                            <p className="text-muted-foreground">
                                Depending on your location, you may have certain rights regarding your personal data,
                                including:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Access to your personal data</li>
                                <li>Correction of inaccurate data</li>
                                <li>Deletion of your data</li>
                                <li>Data portability</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">7. Data Retention</h2>
                            <p className="text-muted-foreground">
                                We retain your personal information for as long as your account is active or as needed
                                to provide you services. We may also retain and use your information to comply with
                                legal obligations, resolve disputes, and enforce our agreements.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">8. Children's Privacy</h2>
                            <p className="text-muted-foreground">
                                Our Service is not intended for children under 16 years of age. We do not knowingly
                                collect personal information from children under 16. If you become aware that a child
                                has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">9. Changes to This Policy</h2>
                            <p className="text-muted-foreground">
                                We may update this Privacy Policy from time to time. We will notify you of any changes
                                by posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">10. Contact Us</h2>
                            <p className="text-muted-foreground">
                                If you have any questions about this Privacy Policy or our data practices, please
                                contact us at privacy@optifit.com.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
