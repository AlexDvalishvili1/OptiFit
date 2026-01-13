"use client";

import * as React from "react";

export function AuthHero() {
    return (
        <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 gradient-primary"/>
            <div
                className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]"/>
            <div className="relative max-w-md text-center px-10 text-primary-foreground">
                <h2 className="font-display text-4xl font-bold mb-4 text-black">
                    Start Your Transformation <br/> Today
                </h2>
                <p className="text-black/80 text-sm leading-relaxed">
                    Access personalized AI-powered training programs, nutrition plans, and track your progress all in
                    one place.
                </p>
            </div>
        </div>
    );
}