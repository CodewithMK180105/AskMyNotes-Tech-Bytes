"use client";

import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
    level?: "High" | "Medium" | "Low" | string;
    className?: string;
}

export function ConfidenceBadge({ level = "Medium", className }: ConfidenceBadgeProps) {
    const isHigh = level === "High";
    const isMedium = level === "Medium";

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                isHigh ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                    isMedium ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border border-red-500/20",
                className
            )}
        >
            {isHigh ? <ShieldCheck className="h-3 w-3" /> :
                isMedium ? <Shield className="h-3 w-3" /> :
                    <ShieldAlert className="h-3 w-3" />}
            {level} Confidence
        </div>
    );
}
