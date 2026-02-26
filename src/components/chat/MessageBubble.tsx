"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ThumbsUp, ThumbsDown, ChevronDown, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { CitationBadge } from "./CitationBadge";
import { NotFoundAlert } from "./NotFoundAlert";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const isUser = message.role === "user";
    const { user } = useAuth();
    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    const userInitials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    if (message.is_not_found) {
        return (
            <div className="flex w-full mb-6">
                <NotFoundAlert message={message.not_found_message!} />
            </div>
        );
    }

    const handleCopy = () => {
        if (message.content) {
            navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
                "flex w-full mb-6",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[85%] sm:max-w-[75%]",
                    isUser ? "ml-auto" : "mr-auto"
                )}
            >
                <div className="flex items-end gap-2 mb-1">
                    {!isUser && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md mb-1 shrink-0">
                            <span className="text-white font-bold text-xs">AI</span>
                        </div>
                    )}

                    <div
                        className={cn(
                            "px-5 mx-0 py-3.5",
                            isUser
                                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-br-sm shadow-md"
                                : "glassmorphism-card text-foreground rounded-2xl rounded-bl-sm"
                        )}
                    >
                        {/* Answer Content */}
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </div>

                        {/* AI Metadata (Confidence, Citations) */}
                        {!isUser && (
                            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {message.confidence && (
                                            <ConfidenceBadge level={message.confidence} />
                                        )}

                                        {message.citations && message.citations.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 ml-1">
                                                {message.citations.map((cit, idx) => (
                                                    <span key={idx} title={`Go to ${cit.file} page ${cit.page}`}>
                                                        <CitationBadge filename={cit.file} page={cit.page} />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={handleCopy}
                                            title="Copy answer"
                                        >
                                            {isCopied ? (
                                                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-emerald-500/10 hover:text-emerald-500"
                                        >
                                            <ThumbsUp className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-red-500/10 hover:text-red-500"
                                        >
                                            <ThumbsDown className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Evidence Snippets Accordion */}
                                {message.evidence && message.evidence.length > 0 && (
                                    <div className="mt-1">
                                        <button
                                            onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                                        >
                                            <ChevronDown
                                                className={cn(
                                                    "h-3.5 w-3.5 transition-transform duration-200",
                                                    isEvidenceOpen && "rotate-180"
                                                )}
                                            />
                                            {isEvidenceOpen ? "Hide Evidence" : "View Evidence Snippets"}
                                        </button>

                                        <AnimatePresence>
                                            {isEvidenceOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-3 space-y-2">
                                                        {message.evidence.map((snippet, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="text-xs p-3 rounded-xl bg-background/50 border border-border text-muted-foreground relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-500 before:rounded-r-md"
                                                            >
                                                                {snippet}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isUser && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center mb-1 shrink-0 text-white">
                            <span className="text-xs font-bold">{userInitials}</span>
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        "text-[10px] text-muted-foreground mt-1 px-10",
                        isUser ? "text-right" : "text-left"
                    )}
                >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </motion.div>
    );
}
