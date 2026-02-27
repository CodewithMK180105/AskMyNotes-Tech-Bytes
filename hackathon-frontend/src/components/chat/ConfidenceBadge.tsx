"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
    level: "High" | "Medium" | "Low";
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
    const config = {
        High: {
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            icon: CheckCircle2,
        },
        Medium: {
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            icon: AlertTriangle,
        },
        Low: {
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            icon: XCircle,
        },
    };

    const { color, bg, border, icon: Icon } = config[level];

    return (
        <Badge
            variant="outline"
            className={cn("gap-1.5 px-2.5 py-0.5 font-medium", color, bg, border)}
        >
            <Icon className="h-3.5 w-3.5" />
            Confidence: {level}
        </Badge>
    );
}
