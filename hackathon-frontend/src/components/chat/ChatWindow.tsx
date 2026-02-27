"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";
import { dummyChatMessages, dummySubjects } from "@/lib/dummy-data";
import { Send, Paperclip, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EvidencePanel } from "./EvidencePanel";
import { PageTransition } from "@/components/shared/PageTransition";
import { cn } from "@/lib/utils";

export function ChatWindow() {
    const [messages, setMessages] = useState<ChatMessage[]>(dummyChatMessages.slice(0, 4));
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Handle textarea auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: "user",
            content: inputValue,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI response based on the "CAP theorem" trigger in dummy data
        setTimeout(() => {
            setIsTyping(false);
            if (newUserMsg.content?.toLowerCase().includes("cap")) {
                setMessages((prev) => [...prev, dummyChatMessages[5]]); // The "not found" message
            } else {
                // Generic fallback demo response
                const newAiMsg: ChatMessage = {
                    id: `msg_ai_${Date.now()}`,
                    role: "assistant",
                    content: "This is a simulated AI response. In a real integration, I would analyze the uploaded notes and provide an answer here with correct citations and confidence scoring.",
                    confidence: "Medium",
                    citations: [{ file: "generic_notes.pdf", page: 1, chunk_id: "fake" }],
                    evidence: ["In a real app, this would be a relevant extract from the notes."],
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, newAiMsg]);
            }
        }, 2000);
    };

    const currentSubject = dummySubjects[0]; // Assuming first subject is active
    const latestAiMessage = messages.findLast(m => m.role === "assistant");

    return (
        <PageTransition className="h-[calc(100vh-4rem)] flex overflow-hidden">
            {/* Main Chat Area */}
            <div className={cn(
                "flex flex-col h-full transition-all duration-300",
                isEvidenceOpen ? "w-[calc(100%-350px)]" : "w-full"
            )}>
                {/* Top Chat Header */}
                <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-md z-10 relative">
                    <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-foreground flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                            {currentSubject.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                            {currentSubject.files.length} Notes
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 hidden sm:flex border-dashed"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            New Chat
                        </Button>
                        <Button
                            variant={isEvidenceOpen ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
                            className="gap-2 h-8"
                            title="Toggle Evidence Panel"
                        >
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                                {isEvidenceOpen ? "Hide Evidence" : "Show Evidence"}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
                    <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-1">How can I help you study?</h3>
                                <p className="text-sm">Ask me anything about {currentSubject.name}.</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))
                        )}

                        {isTyping && (
                            <div className="flex w-full mb-6 justify-start">
                                <div className="max-w-[85%] sm:max-w-[75%] mr-auto">
                                    <TypingIndicator />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-1" />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-border shrink-0 pb-6 lg:pb-4 relative z-20">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 rounded-2xl opacity-20 group-focus-within:opacity-50 blur transition duration-500" />
                        <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                                title="Attach file"
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <Textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={`Ask a question about ${currentSubject.short_name}...`}
                                className="min-h-[40px] max-h-[150px] resize-none border-0 focus-visible:ring-0 p-3 bg-transparent text-sm custom-scrollbar"
                                rows={1}
                            />

                            <Button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={cn(
                                    "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
                                    inputValue.trim()
                                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md hover:shadow-indigo-500/25"
                                        : "bg-secondary text-muted-foreground"
                                )}
                                size="icon"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto mt-2 text-center">
                        <p className="text-[10px] text-muted-foreground">
                            AI answers are generated based solely on uploaded notes. Always verify important information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Evidence Panel (Right Side) */}
            <EvidencePanel
                isOpen={isEvidenceOpen}
                onClose={() => setIsEvidenceOpen(false)}
                latestAiMessage={latestAiMessage}
            />
        </PageTransition>
    );
}
