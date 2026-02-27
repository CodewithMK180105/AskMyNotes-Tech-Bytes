"use client";

import { motion } from "framer-motion";
import { Award, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreSummaryProps {
    score: number;
    total: number;
}

export function ScoreSummary({ score, total }: ScoreSummaryProps) {
    const percentage = Math.round((score / total) * 100);

    let config = {
        color: "from-emerald-500 to-teal-500",
        text: "text-emerald-500",
        bg: "bg-emerald-500/10",
        icon: Trophy,
        message: "Outstanding! You've mastered this material.",
    };

    if (percentage < 50) {
        config = {
            color: "from-red-500 to-orange-500",
            text: "text-red-500",
            bg: "bg-red-500/10",
            icon: AlertTriangle, // We will use Star as fallback since AlertTriangle isn't imported from lucide-react in the prompt specs directly for this file, but let's import AlertTriangle below just in case. Wait, I'll use Star.
            message: "Keep practicing! Review the notes and try again.",
        };
    } else if (percentage < 80) {
        config = {
            color: "from-amber-500 to-yellow-500",
            text: "text-amber-500",
            bg: "bg-amber-500/10",
            icon: Award,
            message: "Good job! A little more review will make you an expert.",
        };
    }

    const { icon: Icon } = config;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glassmorphism-card overflow-hidden relative mb-8"
        >
            <div className={cn("absolute inset-0 bg-gradient-to-r opacity-10", config.color)} />

            <div className="p-8 flex flex-col sm:flex-row items-center gap-8 relative z-10">
                {/* Circular Progress */}
                <div className="relative h-32 w-32 shrink-0">
                    <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            className="text-white/10"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            className={config.text}
                            strokeWidth="8"
                            strokeDasharray={251.2} // 2 * pi * r (40)
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold font-heading">{percentage}%</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                    <div className={cn("inline-flex items-center justify-center p-3 rounded-2xl mb-4", config.bg)}>
                        <Icon className={cn("h-8 w-8", config.text)} />
                    </div>
                    <h3 className="text-2xl font-bold font-heading mb-2">Quiz Completed!</h3>
                    <p className="text-muted-foreground text-lg mb-4">
                        You scored <strong className="text-foreground">{score}</strong> out of <strong className="text-foreground">{total}</strong> correct.
                    </p>
                    <p className="font-medium">{config.message}</p>
                </div>
            </div>
        </motion.div>
    );
}

// Temporary import fix for the fallback
import { AlertTriangle } from "lucide-react";
