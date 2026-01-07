// src/components/pages/landing/HowItWorksSection.tsx

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {CheckCircle2, Target, Zap} from "lucide-react";

export default function HowItWorksSection({refEl, visible, benefits}) {
    return (
        <section
            ref={refEl}
            id="how-it-works"
            className="py-20 lg:py-32 scroll-mt-[88px]"
        >
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div
                        className={cn(
                            "transition-all duration-700",
                            visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                        )}
                    >
                        <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
                            Your Fitness Journey, <span className="gradient-text">Simplified</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            OptiFit takes the guesswork out of training and nutrition. Our AI analyzes your goals,
                            preferences, and progress to create the perfect plan for you.
                        </p>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={benefit}
                                    className={cn(
                                        "flex items-center gap-3 transition-all duration-500",
                                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                    )}
                                    style={{transitionDelay: visible ? `${200 + index * 100}ms` : "0ms"}}
                                >
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0"/>
                                    <span className="text-foreground">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div
                            className={cn(
                                "mt-10 transition-all duration-700 delay-500",
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            )}
                        >
                            <Link href="/register">
                                <Button size="lg" variant="default">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* остальная часть компонента без изменений */}
                    {/* ... */}
                </div>
            </div>
        </section>
    );
}