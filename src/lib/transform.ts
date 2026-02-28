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

        let expText = m.explanation;
        let evidenceText = m.explanation || "No explicit evidence provided.";
        let userAnswer = undefined;
        try {
            const parsed = JSON.parse(m.explanation);
            expText = parsed.text;
            evidenceText = parsed.evidence;
            userAnswer = parsed.user_answer || undefined;
        } catch (e) {
            // fallback for older db rows that are raw text
        }

        return {
            id: m.id || `mcq_live_${idx + 1}`,
            question: m.question,
            options,
            correct: m.correct_answer || "A", // Ensure uppercase matching if AI hallucinates case
            explanation: expText,
            citation: m.citation_file ? {
                file: m.citation_file,
                page: m.citation_section || "0",
                chunk_id: m.citation_section || "",
            } : { file: "Notes", page: "0", chunk_id: "" },
            evidence: evidenceText,
            user_answer: userAnswer,
            confidence: normalizeConfidence(m.confidence),
        };
    });

    const parsedShortAnswers: ShortAnswer[] = (data.shortAnswers || []).map((s: any, idx: number) => {
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
            id: s.id || `sa_live_${idx + 1}`,
            question: s.question,
            model_answer: ansText,
            citation: s.citation_file ? {
                file: s.citation_file,
                page: s.citation_section || "0",
                chunk_id: s.citation_section || "",
            } : { file: "Notes", page: "0", chunk_id: "" },
            evidence: evidenceText,
            user_answer: userAnswer,
            confidence: normalizeConfidence(s.confidence),
        };
    });

    return {
        mcqs: parsedMcqs,
        shortAnswers: parsedShortAnswers,
        subject: data.subject || "Unknown Subject",
    };
}
