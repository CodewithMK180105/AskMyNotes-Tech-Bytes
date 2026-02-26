// ─────────────────────────────────────────────────────────
// API Service Layer — n8n Workflow Integration
// ─────────────────────────────────────────────────────────
// Connects the frontend to two n8n webhook-test endpoints:
//   1. Upload Notes   → POST   /webhook-test/upload-notes
//   2. Generate MCQs  → POST   /webhook-test/get-mcq-question-answer
// Routes through local Next.js API proxies to avoid CORS issues.
// ─────────────────────────────────────────────────────────

// ──────── Upload Notes ────────
// The n8n upload-notes workflow expects a POST with the file as binary data.
// It then passes the file through an HTTP Request node → Default Data Loader
// → Recursive Character Text Splitter → Embeddings Mistral Cloud → Supabase.

export interface UploadNotesResponse {
    success: boolean;
    message?: string;
    [key: string]: unknown;
}

export async function uploadNotes(
    file: File,
    subjectName: string,
    options?: { userId?: string; subjectColor?: string; subjectId?: string }
): Promise<UploadNotesResponse> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("subject", subjectName);
    if (options?.userId) formData.append("userId", options.userId);
    if (options?.subjectColor) formData.append("subjectColor", options.subjectColor);
    if (options?.subjectId) formData.append("subjectId", options.subjectId);

    const response = await fetch(
        `/api/upload-notes`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Upload failed");
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return await response.json();
    }
    return { success: true, message: await response.text() };
}

/**
 * Upload multiple files sequentially and report per-file progress.
 */
export async function uploadMultipleNotes(
    files: File[],
    subjectName: string,
    onProgress?: (completed: number, total: number, currentFile: string) => void,
    options?: { userId?: string; subjectColor?: string; subjectId?: string }
): Promise<{ results: UploadNotesResponse[]; errors: string[] }> {
    const results: UploadNotesResponse[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress?.(i, files.length, file.name);
        try {
            const result = await uploadNotes(file, subjectName, options);
            results.push(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            errors.push(`${file.name}: ${message}`);
        }
    }

    onProgress?.(files.length, files.length, "");
    return { results, errors };
}


// ──────── Generate MCQ / Short-Answer Questions ────────
// The n8n get-mcq-question-answer workflow expects a message with the subject/topic.
// It uses the Supabase vector store to retrieve relevant note chunks, then generates
// 5 MCQs + 3 Short-Answer questions via the AI Agent with structured output.

export interface WorkflowCitation {
    fileName: string;
    section: string;
    quote: string;
}

export interface WorkflowMCQ {
    questionNumber: number;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctAnswer: string;
    explanation: string;
    confidenceLevel: string;
    citations: WorkflowCitation[];
}

export interface WorkflowShortAnswer {
    questionNumber: number;
    question: string;
    modelAnswer: string;
    confidenceLevel: string;
    supportingEvidenceSnippets: string[];
    citations: WorkflowCitation[];
}

export interface WorkflowMCQResponse {
    subject: string;
    mcqs: WorkflowMCQ[];
    shortAnswerQuestions: WorkflowShortAnswer[];
    metadata: {
        totalQuestionsGenerated: number;
        notesChunksUsed: number;
        generatedAt: string;
    };
}

// The agent reads `chatInput` from the body to drive the conversation.
export async function generateQuestions(
    subject: string,
    sessionId?: string,
    subjectId?: string
): Promise<WorkflowMCQResponse> {
    const body: Record<string, string> = {
        chatInput: `Generate 5 MCQ questions with 4 options each (A, B, C, D) and 3 short answer questions with model answers for the subject: ${subject}. Include citations and confidence levels for each question.`,
    };
    if (sessionId) body.sessionId = sessionId;
    if (subjectId) body.subjectId = subjectId;

    const response = await fetch(
        `/api/generate-questions`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Request failed");
        throw new Error(`Question generation failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // The n8n agent returns { output: "<JSON string>" } via Respond to Webhook
    // We need to parse the nested JSON if it's wrapped in `output`
    if (typeof data.output === "string") {
        try {
            return JSON.parse(data.output) as WorkflowMCQResponse;
        } catch {
            // If the output string isn't valid JSON, throw with context
            throw new Error("AI response was not valid JSON. Please try again.");
        }
    }

    // If the response is already structured (direct JSON passthrough)
    if (data.mcqs && data.shortAnswerQuestions) {
        return data as WorkflowMCQResponse;
    }

    // If wrapped in an array (n8n sometimes wraps in array)
    if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        if (typeof first.output === "string") {
            try {
                return JSON.parse(first.output) as WorkflowMCQResponse;
            } catch {
                throw new Error("AI response was not valid JSON. Please try again.");
            }
        }
        if (first.mcqs && first.shortAnswerQuestions) {
            return first as WorkflowMCQResponse;
        }
    }

    // Last resort — return data as-is hoping it matches
    return data as WorkflowMCQResponse;
}

/**
 * Send a freeform chat message to the MCQ agent (reusing the same webhook).
 * Useful for the Chat window where users can ask arbitrary questions.
 */
export async function sendChatMessage(
    message: string,
    subjectName: string,
    sessionId?: string
): Promise<WorkflowMCQResponse | { rawOutput: string }> {
    const body: Record<string, string> = {
        chatInput: `Subject: ${subjectName}. ${message}`,
    };
    if (sessionId) {
        body.sessionId = sessionId;
    }

    const response = await fetch(
        `/api/generate-questions`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Request failed");
        throw new Error(`Chat request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Try to parse structured output
    if (typeof data.output === "string") {
        try {
            return JSON.parse(data.output) as WorkflowMCQResponse;
        } catch {
            // If it's not valid JSON, it's a freeform text response
            return { rawOutput: data.output };
        }
    }

    if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        if (typeof first.output === "string") {
            try {
                return JSON.parse(first.output) as WorkflowMCQResponse;
            } catch {
                return { rawOutput: first.output };
            }
        }
    }

    if (data.mcqs && data.shortAnswerQuestions) {
        return data as WorkflowMCQResponse;
    }

    return { rawOutput: JSON.stringify(data) };
}
