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
    mode: "mcq" | "short",
    sessionId?: string,
    subjectId?: string
): Promise<WorkflowMCQResponse> {
    let prompt = "";

    if (mode === "mcq") {
        prompt = `Please provide an mcq payload for the subject: ${subject}. 
Provide 5 MCQs with 1 correct answer and 3 incorrect ones, including citations and a brief explanation as response.
CRITICAL INSTRUCTIONS FOR EVERY ANSWER:
1. Citations to the uploaded notes (file name + page/section/chunk reference).
2. A confidence level (High/Medium/Low).
3. The top supporting evidence snippets used to form the answer.
4. Strict "Not Found" Handling.`;
    } else {
        prompt = `Please provide a short qna payload for the subject: ${subject}.
Provide 3 question-answer pairs with model answers.
CRITICAL INSTRUCTIONS FOR EVERY ANSWER:
1. Citations to the uploaded notes (file name + page/section/chunk reference).
2. A confidence level (High/Medium/Low).
3. The top supporting evidence snippets used to form the answer.
4. Strict "Not Found" Handling.`;
    }

    const body: Record<string, string> = {
        subject: subject,
        question: prompt,
        chatInput: prompt,
        mode: mode, // Added mode to help n8n understand the context
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
    return data as any;
}

