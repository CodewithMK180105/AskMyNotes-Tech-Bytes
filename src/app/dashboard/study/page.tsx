"use client";

import { useState, useCallback } from "react";
import { useSubjects } from "@/components/providers/SubjectsProvider";
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
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const effectiveSubjectId = selectedSubjectId || activeSubjectId || subjects[0]?.id || null;
    const subject = subjects.find((s) => s.id === effectiveSubjectId) || subjects[0] || null;

    const handleStart = useCallback(async () => {
        if (!subject) return;
        setIsStarted(true);
        setIsSubmitted(false);
        setScore(0);
        setAnswersCount(0);
        setError(null);
        setMcqs([]);
        setShortAnswers([]);
        setIsLoading(true);
        setLoadingMessage("Searching your notes and generating questions...");

        try {
            const response = await generateQuestions(
                subject.name,
                undefined,
                subject.id // Supabase subject UUID → saves MCQs/SAQs to DB
            );
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
    }, [subject]);

    const handleSubmit = () => {
        setIsSubmitted(true);
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

            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            while (position < pdfHeight) {
                pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
                position += pageHeight;
                if (position < pdfHeight) {
                    pdf.addPage();
                }
            }

            pdf.save(`${(subject?.name || "Study").replace(/\s+/g, "_")}_Study_Results.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) setScore((prev) => prev + 1);
        setAnswersCount((prev) => prev + 1);
    };

    const isComplete = mcqs.length > 0 && answersCount === mcqs.length;

    return (
        <PageTransition className="h-full">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                Study Mode
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm font-medium">{subject?.name || "No subject selected"}</span>
                            {responseSubject && responseSubject !== subject?.name && (
                                <>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-sm font-medium text-indigo-500">{responseSubject}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Practice &amp; Review
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Test your knowledge with AI-generated questions based on your uploaded notes for this subject.
                        </p>
                    </div>

                    {!isSubmitted && mcqs.length > 0 && (
                        <StudyTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            mcqCount={mcqs.length}
                            shortCount={shortAnswers.length}
                        />
                    )}
                </div>

                {/* Subject Selector */}
                {!isStarted && (
                    <div className="flex flex-wrap gap-2">
                        {subjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No subjects yet — go to Dashboard to add one.</p>
                        ) : subjects.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSubjectId(s.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                    s.id === effectiveSubjectId
                                        ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/30"
                                        : "bg-secondary/50 text-muted-foreground border-white/5 hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                {s.short_name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                {!isStarted ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
                        <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                            <PlayCircle className="h-10 w-10 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Ready to test your knowledge?</h2>
                        <p className="text-muted-foreground max-w-md mb-3">
                            AI will generate 5 MCQs and 3 short-answer questions from your uploaded notes for <strong>{subject?.name || "selected subject"}</strong>.
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mb-8">
                            Questions are generated using your notes stored in Supabase — make sure you&apos;ve uploaded notes for this subject first.
                        </p>
                        <GradientButton
                            onClick={handleStart}
                            disabled={!subject}
                            className="px-8 text-lg rounded-xl h-12"
                        >
                            Generate &amp; Start Practice
                        </GradientButton>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
                        <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 relative">
                            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-20 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Generating Questions...</h2>
                        <p className="text-muted-foreground max-w-md mb-4">
                            {loadingMessage}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Searching notes → Generating MCQs → Building short answers</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
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
                            <GradientButton onClick={handleStart} className="px-8">
                                Try Again
                            </GradientButton>
                        </div>
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
                                            onAnswer={handleAnswer}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Short Answers Section */}
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
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isSubmitted ? (
                            <div className="flex justify-center gap-4 pt-8 border-t border-border">
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
                            <div className="flex justify-center gap-4 pt-8 border-t border-border">
                                <GradientButton
                                    onClick={handleRestart}
                                    leftIcon={<RefreshCcw className="h-4 w-4" />}
                                    className="bg-transparent border border-white/20 hover:bg-white/5 shadow-none"
                                >
                                    Back
                                </GradientButton>
                                <GradientButton
                                    onClick={handleSubmit}
                                    disabled={!isComplete}
                                >
                                    Submit Answers
                                </GradientButton>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
