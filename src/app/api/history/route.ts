import { NextRequest, NextResponse } from "next/server";
import { getMCQsBySubject, getShortAnswersBySubject } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const subjectId = request.nextUrl.searchParams.get("subjectId");
        if (!subjectId) {
            return NextResponse.json(
                { success: false, message: "Missing subjectId parameter" },
                { status: 400 }
            );
        }

        const mcqs = await getMCQsBySubject(subjectId);
        const saqs = await getShortAnswersBySubject(subjectId);

        return NextResponse.json({
            success: true,
            mcqs,
            shortAnswers: saqs,
        });
    } catch (error) {
        console.error("[GET /api/history] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch history" },
            { status: 500 }
        );
    }
}
