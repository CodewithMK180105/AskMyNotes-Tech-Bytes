"use client";

import { useState } from "react";
import { ShortAnswer } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { cn } from "@/lib/utils";

interface ShortAnswerCardProps {
    sa: ShortAnswer;
    number: number;
    isResultView?: boolean;
    onAnswer?: (text: string) => void;
}

export function ShortAnswerCard({ sa, number, isResultView = false, onAnswer }: ShortAnswerCardProps) {
    const [answer, setAnswer] = useState(sa.user_answer || "");
    const [showModelAnswer, setShowModelAnswer] = useState(false);

    const isDetailVisible = isResultView || showModelAnswer;

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
                        {sa.question}
                    </h3>
                </div>

                <div className="space-y-4">
                    {!isResultView ? (
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                            <Textarea
                                placeholder="Type your answer here to practice..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onBlur={() => onAnswer && onAnswer(answer)}
                                className="relative min-h-[100px] resize-none bg-background/50 border-border rounded-xl focus-visible:ring-indigo-500 custom-scrollbar"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                Your Answer
                            </span>
                            <div className={cn(
                                "p-4 rounded-xl border bg-secondary/30 text-foreground text-sm min-h-[60px] whitespace-pre-wrap leading-relaxed",
                                !answer && "italic text-muted-foreground"
                            )}>
                                {answer || "No answer provided for this question."}
                            </div>
                        </div>
                    )}

                    {!isResultView && (
                        <div className="flex justify-end">
                            <Button
                                onClick={() => setShowModelAnswer(!showModelAnswer)}
                                variant="secondary"
                                className={cn(
                                    "gap-2 transition-all",
                                    showModelAnswer && "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 hover:text-indigo-600"
                                )}
                            >
                                <Sparkles className="h-4 w-4" />
                                {showModelAnswer ? "Hide Model Answer" : "Show Model Answer"}
                            </Button>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isDetailVisible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-6"
                        >
                            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/20 dark:border-indigo-500/30 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-l-xl" />

                                <div className="space-y-4 pt-1">
                                    <h4 className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
                                        <Sparkles className="h-4 w-4" />
                                        Evaluation Details
                                    </h4>

                                    <div className="bg-background/80 rounded-lg p-3 border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Source Evidence
                                            </span>
                                            <ConfidenceBadge level={sa.confidence} />
                                        </div>
                                        <p className="text-sm italic text-foreground">
                                            &quot;{sa.evidence}&quot;
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-indigo-500/10 dark:border-indigo-500/20">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                            Model Answer
                                        </span>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                                            {sa.model_answer}
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
