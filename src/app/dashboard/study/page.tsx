"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { MCQ, ShortAnswer } from "@/lib/types";
import { generateQuestions } from "@/lib/api";
import { transformWorkflowResponse } from "@/lib/transform";
import { PageTransition } from "@/components/shared/PageTransition";
import { StudyTabs } from "@/components/study/StudyTabs";
import { MCQCard } from "@/components/study/MCQCard";
import { ShortAnswerCard } from "@/components/study/ShortAnswerCard";
import { ScoreSummary } from "@/components/study/ScoreSummary";
import { GradientButton } from "@/components/shared/GradientButton";
import { RefreshCcw, PlayCircle, Download, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function StudyPage() {
    const [activeTab, setActiveTab] = useState<"mcq" | "short">("mcq");
    const [isStarted, setIsStarted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [answersCount, setAnswersCount] = useState(0);

    // Live data from the n8n workflow
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [shortAnswers, setShortAnswers] = useState<ShortAnswer[]>([]);
    const [responseSubject, setResponseSubject] = useState<string>("");

    // Subject selection driven by context
    const { subjects, activeSubjectId } = useSubjects();
    const { user } = useAuth();

    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const effectiveSubjectId = selectedSubjectId || activeSubjectId || subjects[0]?.id || null;
    const subject = subjects.find((s) => s.id === effectiveSubjectId) || subjects[0] || null;

    const handleStart = useCallback(async (mode: "mcq" | "short" = "mcq") => {
        if (!subject) return;
        setActiveTab(mode);
        setIsStarted(true);
        setIsSubmitted(false);
        setScore(0);
        setAnswersCount(0);
        setError(null);
        setMcqs([]);
        setShortAnswers([]);
        setIsLoading(true);
        setLoadingMessage("Connecting to AI Brain and analyzing your notes...");

        try {
            // Artificial delay to ensure n8n has time to process and for better UX as requested (min 10s)
            const minWait = new Promise((resolve) => setTimeout(resolve, 10000));

            const [response] = await Promise.all([
                generateQuestions(
                    subject.name,
                    mode,
                    user?.id || undefined,
                    subject.id // Supabase subject UUID → saves MCQs/SAQs to DB
                ),
                minWait
            ]);

            const transformed = transformWorkflowResponse(response);

            setMcqs(transformed.mcqs);
            setShortAnswers(transformed.shortAnswers);
            setResponseSubject(transformed.subject);
            setIsLoading(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to generate questions. Please try again.";
            setError(message);
            setIsLoading(false);
        }
    }, [subject, user]);


    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await fetch("/api/save-answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mcqs: mcqs.map(m => ({ id: m.id, user_answer: m.user_answer, explanation: m.explanation, evidence: m.evidence })),
                    shortAnswers: shortAnswers.map(s => ({ id: s.id, user_answer: s.user_answer, model_answer: s.model_answer, evidence: s.evidence }))
                })
            });
        } catch (e) {
            console.error("Failed to save answers", e);
        } finally {
            setIsSaving(false);
            setIsSubmitted(true);
        }
    };

    const handleRestart = () => {
        setIsStarted(false);
        setIsSubmitted(false);
        setScore(0);
        setAnswersCount(0);
        setMcqs([]);
        setShortAnswers([]);
        setError(null);
    };

    const handleDownload = () => {
        setIsDownloading(true);
        // Using native print since html2canvas doesn't support the raw Tailwind CSS oklab colors yet.
        // The print layout is handled properly by @media print in globals.css
        setTimeout(() => {
            document.title = `${subject?.name || "Study_Results"}`;
            window.print();
            document.title = "AskMyNotes";
            setIsDownloading(false);
        }, 100);
    };

    const handleAnswer = (questionId: string, label: string, isCorrect: boolean) => {
        setMcqs(prev => prev.map(m => m.id === questionId ? { ...m, user_answer: label } : m));
        if (isCorrect) setScore((prev) => prev + 1);
        setAnswersCount((prev) => prev + 1);
    };

    const handleAnswerSAQ = (questionId: string, text: string) => {
        setShortAnswers(prev => prev.map(s => s.id === questionId ? { ...s, user_answer: text } : s));
    };

    const isComplete = activeTab === "mcq"
        ? mcqs.length > 0 && answersCount === mcqs.length
        : shortAnswers.length > 0;

    return (
        <PageTransition className="h-full">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center text-center py-40 px-4 min-h-[70vh]">
                    <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 relative">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-20 animate-pulse" />
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
                    >
                        Generating Questions...
                    </motion.h2>
                    <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
                        {loadingMessage}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-indigo-400/80 bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">Searching notes</span>
                        <span className="text-white/20">→</span>
                        <span className="font-medium">AI Analysis</span>
                        <span className="text-white/20">→</span>
                        <span className="font-medium">Building Session</span>
                    </div>
                </div>
            ) : error ? (
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card my-10">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Something went wrong</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        {error}
                    </p>
                    <div className="flex gap-3">
                        <GradientButton
                            onClick={handleRestart}
                            className="bg-transparent border border-white/20 hover:bg-white/5 shadow-none"
                        >
                            Go Back
                        </GradientButton>
                        <GradientButton onClick={() => handleStart(activeTab)} className="px-8">
                            Try Again
                        </GradientButton>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Section - Only show when not started or after results are in */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5 print:hidden">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-wider">
                                <span className="bg-indigo-500/10 px-2 py-1 rounded">Study Mode</span>
                                <span className="text-white/20">•</span>
                                <span className="text-white/60">History</span>
                            </div>
                            <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">
                                {isStarted ? "Study Session" : "Practice & Review"}
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                                {isStarted
                                    ? `Reviewing generated ${activeTab === "mcq" ? "MCQs" : "answers"} for "${subject?.name || "Subject"}".`
                                    : "Test your knowledge with AI-generated questions based on your uploaded notes for this subject."
                                }
                            </p>
                        </div>
                    </div>

                    {isStarted && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism-card p-4 rounded-2xl print:hidden">
                            <StudyTabs activeTab={activeTab} onChange={setActiveTab} mcqCount={mcqs.length} shortCount={shortAnswers.length} />

                            <div className="flex items-center gap-3">
                                {isSubmitted && (
                                    <GradientButton
                                        onClick={handleDownload}
                                        isLoading={isDownloading}
                                        disabled={isDownloading}
                                        className="h-10 px-4 text-sm"
                                        leftIcon={<Download className="h-4 w-4" />}
                                    >
                                        Export PDF
                                    </GradientButton>
                                )}
                                <GradientButton
                                    onClick={handleRestart}
                                    className="h-10 px-4 text-sm bg-white/5 border-white/10 hover:bg-white/10 shadow-none"
                                    leftIcon={<RefreshCcw className="h-4 w-4" />}
                                >
                                    New Session
                                </GradientButton>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    {!isStarted ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {/* 5 MCQ's Card */}
                            <button
                                onClick={() => handleStart("mcq")}
                                disabled={!subject}
                                className="group relative flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-white/10 bg-card/50 hover:bg-card hover:border-indigo-500/50 transition-all duration-300 shadow-xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="h-12 w-12 text-indigo-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">5 MCQ&apos;s</h2>
                                <p className="text-muted-foreground text-base max-w-[240px] leading-relaxed">
                                    Generate a set of 5 multiple choice questions from your notes.
                                </p>
                            </button>

                            {/* Query Card */}
                            <button
                                onClick={() => handleStart("short")}
                                disabled={!subject}
                                className="group relative flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-white/10 bg-card/50 hover:bg-card hover:border-violet-500/50 transition-all duration-300 shadow-xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-24 w-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-12 w-12 text-violet-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Query</h2>
                                <p className="text-muted-foreground text-base max-w-[240px] leading-relaxed">
                                    Analyze your notes and provide a short-answer summary.
                                </p>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-20">
                            {activeTab === "mcq" && isComplete && (
                                <ScoreSummary score={score} total={mcqs.length} />
                            )}

                            <div id="results-print-area" className={cn("pb-8", isSubmitted && "bg-card/50 p-8 rounded-2xl border border-white/5")}>
                                {isSubmitted && (
                                    <div className="text-center pb-8 mb-8 border-b border-white/10">
                                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                                            Study Results: {responseSubject || subject?.name}
                                        </h2>
                                        <p className="text-muted-foreground mt-2">Comprehensive review of your session.</p>
                                    </div>
                                )}

                                {/* MCQs Section */}
                                {mcqs.length > 0 && (
                                    <div className={cn(!isSubmitted && activeTab !== "mcq" && "hidden")}>
                                        {isSubmitted && (
                                            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                                                Multiple Choice Section
                                            </h3>
                                        )}
                                        <div className="space-y-6">
                                            {mcqs.map((mcq, index) => (
                                                <MCQCard
                                                    key={mcq.id}
                                                    mcq={mcq}
                                                    number={index + 1}
                                                    onAnswer={(label, isCorrect) => handleAnswer(mcq.id, label, isCorrect)}
                                                    isResultView={isSubmitted}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Short Answers Section */}
                                {shortAnswers.length > 0 && (
                                    <div className={cn(!isSubmitted && activeTab !== "short" && "hidden", isSubmitted && "mt-12")}>
                                        {isSubmitted && (
                                            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground">
                                                Short Answer Section
                                            </h3>
                                        )}
                                        <div className="space-y-6">
                                            {shortAnswers.map((sa, index) => (
                                                <ShortAnswerCard
                                                    key={sa.id}
                                                    sa={sa}
                                                    number={index + 1}
                                                    isResultView={isSubmitted}
                                                    onAnswer={(text) => handleAnswerSAQ(sa.id, text)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isSubmitted ? (
                                <div className="flex justify-center gap-4 pt-8 border-t border-border print:hidden">
                                    <GradientButton
                                        onClick={handleRestart}
                                        leftIcon={<RefreshCcw className="h-4 w-4" />}
                                        className="bg-transparent border border-white/20 hover:bg-white/5 shadow-none"
                                    >
                                        New Session
                                    </GradientButton>
                                    <GradientButton
                                        onClick={handleDownload}
                                        isLoading={isDownloading}
                                        disabled={isDownloading}
                                        leftIcon={<Download className="h-4 w-4" />}
                                    >
                                        {isDownloading ? "Generating PDF..." : "Download Results as PDF"}
                                    </GradientButton>
                                </div>
                            ) : (
                                <div className="flex justify-center gap-4 pt-8 border-t border-border print:hidden">
                                    <GradientButton
                                        onClick={handleRestart}
                                        leftIcon={<RefreshCcw className="h-4 w-4" />}
                                        className="bg-transparent border border-white/20 hover:bg-white/5 shadow-none"
                                    >
                                        Back
                                    </GradientButton>
                                    <GradientButton
                                        onClick={handleSubmit}
                                        disabled={!isComplete || isSaving}
                                        isLoading={isSaving}
                                    >
                                        {isSaving ? "Saving..." : "Submit Answers"}
                                    </GradientButton>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </PageTransition>
    );
}
