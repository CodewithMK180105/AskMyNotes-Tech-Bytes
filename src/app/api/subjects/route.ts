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

        const subjectsWithFiles = await Promise.all(subjects.map(async (subject) => {
            const filesWithDetails = await Promise.all((subject.subject_files || []).map(async (file) => {
                let sizeStr = "Unknown Size";
                let pagesCount = 0; // Default placeholder since ImageKit doesn't easily expose pdf pages

                if (file.imagekit_file_id) {
                    try {
                        const { default: imagekit } = await import("@/lib/imagekit");
                        const ikDetails = await imagekit.files.get(file.imagekit_file_id);
                        if (ikDetails && ikDetails.size) {
                            sizeStr = `${(ikDetails.size / (1024 * 1024)).toFixed(2)} MB`;
                        }
                    } catch (e) {
                        console.error(`[GET /api/subjects] error fetching file details for ${file.imagekit_file_id}:`, Object(e).message);
                    }
                }

                return {
                    id: file.id,
                    name: file.file_name,
                    size: sizeStr,
                    pages: pagesCount,
                    uploaded_at: file.uploaded_at,
                };
            }));

            return {
                id: subject.id,
                name: subject.name,
                short_name: subject.short_name,
                color: subject.color,
                created_at: subject.created_at,
                files: filesWithDetails
            };
        }));

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

