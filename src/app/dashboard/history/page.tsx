"use client";

import { useState, useEffect } from "react";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { MCQ, ShortAnswer } from "@/lib/types";
import { PageTransition } from "@/components/shared/PageTransition";
import { StudyTabs } from "@/components/study/StudyTabs";
import { MCQCard } from "@/components/study/MCQCard";
import { ShortAnswerCard } from "@/components/study/ShortAnswerCard";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState<"mcq" | "short">("mcq");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [shortAnswers, setShortAnswers] = useState<ShortAnswer[]>([]);

    const { subjects, activeSubjectId } = useSubjects();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const effectiveSubjectId = selectedSubjectId || activeSubjectId || subjects[0]?.id || null;
    const subject = subjects.find((s) => s.id === effectiveSubjectId) || subjects[0] || null;

    useEffect(() => {
        if (effectiveSubjectId) {
            fetchHistory(effectiveSubjectId);
        }
    }, [effectiveSubjectId]);

    const fetchHistory = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/history?subjectId=${id}`);
            const data = await response.json();
            if (data.success) {
                // Map DB types to frontend types if needed
                // The DB returns option_a, option_b etc.
                const mappedMcqs: MCQ[] = (data.mcqs || []).map((m: any) => {
                    let expText = m.explanation;
                    let evidenceText = m.explanation || "No explicit evidence provided.";
                    let userAnswer = undefined;
                    try {
                        const parsed = JSON.parse(m.explanation);
                        expText = parsed.text;
                        evidenceText = parsed.evidence;
                        userAnswer = parsed.user_answer || undefined;
                    } catch (e) {
                        // fallback
                    }

                    return {
                        id: m.id,
                        question: m.question,
                        options: [
                            { label: "A", text: m.option_a },
                            { label: "B", text: m.option_b },
                            { label: "C", text: m.option_c },
                            { label: "D", text: m.option_d },
                        ].filter(o => o.text),
                        correct: m.correct_answer || "A",
                        explanation: expText,
                        confidence: m.confidence || "Medium",
                        citation: {
                            file: m.citation_file || "",
                            page: 1,
                            chunk_id: m.citation_section || ""
                        },
                        evidence: evidenceText,
                        user_answer: userAnswer
                    };
                });

                const mappedSaqs: ShortAnswer[] = (data.shortAnswers || []).map((s: any) => {
                    let ansText = s.model_answer;
                    let evidenceText = s.model_answer?.slice(0, 200) || "No explicit evidence provided.";
                    let userAnswer = undefined;
                    try {
                        const parsed = JSON.parse(s.model_answer);
                        ansText = parsed.text;
                        evidenceText = parsed.evidence;
                        userAnswer = parsed.user_answer || undefined;
                    } catch (e) {
                        // fallback
                    }

                    return {
                        id: s.id,
                        question: s.question,
                        model_answer: ansText,
                        confidence: s.confidence || "Medium",
                        citation: {
                            file: s.citation_file || "",
                            page: 1,
                            chunk_id: s.citation_section || ""
                        },
                        evidence: evidenceText,
                        user_answer: userAnswer
                    };
                });

                setMcqs(mappedMcqs);
                setShortAnswers(mappedSaqs);
            } else {
                setError(data.message || "Failed to load history");
            }
        } catch (err) {
            setError("An error occurred while fetching history");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition className="h-full">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                Your Chats
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm font-medium">{subject?.name || "No subject selected"}</span>
                        </div>
                        <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Saved Chats
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Review questions and answers from your previous study sessions for this subject.
                        </p>
                    </div>

                    {!isLoading && (mcqs.length > 0 || shortAnswers.length > 0) && (
                        <StudyTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            mcqCount={mcqs.length}
                            shortCount={shortAnswers.length}
                        />
                    )}
                </div>


                {/* Content Area */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold">Loading Chats...</h2>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold">Something went wrong</h2>
                        <p className="text-muted-foreground mt-2">{error}</p>
                    </div>
                ) : mcqs.length === 0 && shortAnswers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
                        <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold">No chats found</h2>
                        <p className="text-muted-foreground mt-2">
                            Generate some questions in Study Mode first!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 pb-20">
                        {activeTab === "mcq" ? (
                            <div className="space-y-6">
                                {mcqs.map((mcq, index) => (
                                    <MCQCard
                                        key={mcq.id}
                                        mcq={mcq}
                                        number={index + 1}
                                        onAnswer={() => { }} // Read-only
                                        isResultView={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {shortAnswers.map((sa, index) => (
                                    <ShortAnswerCard
                                        key={sa.id}
                                        sa={sa}
                                        number={index + 1}
                                        isResultView={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
