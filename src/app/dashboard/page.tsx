"use client";

import { useState } from "react";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { PageTransition } from "@/components/shared/PageTransition";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { UploadZone } from "@/components/subjects/UploadZone";
import { AddSubjectModal } from "@/components/subjects/AddSubjectModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { GradientButton } from "@/components/shared/GradientButton";
import { BookOpen, FolderPlus } from "lucide-react";

export default function DashboardPage() {
    const { subjects, addSubject } = useSubjects();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

    const handleUploadClick = (subjectId: string) => {
        setActiveSubjectId(subjectId);
        setIsUploadOpen(true);
    };

    const handleAddSubject = (name: string) => {
        addSubject(name);
    };

    const maxSubjectsReached = subjects.length >= 3;

    return (
        <PageTransition className="h-full">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-heading font-semibold text-foreground tracking-tight mb-2">
                            My Subjects
                        </h2>
                        <p className="text-muted-foreground">
                            Organize your notes into subjects. You can create up to 3 subjects.
                        </p>
                    </div>

                    <GradientButton
                        onClick={() => setIsAddSubjectOpen(true)}
                        disabled={maxSubjectsReached}
                        leftIcon={<FolderPlus className="h-4 w-4" />}
                        title={maxSubjectsReached ? "Maximum 3 subjects reached" : ""}
                    >
                        Add Subject {subjects.length}/3
                    </GradientButton>
                </div>

                {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                onUploadClick={handleUploadClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="pt-12">
                        <EmptyState
                            icon={BookOpen}
                            title="No subjects yet"
                            description="Create your first subject to start uploading notes and using the AI study partner."
                            action={
                                <GradientButton
                                    onClick={() => setIsAddSubjectOpen(true)}
                                    leftIcon={<FolderPlus className="h-4 w-4" />}
                                >
                                    Create First Subject
                                </GradientButton>
                            }
                        />
                    </div>
                )}

                {/* Modals */}
                <UploadZone
                    isOpen={isUploadOpen}
                    onClose={() => setIsUploadOpen(false)}
                    subjectId={activeSubjectId || ""}
                    subjectName={
                        subjects.find((s) => s.id === activeSubjectId)?.name || "Unknown"
                    }
                    existingFileCount={
                        subjects.find((s) => s.id === activeSubjectId)?.files.length || 0
                    }
                />

                <AddSubjectModal
                    isOpen={isAddSubjectOpen}
                    onClose={() => setIsAddSubjectOpen(false)}
                    onAdd={handleAddSubject}
                />
            </div>
        </PageTransition>
    );
}
