// ─────────────────────────────────────────────────────────
// API Proxy: Generate Questions → n8n → Supabase
// ─────────────────────────────────────────────────────────
// Flow:
//  1. Send chatInput + subject metadata to n8n webhook-test
//  2. Parse n8n response (5 MCQs + 3 short answers with citations)
//  3. Persist MCQs → mcq_questions table in Supabase
//  4. Persist SAQs → short_answer_questions table in Supabase
//  5. Return the parsed response to the frontend
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { saveMCQQuestions, saveShortAnswerQuestions } from "@/lib/db";

const N8N_MCQ_URL =
    "https://nikunjn8n.up.railway.app/webhook/get-mcq-question-answer";

// ── Helper: Parse n8n response into a consistent shape ───
function parseN8nResponse(data: unknown): {
    mcqs: ReturnType<typeof extractMCQs>;
    shortAnswers: ReturnType<typeof extractSAQs>;
    raw: unknown;
} {
    // n8n may return { output: "<JSON string>" } or the object directly
    // or wrapped in an array
    let parsed: unknown = data;

    if (Array.isArray(data) && data.length > 0) {
        parsed = data[0];
    }

    console.log("[generate-questions] Raw n8n data type:", typeof data, "isArray:", Array.isArray(data));
    console.log("[generate-questions] Parsed keys:", parsed && typeof parsed === "object" ? Object.keys(parsed) : "none");

    if (parsed && typeof parsed === "object" && "output" in (parsed as object)) {
        const output = (parsed as { output: any }).output;

        if (typeof output === "string") {
            try {
                // Remove markdown format if AI hallucinated it
                const cleanStr = output
                    .replace(/^```(?:json)?\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .trim();
                parsed = JSON.parse(cleanStr);
                console.log("[generate-questions] Extracted from 'output' string. New keys:", Object.keys(parsed as object));
            } catch (e) {
                console.error("[generate-questions] Failed to parse n8n JSON from output string:", output);
                parsed = { rawText: output };
            }
        } else if (output && typeof output === "object") {
            parsed = output;
            console.log("[generate-questions] Extracted from 'output' object. New keys:", Object.keys(parsed as object));
        }
    }

    return {
        mcqs: extractMCQs(parsed),
        shortAnswers: extractSAQs(parsed),
        raw: parsed,
    };
}

function extractMCQs(data: unknown) {
    if (!data) return [];

    let mcqs: unknown[] = [];
    if (Array.isArray(data)) {
        mcqs = data;
    } else if (typeof data === "object" && data !== null) {
        const d = data as Record<string, unknown>;
        // Try various keys the AI might use
        const possibleKeys = ["mcqs", "mcq_payload", "mcqPayload", "questions", "mcq_questions"];
        for (const key of possibleKeys) {
            if (Array.isArray(d[key])) {
                mcqs = d[key] as unknown[];
                break;
            }
        }
    }

    return mcqs.map((m: unknown) => {
        const mcq = m as Record<string, unknown>;
        const options = (mcq.options as Record<string, string>) || {};

        // Handle both older `citations` array and newer `citation` object structure
        const citationObj = (mcq.citation as Record<string, string>) || undefined;
        const citationsArray = (mcq.citations as Array<Record<string, string>>) || [];
        const firstCit = citationObj || citationsArray[0] || {};

        const explanationText = String(mcq.explanation || "");

        // Evidence can be under citation.evidence, supportingEvidenceSnippets, or evidence
        const evidenceArray = mcq.supportingEvidenceSnippets || mcq.evidence;
        const evidenceTextFallback = Array.isArray(evidenceArray) ? evidenceArray.join("\n") : String(evidenceArray || "");
        const evidenceText = String(firstCit.evidence || evidenceTextFallback || explanationText);

        return {
            question: String(mcq.question || ""),
            option_a: String(options.A || mcq.option_a || ""),
            option_b: String(options.B || mcq.option_b || ""),
            option_c: String(options.C || mcq.option_c || ""),
            option_d: String(options.D || mcq.option_d || ""),
            correct_answer: String(mcq.correctAnswer || mcq.correct_answer || mcq.answer || "A"),
            explanation: JSON.stringify({
                text: explanationText,
                evidence: evidenceText,
                user_answer: null
            }),
            confidence: String(mcq.confidenceLevel || mcq.confidence || "Medium"),
            citation_file: firstCit.fileName || firstCit.file || null,
            citation_section: firstCit.section || firstCit.chunk_id || null,
        };
    }).filter(m => m.question); // Only return valid questions
}

function extractSAQs(data: unknown) {
    if (!data) return [];

    let saqs: unknown[] = [];
    if (Array.isArray(data)) {
        // If it's an array, it might be the SAQs directly if they have 'modelAnswer'
        if (data.length > 0 && (data[0] as any).modelAnswer) {
            saqs = data;
        }
    } else if (typeof data === "object" && data !== null) {
        const d = data as Record<string, unknown>;
        const possibleKeys = ["shortAnswerQuestions", "short_answer_questions", "shortAnswers", "qna_payload", "qnaPayload", "short_qna"];
        for (const key of possibleKeys) {
            if (Array.isArray(d[key])) {
                saqs = d[key] as unknown[];
                break;
            }
        }
    }

    return saqs.map((s: unknown) => {
        const saq = s as Record<string, unknown>;

        // Handle both older `citations` array and newer `citation` object structure
        const citationObj = (saq.citation as Record<string, string>) || undefined;
        const citationsArray = (saq.citations as Array<Record<string, string>>) || [];
        const firstCit = citationObj || citationsArray[0] || {};

        const answerText = String(saq.modelAnswer || saq.model_answer || saq.answer || "");

        // Evidence can be under citation.evidence, supportingEvidenceSnippets, or evidence
        const evidenceArray = saq.supportingEvidenceSnippets || saq.evidence;
        const evidenceTextFallback = Array.isArray(evidenceArray) ? evidenceArray.join("\n") : String(evidenceArray || "");
        const evidenceText = String(firstCit.evidence || evidenceTextFallback || answerText.slice(0, 200));

        return {
            question: String(saq.question || ""),
            model_answer: JSON.stringify({
                text: answerText,
                evidence: evidenceText,
                user_answer: null
            }),
            confidence: String(saq.confidenceLevel || saq.confidence || "Medium"),
            citation_file: firstCit.fileName || firstCit.file || null,
            citation_section: firstCit.section || firstCit.chunk_id || null,
        };
    }).filter(s => s.question);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Frontend may pass subjectId for DB storage
        const { subjectId, ...n8nBody } = body as { subjectId?: string;[key: string]: unknown };

        // ── Step 1: Call n8n ───────────────────────────────────
        const n8nResponse = await fetch(N8N_MCQ_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(n8nBody),
        });

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text().catch(() => "Request failed");
            return NextResponse.json(
                { error: `n8n error (${n8nResponse.status}): ${errorText}` },
                { status: n8nResponse.status }
            );
        }

        const text = await n8nResponse.text();
        const contentType = n8nResponse.headers.get("content-type") || "";

        let rawData: unknown = text;
        if (contentType.includes("application/json") && text.trim()) {
            try {
                rawData = JSON.parse(text);
            } catch (jsonError) {
                console.warn("[generate-questions] Failed to parse n8n JSON:", text);
            }
        }

        // ── Step 2: Parse response ─────────────────────────────
        const { mcqs, shortAnswers, raw } = parseN8nResponse(rawData);

        // ── Step 3: Persist to Supabase (if subjectId provided) ─
        let returnedMcqs: any[] = mcqs;
        let returnedSaqs: any[] = shortAnswers;

        if (!subjectId) {
            console.warn("[generate-questions] No subjectId provided. Skipping Supabase save.");
        } else {
            console.log(`[generate-questions] Parsed ${mcqs.length} MCQs and ${shortAnswers.length} SAQs to save.`);

            if (mcqs.length > 0) {
                const mcqSaved = await saveMCQQuestions(subjectId, mcqs);
                if (mcqSaved && mcqSaved.length > 0) {
                    returnedMcqs = mcqSaved;
                    console.log(`[generate-questions] SUCCESSFULLY saved ${mcqs.length} MCQs to Postgres.`);
                } else console.error("[generate-questions] Failed to save MCQs to Supabase.");
            }

            if (shortAnswers.length > 0) {
                const saqSaved = await saveShortAnswerQuestions(subjectId, shortAnswers);
                if (saqSaved && saqSaved.length > 0) {
                    returnedSaqs = saqSaved;
                    console.log(`[generate-questions] SUCCESSFULLY saved ${shortAnswers.length} SAQs to Postgres.`);
                } else console.error("[generate-questions] Failed to save SAQs to Supabase.");
            }
        }

        // ── Step 4: Return normalized data to frontend ─────────────
        return NextResponse.json({
            subject: (raw as any)?.subject || subjectId || "Subject",
            mcqs: returnedMcqs,
            shortAnswers: returnedSaqs,
            _db: {
                subjectId: subjectId || null,
                mcqsSaved: mcqs.length,
                saqsSaved: shortAnswers.length,
            },
        });
    } catch (error) {
        console.error("[generate-questions proxy] Error:", error);
        const message =
            error instanceof Error ? error.message : "Proxy request failed";
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
