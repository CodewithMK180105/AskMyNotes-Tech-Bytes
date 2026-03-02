import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mcqs, shortAnswers } = body;

        // Perform parallel updates for MCQs
        if (mcqs && Array.isArray(mcqs)) {
            await Promise.all(mcqs.map(async (m: any) => {
                if (m.id && m.user_answer !== undefined) {
                    const mergedExplanation = JSON.stringify({
                        text: m.explanation || "",
                        evidence: m.evidence || "",
                        user_answer: m.user_answer || ""
                    });

                    await supabaseAdmin
                        .from('mcq_questions')
                        .update({ explanation: mergedExplanation })
                        .eq('id', m.id);
                }
            }));
        }

        // Perform parallel updates for Short Answers
        if (shortAnswers && Array.isArray(shortAnswers)) {
            await Promise.all(shortAnswers.map(async (s: any) => {
                if (s.id && s.user_answer !== undefined) {
                    const mergedAnswer = JSON.stringify({
                        text: s.model_answer || "",
                        evidence: s.evidence || "",
                        user_answer: s.user_answer || ""
                    });

                    await supabaseAdmin
                        .from('short_answer_questions')
                        .update({ model_answer: mergedAnswer })
                        .eq('id', s.id);
                }
            }));
        }

        return NextResponse.json({ success: true, message: "Answers saved successfully" });
    } catch (error) {
        console.error("[save-answers] Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
