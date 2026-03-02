export interface User {
    id: string;
    name: string;
    email: string;
    avatar_initials: string;
}

export interface FileData {
    id: string;
    name: string;
    size: string;
    pages: number;
    uploaded_at: string;
}

export interface Subject {
    id: string;
    name: string;
    short_name: string;
    color: string;
    files: FileData[];
    created_at: string;
}

export interface Citation {
    file: string;
    page: number;
    chunk_id: string;
}


export interface MCQOption {
    label: string;
    text: string;
}

export interface MCQ {
    id: string;
    question: string;
    options: MCQOption[];
    correct: string;
    explanation: string;
    citation: Citation;
    evidence: string;
    user_answer?: string | null;
    confidence: "High" | "Medium" | "Low";
}

export interface ShortAnswer {
    id: string;
    question: string;
    model_answer: string;
    citation: Citation;
    evidence: string;
    user_answer?: string | null;
    confidence: "High" | "Medium" | "Low";
}
