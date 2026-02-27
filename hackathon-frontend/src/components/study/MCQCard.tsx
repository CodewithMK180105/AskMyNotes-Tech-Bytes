"use client";

import { useState } from "react";
import { MCQ } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitationBadge } from "@/components/chat/CitationBadge";
import { ConfidenceBadge } from "@/components/chat/ConfidenceBadge";

interface MCQCardProps {
    mcq: MCQ;
    number: number;
    onAnswer?: (isCorrect: boolean) => void;
}

export function MCQCard({ mcq, number, onAnswer }: MCQCardProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const hasAnswered = selectedOption !== null;
    const isCorrect = selectedOption === mcq.correct;

    const handleSelect = (label: string) => {
        if (hasAnswered) return;
        setSelectedOption(label);
        if (onAnswer) {
            onAnswer(label === mcq.correct);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glassmorphism-card overflow-hidden"
        >
            <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md mt-0.5">
                        {number}
                    </div>
                    <h3 className="text-lg font-medium text-foreground leading-snug pt-0.5">
                        {mcq.question}
                    </h3>
                </div>

                <div className="space-y-3">
                    {mcq.options.map((option) => {
                        const isSelected = selectedOption === option.label;
                        const isCorrectOption = option.label === mcq.correct;

                        let optionStateStyles = "border-white/10 hover:border-indigo-500/50 hover:bg-secondary/50 cursor-pointer";

                        if (hasAnswered) {
                            if (isCorrectOption) {
                                optionStateStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                            } else if (isSelected && !isCorrectOption) {
                                optionStateStyles = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                            } else {
                                optionStateStyles = "border-white/5 opacity-50 cursor-not-allowed";
                            }
                        }

                        return (
                            <button
                                key={option.label}
                                onClick={() => handleSelect(option.label)}
                                disabled={hasAnswered}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                                    optionStateStyles
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "flex items-center justify-center h-6 w-6 rounded-md text-xs font-semibold shrink-0 transition-colors",
                                        hasAnswered && isCorrectOption ? "bg-emerald-500 text-white" :
                                            hasAnswered && isSelected && !isCorrectOption ? "bg-red-500 text-white" :
                                                "bg-secondary text-muted-foreground group-hover:bg-indigo-500 group-hover:text-white"
                                    )}>
                                        {option.label}
                                    </span>
                                    <span className="text-sm font-medium">{option.text}</span>
                                </div>

                                {hasAnswered && isCorrectOption && (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                )}
                                {hasAnswered && isSelected && !isCorrectOption && (
                                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {hasAnswered && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-6"
                        >
                            <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 relative overflow-hidden">
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    isCorrect ? "bg-emerald-500" : "bg-red-500"
                                )} />

                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 font-semibold">
                                        <span className={isCorrect ? "text-emerald-500" : "text-red-500"}>
                                            {isCorrect ? "Correct!" : "Incorrect"}
                                        </span>
                                    </h4>

                                    <p className="text-sm text-muted-foreground">
                                        {mcq.explanation}
                                    </p>

                                    <div className="bg-background/40 rounded-lg p-3 border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Source Evidence
                                            </span>
                                            <ConfidenceBadge level={mcq.confidence} />
                                        </div>
                                        <p className="text-sm italic text-foreground mb-3">
                                            &quot;{mcq.evidence}&quot;
                                        </p>
                                        <div className="flex justify-end">
                                            <CitationBadge filename={mcq.citation.file} page={mcq.citation.page} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
