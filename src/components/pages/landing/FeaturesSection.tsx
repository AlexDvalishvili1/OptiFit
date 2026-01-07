import {cn} from "@/lib/utils";

export default function FeaturesSection({refEl, visible, features}) {
    return (
        <section ref={refEl} id="features" className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4">
                <div
                    className={cn(
                        "text-center max-w-2xl mx-auto mb-16 transition-all duration-700",
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                >
                    <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                        Everything You Need to Succeed
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Comprehensive tools designed to optimize every aspect of your fitness journey.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={cn(
                                "group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-card-hover transition-all duration-500",
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            )}
                            style={{transitionDelay: visible ? `${index * 100}ms` : "0ms"}}
                        >
                            <div
                                className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="h-6 w-6 text-primary-foreground"/>
                            </div>
                            <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}