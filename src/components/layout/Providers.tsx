"use client";

import * as React from "react";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "@/components/AuthProvider.tsx";
import {AdvancedCover} from "@/components/AdvancedCover.tsx";

export default function Providers({children}: { children: React.ReactNode }) {
    // create once per browser session
    const [queryClient] = React.useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AuthProvider>
                    <AdvancedCover>
                        {children}
                    </AdvancedCover>
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
