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
                const res = await fetch(`/api/subjects?userId=${user.uid}`);
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
                body: JSON.stringify({ userId: user.uid, name, shortName, color })
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

    return (
        <SubjectsContext.Provider
            value={{ subjects, addSubject, addFileToSubject, activeSubjectId, setActiveSubjectId }}
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
