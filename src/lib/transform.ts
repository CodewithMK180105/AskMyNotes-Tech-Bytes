// ─────────────────────────────────────────────────────────
// Transform n8n workflow responses → Frontend types
// ─────────────────────────────────────────────────────────

import type { MCQ, ShortAnswer } from "./types";

/**
 * Normalize confidence level strings from the workflow.
 */
function normalizeConfidence(level: string): "High" | "Medium" | "Low" {
    const l = (level || "").toLowerCase().trim();
    if (l === "high") return "High";
    if (l === "low") return "Low";
    return "Medium";
}

/**
 * Transform the entire workflow response into arrays of frontend MCQ and ShortAnswer.
 */
export function transformWorkflowResponse(data: any): {
    mcqs: MCQ[];
    shortAnswers: ShortAnswer[];
    subject: string;
} {
    // The backend route (/api/generate-questions) now perfectly normalizes the response
    // into the exact db schema formats, so we just map them into the display UI types.

    const parsedMcqs: MCQ[] = (data.mcqs || []).map((m: any, idx: number) => {
        const options = [
            { label: "A", text: String(m.option_a || "") },
            { label: "B", text: String(m.option_b || "") },
            { label: "C", text: String(m.option_c || "") },
            { label: "D", text: String(m.option_d || "") },
        ].filter(o => o.text); // Remove empty options if AI hallucinated fewer than 4

        return {
            id: `mcq_live_${idx + 1}`,
            question: m.question,
            options,
            correct: m.correct_answer || "A", // Ensure uppercase matching if AI hallucinates case
            explanation: m.explanation,
            citation: m.citation_file ? {
                file: m.citation_file,
                page: parseInt(m.citation_section?.match(/\d+/)?.[0] || "0", 10),
                chunk_id: m.citation_section || "",
            } : { file: "Notes", page: 0, chunk_id: "" },
            evidence: m.explanation || "No explicit evidence provided.",
            confidence: normalizeConfidence(m.confidence),
        };
    });

    const parsedShortAnswers: ShortAnswer[] = (data.shortAnswers || []).map((s: any, idx: number) => {
        return {
            id: `sa_live_${idx + 1}`,
            question: s.question,
            model_answer: s.model_answer,
            citation: s.citation_file ? {
                file: s.citation_file,
                page: parseInt(s.citation_section?.match(/\d+/)?.[0] || "0", 10),
                chunk_id: s.citation_section || "",
            } : { file: "Notes", page: 0, chunk_id: "" },
            evidence: s.model_answer?.slice(0, 200) || "No explicit evidence provided.",
            confidence: normalizeConfidence(s.confidence),
        };
    });

    return {
        mcqs: parsedMcqs,
        shortAnswers: parsedShortAnswers,
        subject: data.subject || "Unknown Subject",
    };
}
