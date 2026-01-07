"use client";

import Link from "next/link";
import {Dumbbell, TrendingUp, Utensils} from "lucide-react";

export default function QuickActions() {
    const Card = ({
                      href,
                      icon: Icon,
                      title,
                      desc,
                  }: {
        href: string;
        icon: any;
        title: string;
        desc: string;
    }) => (
        <Link
            href={href}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
        >
            <Icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform"/>
            <h3 className="font-display font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </Link>
    );

    return (
        <div className="grid sm:grid-cols-3 gap-4">
            <Card
                href="/training"
                icon={Dumbbell}
                title="AI Training Program"
                desc="View or generate your personalized workout plan"
            />
            <Card
                href="/diet"
                icon={Utensils}
                title="AI Diet Plan"
                desc="Get meal suggestions tailored to your goals"
            />
            <Card
                href="/analytics"
                icon={TrendingUp}
                title="Progress Analytics"
                desc="Track your fitness journey with detailed insights"
            />
        </div>
    );
}