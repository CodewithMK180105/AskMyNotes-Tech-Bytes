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

    if (parsed && typeof parsed === "object" && "output" in (parsed as object)) {
        const outputStr = String((parsed as { output: string; }).output);
        try {
            // Remove markdown format if AI hallucinated it
            const cleanStr = outputStr
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();
            parsed = JSON.parse(cleanStr);
        } catch (e) {
            console.error("[generate-questions] Failed to parse n8n JSON:", outputStr);
            parsed = { rawText: outputStr };
        }
    }

    return {
        mcqs: extractMCQs(parsed),
        shortAnswers: extractSAQs(parsed),
        raw: parsed,
    };
}

function extractMCQs(data: unknown) {
    if (!data || typeof data !== "object") return [];
    const d = data as Record<string, unknown>;
    const mcqs = (d.mcqs as unknown[]) || [];
    return mcqs.map((m: unknown) => {
        const mcq = m as Record<string, unknown>;
        const options = (mcq.options as Record<string, string>) || {};
        const citations = (mcq.citations as Array<Record<string, string>>) || [];
        const firstCit = citations[0] || {};
        return {
            question: String(mcq.question || ""),
            option_a: options.A || "",
            option_b: options.B || "",
            option_c: options.C || "",
            option_d: options.D || "",
            correct_answer: String(mcq.correctAnswer || mcq.correct_answer || "A"),
            explanation: String(mcq.explanation || ""),
            confidence: String(mcq.confidenceLevel || mcq.confidence || "Medium"),
            citation_file: firstCit.fileName || firstCit.file || null,
            citation_section: firstCit.section || firstCit.chunk_id || null,
        };
    });
}

function extractSAQs(data: unknown) {
    if (!data || typeof data !== "object") return [];
    const d = data as Record<string, unknown>;
    const saqs = (d.shortAnswerQuestions as unknown[]) || [];
    return saqs.map((s: unknown) => {
        const saq = s as Record<string, unknown>;
        const citations = (saq.citations as Array<Record<string, string>>) || [];
        const firstCit = citations[0] || {};
        return {
            question: String(saq.question || ""),
            model_answer: String(saq.modelAnswer || saq.model_answer || ""),
            confidence: String(saq.confidenceLevel || saq.confidence || "Medium"),
            citation_file: firstCit.fileName || firstCit.file || null,
            citation_section: firstCit.section || firstCit.chunk_id || null,
        };
    });
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
        if (!subjectId) {
            console.warn("[generate-questions] No subjectId provided. Skipping Supabase save.");
        } else {
            console.log(`[generate-questions] Parsed ${mcqs.length} MCQs and ${shortAnswers.length} SAQs to save.`);

            if (mcqs.length > 0) {
                const mcqSaved = await saveMCQQuestions(subjectId, mcqs);
                if (!mcqSaved) console.error("[generate-questions] Failed to save MCQs to Supabase.");
                else console.log(`[generate-questions] SUCCESSFULLY saved ${mcqs.length} MCQs to Postgres.`);
            }

            if (shortAnswers.length > 0) {
                const saqSaved = await saveShortAnswerQuestions(subjectId, shortAnswers);
                if (!saqSaved) console.error("[generate-questions] Failed to save SAQs to Supabase.");
                else console.log(`[generate-questions] SUCCESSFULLY saved ${shortAnswers.length} SAQs to Postgres.`);
            }
        }

        // ── Step 4: Return parsed data to frontend ─────────────
        // Return the raw n8n data as-is so frontend transform.ts works correctly
        // Also attach supabase-parsed counts for debugging
        return NextResponse.json({
            ...((typeof raw === "object" && raw !== null) ? raw : { rawOutput: String(raw) }),
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
