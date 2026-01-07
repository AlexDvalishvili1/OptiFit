import Link from "next/link";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {CheckCircle2, Target, Zap} from "lucide-react";

export default function HowItWorksSection({refEl, visible, benefits}) {
    return (
        <section ref={refEl} id="how-it-works" className="py-20 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div
                        className={cn("transition-all duration-700", visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8")}>
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
                            className={cn("mt-10 transition-all duration-700 delay-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                            <Link href="/register">
                                <Button size="lg" variant="default">
                                    Get Started Now <Zap className="ml-2 h-5 w-5"/>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div
                        className={cn("relative transition-all duration-700 delay-200", visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95")}>
                        <div className="aspect-square rounded-3xl gradient-primary p-1">
                            <div className="h-full w-full rounded-3xl bg-card flex items-center justify-center">
                                <div className="text-center p-8">
                                    <Target className="h-20 w-20 text-primary mx-auto mb-6"/>
                                    <h3 className="font-display text-2xl font-bold mb-2">Goal-Oriented</h3>
                                    <p className="text-muted-foreground">
                                        Every plan is built around your unique fitness goals
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-accent animate-float"/>
                        <div
                            className="absolute -bottom-6 -left-6 w-16 h-16 rounded-xl gradient-primary opacity-50 animate-float"
                            style={{animationDelay: "1s"}}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}