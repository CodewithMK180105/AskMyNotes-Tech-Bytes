import { NextRequest, NextResponse } from "next/server";
import { deleteSubject, getSubjectFiles } from "@/lib/db";
import imagekit from "@/lib/imagekit";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+, dynamic route params are a promise
) {
    try {
        const p = await params;
        const subjectId = p.id;

        // Find user by querying params or standard method
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId || !subjectId) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters" },
                { status: 400 }
            );
        }

        // ── Step 1: Get all files for this subject ────────────
        const files = await getSubjectFiles(subjectId);

        // ── Step 2: Delete files from ImageKit ────────────────
        if (files.length > 0) {
            const fileIds = files
                .map(f => f.imagekit_file_id)
                .filter((id): id is string => !!id);

            if (fileIds.length > 0) {
                try {
                    // Node SDK v7 uses bulk delete or individual deletes. 
                    // To be safe based on previous debugging, we'll delete them
                    for (const fileId of fileIds) {
                        await (imagekit as any).files.delete(fileId);
                    }
                    console.log(`[DELETE /api/subjects/[id]] Deleted ${fileIds.length} files from ImageKit`);
                } catch (ikError) {
                    console.warn(`[DELETE /api/subjects/[id]] ImageKit cleanup warning:`, ikError);
                }
            }
        }

        // ── Step 3: Delete subject from DB ────────────────────
        // (This should cascade delete rows in subject_files, mcq_questions, etc. if FKs are set to CASCADE)
        const success = await deleteSubject(subjectId, userId);

        if (!success) {
            throw new Error("Failed to delete subject");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/subjects/[id]] error:", error);
        return NextResponse.json(
            { success: false, message: "Server error deleting subject" },
            { status: 500 }
        );
    }
}
