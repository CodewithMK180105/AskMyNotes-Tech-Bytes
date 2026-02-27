"use client";

import { useState } from "react";
import { dummySubjects, dummyMCQs, dummyShortAnswers } from "@/lib/dummy-data";
import { PageTransition } from "@/components/shared/PageTransition";
import { StudyTabs } from "@/components/study/StudyTabs";
import { MCQCard } from "@/components/study/MCQCard";
import { ShortAnswerCard } from "@/components/study/ShortAnswerCard";
import { ScoreSummary } from "@/components/study/ScoreSummary";
import { GradientButton } from "@/components/shared/GradientButton";
import { RefreshCcw, PlayCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function StudyPage() {
    const [activeTab, setActiveTab] = useState<"mcq" | "short">("mcq");
    const [isStarted, setIsStarted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [score, setScore] = useState(0);
    const [answersCount, setAnswersCount] = useState(0);

    // Using the first subject as default
    const subject = dummySubjects[0];

    const handleStart = () => {
        setIsStarted(true);
        setIsSubmitted(false);
        setScore(0);
        setAnswersCount(0);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const element = document.getElementById("results-print-area");
            if (!element) return;

            // Add a temporary class to ensure light mode colors for printing if desired,
            // or just render as is. html2canvas handles it.
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Add image to PDF
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            while (position < pdfHeight) {
                pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
                position += pageHeight;
                if (position < pdfHeight) {
                    pdf.addPage();
                }
            }

            pdf.save(`${subject.name.replace(/\s+/g, '_')}_Study_Results.pdf`);
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

    const isComplete = answersCount === dummyMCQs.length;

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
                            <span className="text-sm font-medium">{subject.name}</span>
                        </div>
                        <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Practice & Review
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Test your knowledge with AI-generated questions based on your uploaded notes for this subject.
                        </p>
                    </div>

                    {!isSubmitted && (
                        <StudyTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            mcqCount={dummyMCQs.length}
                            shortCount={dummyShortAnswers.length}
                        />
                    )}
                </div>

                {/* Content Area */}
                {!isStarted ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 glassmorphism-card">
                        <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                            <PlayCircle className="h-10 w-10 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Ready to test your knowledge?</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            We&apos;ve generated {activeTab === "mcq" ? dummyMCQs.length : dummyShortAnswers.length} {activeTab === "mcq" ? "multiple choice" : "short answer"} questions to help you review {subject.name}.
                        </p>
                        <GradientButton onClick={handleStart} className="px-8 text-lg rounded-xl h-12">
                            Start Practice Session
                        </GradientButton>
                    </div>
                ) : (
                    <div className="space-y-8 pb-20">
                        {activeTab === "mcq" && isComplete && (
                            <ScoreSummary score={score} total={dummyMCQs.length} />
                        )}

                        <div id="results-print-area" className={cn("pb-8", isSubmitted && "bg-card/50 p-8 rounded-2xl border border-white/5")}>
                            {isSubmitted && (
                                <div className="text-center pb-8 mb-8 border-b border-white/10">
                                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                                        Study Results: {subject.name}
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
                                    {dummyMCQs.map((mcq, index) => (
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
                                    {dummyShortAnswers.map((sa, index) => (
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

                        {/* {isSubmitted ? (
                            <div className="flex justify-center gap-4 pt-8 border-t border-border">
                                <GradientButton
                                    onClick={handleStart}
                                    leftIcon={<RefreshCcw className="h-4 w-4" />}
                                    className="bg-transparent border border-white/20 hover:bg-white/5 shadow-none"
                                >
                                    Restart Session
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
                            <div className="flex justify-center pt-8 border-t border-border">
                                <GradientButton
                                    onClick={handleSubmit}
                                    disabled={!isComplete}
                                >
                                    Submit Answers
                                </GradientButton>
                            </div>
                        )} */}
                        <div className="flex justify-center pt-8 border-t border-border">
                            <GradientButton
                                onClick={handleSubmit}
                                disabled={!isComplete}
                            >
                                Submit Answers
                            </GradientButton>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
