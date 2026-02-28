"use client";

import { useState } from "react";
import { MCQ } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";


interface MCQCardProps {
    mcq: MCQ;
    number: number;
    onAnswer?: (label: string, isCorrect: boolean) => void;
    isResultView?: boolean;
}

export function MCQCard({ mcq, number, onAnswer, isResultView = false }: MCQCardProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(mcq.user_answer || null);
    const hasAnswered = selectedOption !== null || isResultView;
    const isCorrect = selectedOption === mcq.correct;

    const handleSelect = (label: string) => {
        if (hasAnswered) return;
        setSelectedOption(label);
        if (onAnswer) {
            onAnswer(label, label === mcq.correct);
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

                        let optionStateStyles = "border-border hover:border-indigo-500/50 hover:bg-secondary/50 cursor-pointer";

                        if (hasAnswered) {
                            if (isCorrectOption) {
                                optionStateStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                            } else if (isSelected && !isCorrectOption) {
                                optionStateStyles = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                            } else {
                                optionStateStyles = "border-border opacity-50 cursor-not-allowed";
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
                            <div className="p-4 rounded-xl bg-secondary/50 border border-border relative overflow-hidden">
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    (selectedOption === null) ? "bg-muted-foreground" : (isCorrect ? "bg-emerald-500" : "bg-red-500")
                                )} />

                                <div className="space-y-4 pt-1">
                                    <h4 className="flex items-center gap-2 font-semibold text-sm">
                                        {selectedOption === null ? (
                                            <span className="text-muted-foreground">No Answer Provided</span>
                                        ) : isCorrect ? (
                                            <span className="text-emerald-600 dark:text-emerald-500">Correct!</span>
                                        ) : (
                                            <span className="text-red-600 dark:text-red-500">Incorrect</span>
                                        )}
                                    </h4>


                                    <div className="bg-background/80 rounded-lg p-3 border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Source Evidence
                                            </span>
                                            <ConfidenceBadge level={mcq.confidence} />
                                        </div>
                                        <p className="text-sm italic text-foreground">
                                            &quot;{mcq.evidence}&quot;
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                            Explanation
                                        </span>
                                        <p className="text-sm text-foreground">
                                            {mcq.explanation}
                                        </p>
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
