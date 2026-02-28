"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

export default function StudyPage() {
    const [activeTab, setActiveTab] = useState<"mcq" | "short">("mcq");
    const [isStarted, setIsStarted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
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
        setLoadingStep(0);

        // Artificial delay for UX and to show sequential steps clearly
        const stepInterval = setInterval(() => {
            setLoadingStep(prev => prev < 2 ? prev + 1 : prev);
        }, 1200);

        try {
            const minWait = new Promise((resolve) => setTimeout(resolve, 3600));

            const [response] = await Promise.all([
                generateQuestions(
                    subject.name,
                    mode,
                    user?.id || undefined,
                    subject.id
                ),
                minWait
            ]);

            const transformed = transformWorkflowResponse(response);

            setMcqs(transformed.mcqs);
            setShortAnswers(transformed.shortAnswers);
            setResponseSubject(transformed.subject);
            setIsLoading(false);
            clearInterval(stepInterval);
        } catch (err) {
            clearInterval(stepInterval);
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

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const element = document.getElementById("results-print-area");
            if (!element) return;
            const imgData = await htmlToImage.toPng(element, {
                pixelRatio: 2,
                backgroundColor: document.documentElement.className.includes('dark') ? '#020817' : '#ffffff'
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate the total physical height of the image in the PDF
            const imgHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            let heightLeft = imgHeight;
            let position = 0; // vertical offset

            // Add the first page
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            // Loop to add subsequent pages if the content overflows
            while (heightLeft > 0.5) { // Using a small margin of error (0.5mm)
                pdf.addPage();
                position -= pageHeight;
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${subject?.name || "AskMyNotes"}_Study_Results.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF snapshot:", error);
        } finally {
            setIsDownloading(false);
        }
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
                    <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8 relative p-1 overflow-hidden group shadow-2xl">
                        <motion.img
                            src="/icon.svg"
                            alt="Loading"
                            className="h-16 w-16 relative z-10"
                            animate={{
                                scale: [1, 1.1, 1],
                                y: [0, -4, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-20 animate-pulse" />
                    </div>

                    <div className="h-40 flex flex-col items-center justify-start overflow-hidden w-full max-w-lg mb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={loadingStep}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="flex flex-col items-center"
                            >
                                <h2 className="text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70 tracking-tight">
                                    {loadingStep === 0 ? "Analyzing Notes..." :
                                        loadingStep === 1 ? "Extracting Knowledge..." :
                                            "Creating Your Session..."}
                                </h2>
                                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                                    {loadingStep === 0 ? "Our AI is reading through your documents to find key concepts." :
                                        loadingStep === 1 ? "Identifying important patterns and generating the best questions for you." :
                                            "Finalizing your personalized practice set. Almost ready!"}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-foreground bg-secondary/30 px-6 py-3 rounded-full border border-border/50 backdrop-blur-sm shadow-inner group">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-2 w-2 rounded-full transition-all duration-500",
                                loadingStep >= 0 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-muted-foreground/30"
                            )} />
                            <span className={cn("transition-colors duration-500", loadingStep >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/50")}>Discovery</span>
                        </div>
                        <span className="text-muted-foreground/20">/</span>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-2 w-2 rounded-full transition-all duration-500",
                                loadingStep >= 1 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-muted-foreground/30"
                            )} />
                            <span className={cn("transition-colors duration-500", loadingStep >= 1 ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/50")}>Synthesis</span>
                        </div>
                        <span className="text-muted-foreground/20">/</span>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-2 w-2 rounded-full transition-all duration-500",
                                loadingStep >= 2 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-muted-foreground/30"
                            )} />
                            <span className={cn("transition-colors duration-500", loadingStep >= 2 ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/50")}>Ready</span>
                        </div>
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
                            className="bg-secondary/50 border border-border hover:bg-secondary text-foreground shadow-none"
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
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border print:hidden">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                <span className="bg-indigo-500/10 px-2 py-1 rounded">Study Mode</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="text-muted-foreground">History</span>
                            </div>
                            <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">
                                {isStarted ? "Study Session" : "Practice & Review"}
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                                {isStarted
                                    ? `Reviewing Generated ${activeTab === "mcq" ? "MCQs" : "answers"} for ${subject?.name || "Subject"}.`
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
                                    className="h-10 px-4 text-sm bg-secondary/50 border border-border hover:bg-secondary text-foreground shadow-none"
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
                                onClick={() => {
                                    console.log("Starting MCQ session for:", subject?.name);
                                    handleStart("mcq");
                                }}
                                disabled={!subject}
                                className={cn(
                                    "group relative flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-border bg-card/50 hover:bg-card hover:border-indigo-500/50 transition-all duration-300 shadow-xl overflow-hidden",
                                    !subject && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="h-12 w-12 text-indigo-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">5 MCQs</h2>
                                <p className="text-muted-foreground text-base max-w-[240px] leading-relaxed">
                                    {subject
                                        ? `Generate 5 MCQs for ${subject.name}.`
                                        : "Select a subject to generate MCQs."
                                    }
                                </p>
                            </button>

                            {/* Query Card */}
                            <button
                                onClick={() => {
                                    console.log("Starting Short Answer session for:", subject?.name);
                                    handleStart("short");
                                }}
                                disabled={!subject}
                                className={cn(
                                    "group relative flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-border bg-card/50 hover:bg-card hover:border-violet-500/50 transition-all duration-300 shadow-xl overflow-hidden",
                                    !subject && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-24 w-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-12 w-12 text-violet-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">3 Queries</h2>
                                <p className="text-muted-foreground text-base max-w-[240px] leading-relaxed">
                                    {subject
                                        ? `Generate 3 questions for ${subject.name}.`
                                        : "Select a subject to generate questions."
                                    }
                                </p>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-20">
                            {activeTab === "mcq" && isComplete && (
                                <ScoreSummary score={score} total={mcqs.length} />
                            )}

                            <div id="results-print-area" className={cn("pb-8", isSubmitted && "bg-card/50 p-8 rounded-2xl border border-border")}>
                                {isSubmitted && (
                                    <div className="text-center pb-8 mb-8 border-b border-border">
                                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-500 dark:to-cyan-500">
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
                                        className="bg-secondary/50 border border-border hover:bg-secondary text-foreground shadow-none"
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
                                        className="bg-secondary/50 border border-border hover:bg-secondary text-foreground shadow-none"
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
