"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudyTabsProps {
    activeTab: "mcq" | "short";
    onChange: (tab: "mcq" | "short") => void;
    mcqCount: number;
    shortCount: number;
}

export function StudyTabs({ activeTab, onChange, mcqCount, shortCount }: StudyTabsProps) {
    const tabs = ([
        { id: "mcq", label: "Multiple Choice", count: mcqCount },
        { id: "short", label: "Short Answers", count: shortCount },
    ] as const).filter(tab => tab.count > 0);

    // If only one tab, no need to show the switcher at all
    if (tabs.length <= 1) return null;

    return (
        <div className="flex space-x-1 bg-secondary/50 p-1 rounded-xl backdrop-blur-md border border-white/5 w-fit">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="study-tabs"
                                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {tab.label}
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px]",
                                isActive ? "bg-primary/10 text-primary" : "bg-primary/5 text-muted-foreground"
                            )}>
                                {tab.count}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
