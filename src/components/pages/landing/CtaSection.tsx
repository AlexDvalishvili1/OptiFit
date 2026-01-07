import Link from "next/link";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {ArrowRight} from "lucide-react";

export default function CtaSection({refEl, visible}) {
    return (
        <section ref={refEl} className="py-20 lg:py-32">
            <div className="container mx-auto px-4">
                <div
                    className={cn("relative rounded-3xl overflow-hidden transition-all duration-700", visible ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
                    <div className="absolute inset-0 gradient-primary opacity-90"/>
                    <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24 text-center">
                        <h2 className={cn("font-display text-3xl lg:text-5xl font-bold text-primary-foreground mb-6 transition-all duration-700 delay-100", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                            Ready to Transform?
                        </h2>
                        <p className={cn("text-primary-foreground/90 text-lg max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                            Join thousands of fitness enthusiasts who have already revolutionized their training with
                            OptiFit.
                        </p>

                        <div
                            className={cn("transition-all duration-700 delay-300", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                            <Link href="/register">
                                <Button size="xl" variant="hero"
                                        className="bg-background text-primary hover:bg-background/90">
                                    Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5"/>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}