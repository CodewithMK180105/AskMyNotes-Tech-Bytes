// ─────────────────────────────────────────────────────────
// Transform n8n workflow responses → Frontend types
// ─────────────────────────────────────────────────────────

import type { MCQ, ShortAnswer, Citation } from "./types";
import type { WorkflowMCQResponse, WorkflowCitation, WorkflowMCQ, WorkflowShortAnswer } from "./api";

/**
 * Convert a single n8n citation to the frontend Citation format.
 */
function transformCitation(wc: WorkflowCitation): Citation {
    return {
        file: wc.fileName || "Unknown",
        page: parseInt(wc.section?.match(/\d+/)?.[0] || "0", 10),
        chunk_id: wc.section || "",
    };
}

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
 * Convert a single workflow MCQ to the frontend MCQ format.
 */
function transformMCQ(wm: WorkflowMCQ, idx: number): MCQ {
    const options = Object.entries(wm.options).map(([label, text]) => ({
        label,
        text: text as string,
    }));

    const primaryCitation = wm.citations?.[0];
    const citationQuotes = wm.citations?.map((c) => c.quote).filter(Boolean) || [];

    return {
        id: `mcq_live_${idx + 1}`,
        question: wm.question,
        options,
        correct: wm.correctAnswer,
        explanation: wm.explanation,
        citation: primaryCitation
            ? transformCitation(primaryCitation)
            : { file: "Notes", page: 0, chunk_id: "" },
        evidence: citationQuotes[0] || wm.explanation,
        confidence: normalizeConfidence(wm.confidenceLevel),
    };
}

/**
 * Convert a single workflow ShortAnswer to the frontend ShortAnswer format.
 */
function transformShortAnswer(ws: WorkflowShortAnswer, idx: number): ShortAnswer {
    const primaryCitation = ws.citations?.[0];
    const evidence =
        ws.supportingEvidenceSnippets?.[0] || ws.modelAnswer?.slice(0, 200) || "";

    return {
        id: `sa_live_${idx + 1}`,
        question: ws.question,
        model_answer: ws.modelAnswer,
        citation: primaryCitation
            ? transformCitation(primaryCitation)
            : { file: "Notes", page: 0, chunk_id: "" },
        evidence,
        confidence: normalizeConfidence(ws.confidenceLevel),
    };
}

/**
 * Transform the entire workflow response into arrays of frontend MCQ and ShortAnswer.
 */
export function transformWorkflowResponse(data: WorkflowMCQResponse): {
    mcqs: MCQ[];
    shortAnswers: ShortAnswer[];
    subject: string;
    metadata: WorkflowMCQResponse["metadata"];
} {
    return {
        mcqs: (data.mcqs || []).map((m, i) => transformMCQ(m, i)),
        shortAnswers: (data.shortAnswerQuestions || []).map((s, i) =>
            transformShortAnswer(s, i)
        ),
        subject: data.subject || "Unknown Subject",
        metadata: data.metadata,
    };
}
