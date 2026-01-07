import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Sparkles, ArrowRight} from "lucide-react";
import {cn} from "@/lib/utils";

export default function HeroSection({refEl, visible}) {
    return (
        <section ref={refEl} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-href-b from-accent/30 via-background href-background"/>
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"/>
            <div
                className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"
                style={{animationDelay: "2s"}}
            />

            <div className="container relative mx-auto px-4">
                <div
                    className={cn(
                        "max-w-4xl mx-auto text-center transition-all duration-700",
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4"/>
                        AI-Powered Fitness Revolution
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                        Transform Your Body with <span className="gradient-text">Intelligent Training</span>
                    </h1>

                    <p
                        className={cn(
                            "text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 transition-all duration-700 delay-100",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        OptiFit combines cutting-edge AI with proven fitness science to deliver personalized workout
                        and
                        nutrition plans that evolve with you.
                    </p>

                    <div
                        className={cn(
                            "flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-200",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        <Link href="/register">
                            <Button size="xl" variant="default" className="w-full sm:w-auto">
                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5"/>
                            </Button>
                        </Link>
                        <Link href="/signin">
                            <Button size="xl" variant="outline" className="w-full sm:w-auto">
                                Sign In
                            </Button>
                        </Link>
                    </div>

                    <div
                        className={cn(
                            "grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border transition-all duration-700 delay-300",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        <div>
                            <p className="font-display text-3xl lg:text-4xl font-bold text-primary">50K+</p>
                            <p className="text-sm text-muted-foreground mt-1">Active Users</p>
                        </div>
                        <div>
                            <p className="font-display text-3xl lg:text-4xl font-bold text-primary">1M+</p>
                            <p className="text-sm text-muted-foreground mt-1">Workouts Logged</p>
                        </div>
                        <div>
                            <p className="font-display text-3xl lg:text-4xl font-bold text-primary">98%</p>
                            <p className="text-sm text-muted-foreground mt-1">Satisfaction Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}