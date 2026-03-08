"use client";

import { useState, useRef, useEffect } from "react";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { PageTransition } from "@/components/shared/PageTransition";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string; // fallback or raw text
    parsed?: {
        answer: string;
        confidence?: string;
        evidence?: string;
    };
}

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState("");
    const { subjects, activeSubjectId } = useSubjects();

    const activeSubject = subjects.find(s => s.id === activeSubjectId);
    const hasFiles = activeSubject && activeSubject.files && activeSubject.files.length > 0;
    const isInputDisabled = !hasFiles || isLoading;

    useEffect(() => {
        setSessionId(crypto.randomUUID());
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isInputDisabled) return;

        const userMessage = { id: crypto.randomUUID(), role: "user" as const, content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("https://nikunjn8n.up.railway.app/webhook/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    question: userMessage.content,
                    subject: activeSubject?.name,
                    subjectId: activeSubject?.id,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to get response");
            }

            const textResponse = await res.text();
            let finalContent = textResponse;
            let parsedData: ChatMessage["parsed"] = undefined;

            try {
                // Remove potential markdown blocks n8n might wrap JSON in
                const cleanText = textResponse.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
                const jsonResponse = JSON.parse(cleanText);

                if (typeof jsonResponse === 'object' && jsonResponse !== null) {
                    let ansArray = [];
                    if (Array.isArray(jsonResponse)) {
                        ansArray = jsonResponse;
                    } else if (Array.isArray(jsonResponse.answer)) {
                        ansArray = jsonResponse.answer;
                    } else if (Array.isArray(jsonResponse.output)) {
                        ansArray = jsonResponse.output;
                    } else if (jsonResponse.output && Array.isArray(jsonResponse.output.answer)) {
                        ansArray = jsonResponse.output.answer;
                    }

                    if (ansArray.length > 0 && ansArray[0].answerfromnotes) {
                        const firstAns = ansArray[0];
                        parsedData = {
                            answer: firstAns.answerfromnotes,
                            confidence: firstAns.confidence,
                            evidence: firstAns.citation?.evidence
                        };
                        finalContent = firstAns.answerfromnotes; // fallback content
                    } else if (jsonResponse.output) {
                        finalContent = typeof jsonResponse.output === 'string' ? jsonResponse.output : JSON.stringify(jsonResponse.output, null, 2);
                    } else if (jsonResponse.text) {
                        finalContent = typeof jsonResponse.text === 'string' ? jsonResponse.text : JSON.stringify(jsonResponse.text, null, 2);
                    } else {
                        finalContent = JSON.stringify(jsonResponse, null, 2);
                    }
                }
            } catch (e) {
                // Keep as raw text
                console.warn("Failed to parse AI JSON response", e);
            }

            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: finalContent,
                parsed: parsedData
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { id: crypto.randomUUID(), role: "assistant" as const, content: "Sorry, I couldn't reach the server right now. Please try again later." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col bg-background z-10">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col">
                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-8 px-4 md:px-6 pb-2">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 fade-in zoom-in duration-500">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">
                                {hasFiles ? "How can I help you today?" : "Upload notes to start chatting"}
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {hasFiles
                                    ? "Type your question below. I can help clarify concepts, summarize topics, or test your knowledge."
                                    : "You need to add a subject and upload at least one PDF file before you can ask questions."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex gap-4 p-4 md:p-6 rounded-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2",
                                        message.role === "assistant"
                                            ? "bg-secondary/30 flex-row"
                                            : "bg-background flex-row-reverse"
                                    )}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                        message.role === "assistant"
                                            ? "bg-primary/20 text-primary border border-primary/20"
                                            : "bg-indigo-500 text-white font-bold"
                                    )}>
                                        {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div className={cn(
                                        "flex-1 space-y-2 overflow-hidden min-w-0",
                                        message.role === "user" && "text-right"
                                    )}>
                                        <p className={cn(
                                            "text-sm font-semibold text-foreground/80 flex items-center gap-2",
                                            message.role === "user" && "justify-end"
                                        )}>
                                            {message.role === "assistant" ? "Notes AI" : "You"}
                                            {message.role === "assistant" && message.parsed?.confidence && (
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
                                                    message.parsed.confidence.toLowerCase().includes("high") ? "bg-emerald-500/10 text-emerald-500" :
                                                        message.parsed.confidence.toLowerCase().includes("medium") ? "bg-amber-500/10 text-amber-500" :
                                                            "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {message.parsed.confidence} Confidence
                                                </span>
                                            )}
                                        </p>
                                        <div className="text-[15px] leading-7 whitespace-pre-wrap text-foreground/90 break-words prose dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none">
                                            {message.parsed ? message.parsed.answer : message.content}
                                        </div>
                                        {message.role === "assistant" && message.parsed?.evidence && (
                                            <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50 text-sm">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Support Evidence
                                                </p>
                                                <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary/30 pl-3">
                                                    "{message.parsed.evidence}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4 p-4 md:p-6 rounded-2xl w-full mx-auto bg-secondary/30 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-semibold text-foreground/80">Notes AI</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="flex gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none w-full p-4 pb-6 md:p-6 md:pb-8 bg-gradient-to-t from-background via-background to-transparent relative">
                <div className="max-w-4xl mx-auto w-full relative">
                    <form
                        onSubmit={handleSubmit}
                        className="relative flex bg-background p-1 rounded-2xl border border-border shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] focus-within:ring-1 focus-within:ring-primary/50 transition-all"
                    >
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={hasFiles ? "Message Notes AI..." : "Upload files to start chatting..."}
                            disabled={isInputDisabled} className="min-h-[56px] max-h-48 resize-none border-0 shadow-none focus-visible:ring-0 pl-4 py-4 pr-16 w-full bg-transparent scrollbar-hide text-base disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                            rows={1}
                        />
                        <div className="absolute right-2 bottom-2 max-h-full flex items-end">
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isInputDisabled}
                                className={cn(
                                    "shrink-0 rounded-xl h-10 w-10 transition-all",
                                    input.trim() && !isInputDisabled
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                        : "bg-secondary text-muted-foreground disabled:opacity-50"
                                )}
                            >
                                <Send className="h-4 w-4 ml-0.5" />
                            </Button>
                        </div>
                    </form>
                    <p className="text-[11px] text-center text-muted-foreground mt-3">
                        AI can make mistakes. We're making this better every day.
                    </p>
                </div>
            </div>
        </div>
    );
}
