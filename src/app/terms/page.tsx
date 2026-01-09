"use client";

import Link from "next/link";
import {Navbar} from "@/components/layout/navbar/Navbar";
import {ArrowLeft} from 'lucide-react';

export default function TermsOfService() {
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
                        Terms of Service
                    </h1>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                        <p className="text-muted-foreground text-lg">
                            Last updated: December 2025
                        </p>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground">
                                By accessing and using OptiFit ("the Service"), you accept and agree to be bound by the
                                terms and provisions of this agreement. If you do not agree to abide by these terms,
                                please do not use this service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">2. Description of Service</h2>
                            <p className="text-muted-foreground">
                                OptiFit is an AI-powered fitness platform that provides personalized workout plans,
                                nutrition guidance, progress tracking, and fitness analytics. The Service is provided
                                "as is" and we reserve the right to modify, suspend, or discontinue any aspect of the
                                Service at any time.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">3. User Accounts</h2>
                            <p className="text-muted-foreground">
                                To use certain features of the Service, you must register for an account. You agree to
                                provide accurate, current, and complete information during registration and to update
                                such information to keep it accurate, current, and complete. You are responsible for
                                safeguarding your password and for all activities that occur under your account.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">4. Health Disclaimer</h2>
                            <p className="text-muted-foreground">
                                The fitness and nutrition information provided by OptiFit is for general informational
                                purposes only. It is not intended as medical advice and should not be relied upon as a
                                substitute for professional medical advice, diagnosis, or treatment. Always consult with
                                a qualified healthcare provider before starting any new exercise program or making
                                changes to your diet.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">5. User Conduct</h2>
                            <p className="text-muted-foreground">
                                You agree not to use the Service to: (a) violate any applicable laws or regulations; (b)
                                infringe upon the rights of others; (c) transmit any harmful, threatening, or
                                objectionable content; (d) attempt to gain unauthorized access to the Service or its
                                related systems; (e) interfere with or disrupt the Service or servers.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">6. Intellectual Property</h2>
                            <p className="text-muted-foreground">
                                All content, features, and functionality of the Service, including but not limited to
                                text, graphics, logos, icons, images, audio clips, and software, are the exclusive
                                property of OptiFit or its licensors and are protected by international copyright,
                                trademark, and other intellectual property laws.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">7. Limitation of Liability</h2>
                            <p className="text-muted-foreground">
                                To the fullest extent permitted by law, OptiFit shall not be liable for any indirect,
                                incidental, special, consequential, or punitive damages, or any loss of profits or
                                revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill,
                                or other intangible losses resulting from your use of the Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">8. Modifications to Terms</h2>
                            <p className="text-muted-foreground">
                                We reserve the right to modify these terms at any time. We will notify users of any
                                material changes by posting the new terms on this page and updating the "Last updated"
                                date. Your continued use of the Service after any such changes constitutes your
                                acceptance of the new terms.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="font-display text-xl font-semibold">9. Contact Information</h2>
                            <p className="text-muted-foreground">
                                If you have any questions about these Terms of Service, please contact us at
                                support@optifit.com.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
