// ─────────────────────────────────────────────────────────
// Supabase DB Helpers — AskMyNotes
// ─────────────────────────────────────────────────────────
// All database writes go through here. Uses supabaseAdmin
// (service_role key) so we bypass RLS without needing
// to thread JWTs through every request.
// ─────────────────────────────────────────────────────────

import { supabaseAdmin } from "./supabase";

// ── Types ────────────────────────────────────────────────

export interface DBSubject {
    id: string;
    user_id: string;
    name: string;
    short_name: string;
    color: string;
    created_at: string;
}

export interface DBSubjectFile {
    id: string;
    subject_id: string;
    file_name: string;
    imagekit_url: string;
    imagekit_file_id: string | null;
    uploaded_at: string;
}

export interface DBMCQQuestion {
    id?: string;
    subject_id: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation: string | null;
    confidence: string | null;
    citation_file: string | null;
    citation_section: string | null;
}

export interface DBShortAnswerQuestion {
    id?: string;
    subject_id: string;
    question: string;
    model_answer: string;
    confidence: string | null;
    citation_file: string | null;
    citation_section: string | null;
}

// ── Subjects ─────────────────────────────────────────────

/**
 * Upsert a subject by name + user_id.
 * Returns the existing or newly created subject row.
 */
export async function upsertSubject(
    userId: string,
    name: string,
    shortName: string,
    color: string
): Promise<DBSubject | null> {
    // Check if subject already exists for this user
    const { data: existing } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();

    if (existing) return existing as DBSubject;

    const { data, error } = await supabaseAdmin
        .from("subjects")
        .insert({ user_id: userId, name, short_name: shortName, color })
        .select()
        .single();

    if (error) {
        console.error("[db] upsertSubject error:", error.message);
        return null;
    }
    return data as DBSubject;
}

/**
 * Get all subjects for a user.
 */
export async function getSubjectsByUser(userId: string): Promise<(DBSubject & { subject_files: DBSubjectFile[] })[]> {
    const { data, error } = await supabaseAdmin
        .from("subjects")
        .select(`
            *,
            subject_files(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("[db] getSubjectsByUser error:", error.message);
        return [];
    }
    return (data || []) as (DBSubject & { subject_files: DBSubjectFile[] })[];
}

/**
 * Delete a subject and all its related data.
 */
export async function deleteSubject(subjectId: string, userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from("subjects")
        .delete()
        .eq("id", subjectId)
        .eq("user_id", userId); // ensure the user actually owns this subject

    if (error) {
        console.error("[db] deleteSubject error:", error.message);
        return false;
    }
    return true;
}

// ── Subject Files ─────────────────────────────────────────

/**
 * Insert a file record after successful ImageKit upload.
 */
export async function insertSubjectFile(
    subjectId: string,
    fileName: string,
    imagekitUrl: string,
    imagekitFileId?: string
): Promise<DBSubjectFile | null> {
    const { data, error } = await supabaseAdmin
        .from("subject_files")
        .insert({
            subject_id: subjectId,
            file_name: fileName,
            imagekit_url: imagekitUrl,
            imagekit_file_id: imagekitFileId || null,
        })
        .select()
        .single();

    if (error) {
        console.error("[db] insertSubjectFile error:", error.message);
        return null;
    }
    return data as DBSubjectFile;
}

/**
 * Get file count for a subject (to enforce max 3 files).
 */
export async function getSubjectFileCount(subjectId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
        .from("subject_files")
        .select("*", { count: "exact", head: true })
        .eq("subject_id", subjectId);

    if (error) return 0;
    return count || 0;
}

/**
 * Get all files for a subject.
 */
export async function getSubjectFiles(subjectId: string): Promise<DBSubjectFile[]> {
    const { data, error } = await supabaseAdmin
        .from("subject_files")
        .select("*")
        .eq("subject_id", subjectId)
        .order("uploaded_at", { ascending: true });

    if (error) {
        console.error("[db] getSubjectFiles error:", error.message);
        return [];
    }
    return (data || []) as DBSubjectFile[];
}

/**
 * Delete a specific file record.
 */
export async function deleteSubjectFile(fileId: string): Promise<DBSubjectFile | null> {
    const { data, error } = await supabaseAdmin
        .from("subject_files")
        .delete()
        .eq("id", fileId)
        .select()
        .maybeSingle();

    if (error) {
        console.error("[db] deleteSubjectFile error:", error.message);
        return null;
    }
    return data as DBSubjectFile;
}


// ── MCQ Questions ─────────────────────────────────────────

/**
 * Bulk insert 5 MCQ questions for a subject.
 * Clears previous MCQs for the subject first so results are always fresh.
 */
export async function saveMCQQuestions(
    subjectId: string,
    mcqs: Omit<DBMCQQuestion, "id" | "subject_id">[]
): Promise<DBMCQQuestion[]> {
    // Keep the most recent 10 MCQs (to accommodate 5 new ones for a total of 15 / 3 sessions)
    const { data: oldMCQs } = await supabaseAdmin
        .from("mcq_questions")
        .select("id")
        .eq("subject_id", subjectId)
        .order("generated_at", { ascending: false })
        .range(10, 1000);

    if (oldMCQs && oldMCQs.length > 0) {
        const oldIds = oldMCQs.map((q) => q.id);
        await supabaseAdmin
            .from("mcq_questions")
            .delete()
            .in("id", oldIds);
    }

    const rows = mcqs.map((m) => ({ ...m, subject_id: subjectId }));

    const { data, error } = await supabaseAdmin
        .from("mcq_questions")
        .insert(rows)
        .select();

    if (error) {
        console.error("[db] saveMCQQuestions error:", error.message);
        return [];
    }
    return (data || []) as DBMCQQuestion[];
}

/**
 * Get the latest MCQs for a subject.
 */
export async function getMCQsBySubject(subjectId: string): Promise<DBMCQQuestion[]> {
    const { data, error } = await supabaseAdmin
        .from("mcq_questions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("generated_at", { ascending: false })
        .limit(15);

    if (error) {
        console.error("[db] getMCQsBySubject error:", error.message);
        return [];
    }
    return (data || []) as DBMCQQuestion[];
}

// ── Short Answer Questions ────────────────────────────────

/**
 * Bulk insert 3 short answer questions for a subject.
 * Clears previous SAQs first.
 */
export async function saveShortAnswerQuestions(
    subjectId: string,
    saqs: Omit<DBShortAnswerQuestion, "id" | "subject_id">[]
): Promise<DBShortAnswerQuestion[]> {
    // Keep the most recent 6 SAQs (to accommodate 3 new ones for a total of 9 / 3 sessions)
    const { data: oldSAQs } = await supabaseAdmin
        .from("short_answer_questions")
        .select("id")
        .eq("subject_id", subjectId)
        .order("generated_at", { ascending: false })
        .range(6, 1000);

    if (oldSAQs && oldSAQs.length > 0) {
        const oldIds = oldSAQs.map((s) => s.id);
        await supabaseAdmin
            .from("short_answer_questions")
            .delete()
            .in("id", oldIds);
    }

    const rows = saqs.map((s) => ({ ...s, subject_id: subjectId }));

    const { data, error } = await supabaseAdmin
        .from("short_answer_questions")
        .insert(rows)
        .select();

    if (error) {
        console.error("[db] saveShortAnswerQuestions error:", error.message);
        return [];
    }
    return (data || []) as DBShortAnswerQuestion[];
}

/**
 * Get the latest short-answer questions for a subject.
 */
export async function getShortAnswersBySubject(subjectId: string): Promise<DBShortAnswerQuestion[]> {
    const { data, error } = await supabaseAdmin
        .from("short_answer_questions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("generated_at", { ascending: false })
        .limit(9);

    if (error) {
        console.error("[db] getShortAnswersBySubject error:", error.message);
        return [];
    }
    return (data || []) as DBShortAnswerQuestion[];
}
