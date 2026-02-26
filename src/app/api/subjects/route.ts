import { NextRequest, NextResponse } from "next/server";
import { getSubjectsByUser, upsertSubject } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId");
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Missing userId parameter" },
                { status: 400 }
            );
        }

        // Fetch subjects
        const subjects = await getSubjectsByUser(userId);

        const subjectsWithFiles = subjects.map((subject) => {
            return {
                id: subject.id,
                name: subject.name,
                short_name: subject.short_name,
                color: subject.color,
                created_at: subject.created_at,
                files: (subject.subject_files || []).map(file => ({
                    id: file.id,
                    name: file.file_name,
                    size: "2 MB", // Default placeholders
                    pages: 10,
                    uploaded_at: file.uploaded_at,
                }))
            };
        });

        return NextResponse.json({
            success: true,
            subjects: subjectsWithFiles,
        });
    } catch (error) {
        console.error("[GET /api/subjects] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch subjects" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, name, shortName, color } = body;

        if (!userId || !name || !shortName || !color) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const subjectRow = await upsertSubject(userId, name, shortName, color);
        if (!subjectRow) {
            throw new Error("Failed to insert subject into DB");
        }

        return NextResponse.json({
            success: true,
            subject: {
                id: subjectRow.id,
                name: subjectRow.name,
                short_name: subjectRow.short_name,
                color: subjectRow.color,
                created_at: subjectRow.created_at,
                // Match the frontend Subject interface properly when creating new ones
                files: []
            }
        });
    } catch (error) {
        console.error("[POST /api/subjects] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create subject" },
            { status: 500 }
        );
    }
}

