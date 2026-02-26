"use client";

import { ChatMessage } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronRight, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EvidencePanelProps {
    isOpen: boolean;
    onClose: () => void;
    latestAiMessage?: ChatMessage | null;
}

export function EvidencePanel({ isOpen, onClose, latestAiMessage }: EvidencePanelProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 350, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full border-l border-border bg-card flex flex-col shrink-0 overflow-hidden"
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        Evidence & Citations
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {latestAiMessage && latestAiMessage.role === "assistant" && !latestAiMessage.is_not_found ? (
                        <div className="space-y-6">
                            {/* Confidence Section */}
                            {latestAiMessage.confidence && (
                                <section>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Confidence Level
                                    </h4>
                                    <div className="glassmorphism-card p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {latestAiMessage.confidence === "High" ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : latestAiMessage.confidence === "Medium" ? (
                                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                            )}
                                            <span className="font-medium">{latestAiMessage.confidence} Confidence</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${latestAiMessage.confidence === "High" ? "bg-emerald-500 w-[90%]" :
                                                    latestAiMessage.confidence === "Medium" ? "bg-amber-500 w-[60%]" : "bg-red-500 w-[30%]"
                                                    }`}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-3">
                                            {latestAiMessage.confidence === "High"
                                                ? "The model is very confident this answer is correct based purely on your notes."
                                                : "The model found some relevant information but might be missing full context."
                                            }
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* Citations List */}
                            {latestAiMessage.citations && latestAiMessage.citations.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Sources Cited
                                    </h4>
                                    <div className="space-y-2">
                                        {latestAiMessage.citations.map((cit, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary cursor-pointer transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{cit.file}</p>
                                                        <p className="text-[10px] text-muted-foreground">Page {cit.page}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Evidence Snippets */}
                            {latestAiMessage.evidence && latestAiMessage.evidence.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Exact Snippets
                                    </h4>
                                    <div className="space-y-3">
                                        {latestAiMessage.evidence.map((snippet, idx) => {
                                            // Attempt to split the snippet to separate the quote from the citation tag if dashed
                                            const parts = snippet.split("—");
                                            const quote = parts[0].trim();
                                            const cite = parts.length > 1 ? parts[1].trim() : "";

                                            return (
                                                <div key={idx} className="glassmorphism-card p-4 text-sm">
                                                    <p className="italic text-foreground mb-3">&quot;{quote}&quot;</p>
                                                    {cite && (
                                                        <div className="inline-block px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded text-xs font-medium">
                                                            {cite}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Ask a question to see evidence and citations here.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
