"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Subject } from "@/lib/types";
import { useAuth } from "@/components/providers/AuthProvider";

// ─────────────────────────────────────────────────────────
// Subjects Context — global state replacing dummy data
// Shared across Dashboard, Sidebar, and Navbar
// ─────────────────────────────────────────────────────────

const COLORS = ["indigo", "violet", "cyan"];

interface SubjectsContextValue {
    subjects: Subject[];
    addSubject: (name: string) => void;
    addFileToSubject: (subjectId: string, file: { id: string; name: string; size: string; pages: number; uploaded_at: string }) => void;
    activeSubjectId: string | null;
    setActiveSubjectId: (id: string | null) => void;
    deleteSubject: (subjectId: string) => Promise<boolean>;
    deleteFileFromSubject: (subjectId: string, fileId: string) => Promise<boolean>;
}

const SubjectsContext = createContext<SubjectsContextValue | null>(null);

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

    // Fetch subjects when user logs in or mounts
    useEffect(() => {
        if (!user) {
            setSubjects([]);
            setActiveSubjectId(null);
            return;
        }

        const fetchSubjects = async () => {
            try {
                const res = await fetch(`/api/subjects?userId=${user.id}`);
                if (!res.ok) throw new Error("Failed to fetch subjects");
                const data = await res.json();
                if (data.success && data.subjects) {
                    setSubjects(data.subjects);
                    if (data.subjects.length > 0 && !activeSubjectId) {
                        setActiveSubjectId(data.subjects[0].id);
                    }
                }
            } catch (err) {
                console.error("[SubjectsProvider] Error fetching subjects:", err);
            }
        };

        fetchSubjects();
    }, [user]); // Run when user changes


    const addSubject = useCallback(async (name: string) => {
        if (!user) return;
        const colorIndex = subjects.length % COLORS.length;
        const color = COLORS[colorIndex];
        const shortName = name.substring(0, 2).toUpperCase();

        try {
            // Persist to backend immediately
            const res = await fetch("/api/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, name, shortName, color })
            });
            const data = await res.json();
            if (data.success && data.subject) {
                setSubjects(prev => {
                    const exists = prev.find(s => s.id === data.subject.id);
                    if (exists) return prev;
                    const updated = [...prev, data.subject];
                    if (prev.length === 0) setActiveSubjectId(data.subject.id);
                    return updated;
                });
            }
        } catch (err) {
            console.error("[SubjectsProvider] Failed to persist subject", err);
        }
    }, [user, subjects.length]);

    const addFileToSubject = useCallback((
        subjectId: string,
        file: { id: string; name: string; size: string; pages: number; uploaded_at: string }
    ) => {
        setSubjects((prev) =>
            prev.map((sub) =>
                sub.id === subjectId
                    ? { ...sub, files: [...sub.files, file] }
                    : sub
            )
        );
    }, []);

    const deleteSubject = useCallback(async (subjectId: string) => {
        if (!user) return false;
        try {
            const res = await fetch(`/api/subjects/${subjectId}?userId=${user.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setSubjects(prev => {
                    const updated = prev.filter(s => s.id !== subjectId);
                    if (activeSubjectId === subjectId) {
                        setActiveSubjectId(updated.length > 0 ? updated[0].id : null);
                    }
                    return updated;
                });
                return true;
            }
        } catch (err) {
            console.error("[SubjectsProvider] Failed to delete subject", err);
        }
        return false;
    }, [user, activeSubjectId]);

    const deleteFileFromSubject = useCallback(async (subjectId: string, fileId: string) => {
        try {
            const res = await fetch(`/api/subjects/files/${fileId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setSubjects((prev) =>
                    prev.map((sub) =>
                        sub.id === subjectId
                            ? { ...sub, files: sub.files.filter((f) => f.id !== fileId) }
                            : sub
                    )
                );
                return true;
            }
        } catch (err) {
            console.error("[SubjectsProvider] Failed to delete file", err);
        }
        return false;
    }, []);

    return (
        <SubjectsContext.Provider
            value={{
                subjects,
                addSubject,
                addFileToSubject,
                activeSubjectId,
                setActiveSubjectId,
                deleteSubject,
                deleteFileFromSubject
            }}
        >
            {children}
        </SubjectsContext.Provider>
    );
}

export function useSubjects() {
    const ctx = useContext(SubjectsContext);
    if (!ctx) throw new Error("useSubjects must be used inside SubjectsProvider");
    return ctx;
}
