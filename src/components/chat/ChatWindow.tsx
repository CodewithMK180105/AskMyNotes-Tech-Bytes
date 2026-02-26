"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { sendChatMessage } from "@/lib/api";
import { Send, Paperclip, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EvidencePanel } from "./EvidencePanel";
import { PageTransition } from "@/components/shared/PageTransition";
import { cn } from "@/lib/utils";

export function ChatWindow() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}`);

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

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();

        const newUserMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: "user",
            content: userMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            const response = await sendChatMessage(
                userMessage,
                currentSubject.name,
                sessionId
            );

            setIsTyping(false);

            if ("rawOutput" in response) {
                // Freeform text response
                const rawText = response.rawOutput;

                // Check if it's a "not found" response
                const isNotFound = rawText.toLowerCase().includes("not found in your notes");

                const aiMsg: ChatMessage = {
                    id: `msg_ai_${Date.now()}`,
                    role: "assistant",
                    content: isNotFound ? null : rawText,
                    is_not_found: isNotFound,
                    not_found_message: isNotFound ? rawText : undefined,
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            } else {
                // Structured MCQ response — format it as a readable message
                const mcqSummary = response.mcqs
                    ?.map((m, i) => `**Q${i + 1}.** ${m.question}\n   - A) ${m.options.A}\n   - B) ${m.options.B}\n   - C) ${m.options.C}\n   - D) ${m.options.D}\n   - ✅ **Answer: ${m.correctAnswer}**\n   - 💡 ${m.explanation}`)
                    .join("\n\n") || "";

                const saSummary = response.shortAnswerQuestions
                    ?.map((s, i) => `**Short Q${i + 1}.** ${s.question}\n\n**Model Answer:** ${s.modelAnswer}`)
                    .join("\n\n") || "";

                const fullContent = [
                    `## 📝 Study Questions for ${response.subject}\n`,
                    mcqSummary ? `### Multiple Choice Questions\n\n${mcqSummary}` : "",
                    saSummary ? `\n\n### Short Answer Questions\n\n${saSummary}` : "",
                ].filter(Boolean).join("\n");

                // Collect all citations and evidence
                const allCitations = [
                    ...response.mcqs.flatMap(m => m.citations || []),
                    ...response.shortAnswerQuestions.flatMap(s => s.citations || []),
                ];

                const uniqueCitations = allCitations.slice(0, 5).map(c => ({
                    file: c.fileName,
                    page: parseInt(c.section?.match(/\d+/)?.[0] || "0", 10),
                    chunk_id: c.section || "",
                }));

                const evidenceSnippets = allCitations
                    .map(c => c.quote)
                    .filter(Boolean)
                    .slice(0, 5);

                const aiMsg: ChatMessage = {
                    id: `msg_ai_${Date.now()}`,
                    role: "assistant",
                    content: fullContent,
                    confidence: "High",
                    citations: uniqueCitations,
                    evidence: evidenceSnippets,
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            }
        } catch (err) {
            setIsTyping(false);
            const errorMessage = err instanceof Error ? err.message : "Failed to get a response.";

            const errorMsg: ChatMessage = {
                id: `msg_err_${Date.now()}`,
                role: "assistant",
                content: `⚠️ **Error:** ${errorMessage}\n\nPlease try again or check that your notes have been uploaded for this subject.`,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
    };

    const { subjects, activeSubjectId } = useSubjects();
    const currentSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0] || { id: "", name: "No Subject Selected", short_name: "N/A", color: "indigo", files: [], created_at: "" };
    const latestAiMessage = messages.findLast((m) => m.role === "assistant");

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
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            🟢 Live
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 hidden sm:flex border-dashed"
                            onClick={handleNewChat}
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
                                <p className="text-sm mb-4">Ask me anything about {currentSubject.name}.</p>
                                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                    {[
                                        "Generate study questions",
                                        "Quiz me on key concepts",
                                        "Explain the main topics",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInputValue(suggestion);
                                                textareaRef.current?.focus();
                                            }}
                                            className="px-3 py-1.5 text-xs rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary border border-white/5 transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
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
                                disabled={isTyping}
                            />

                            <Button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className={cn(
                                    "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
                                    inputValue.trim() && !isTyping
                                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md hover:shadow-indigo-500/25"
                                        : "bg-secondary text-muted-foreground"
                                )}
                                size="icon"
                            >
                                {isTyping ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto mt-2 text-center">
                        <p className="text-[10px] text-muted-foreground">
                            AI answers are generated from your uploaded notes via n8n + Supabase. Always verify important information.
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
