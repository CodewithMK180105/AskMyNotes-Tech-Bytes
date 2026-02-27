import { NextRequest, NextResponse } from "next/server";
import { deleteSubjectFile } from "@/lib/db";
import imagekit from "@/lib/imagekit";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Reusing the same pattern as subject delete
) {
    try {
        const p = await params;
        const fileId = (p as any).id; // Actually fileId in this context if we name the folder [id]

        const deletedFile = await deleteSubjectFile(fileId);

        if (!deletedFile) {
            return NextResponse.json(
                { success: false, message: "File not found or failed to delete from database" },
                { status: 404 }
            );
        }

        // Try to delete from ImageKit if we have a file ID
        if (deletedFile.imagekit_file_id) {
            try {
                await (imagekit as any).files.delete(deletedFile.imagekit_file_id);
                console.log(`[DELETE /api/subjects/files] Deleted file ${deletedFile.imagekit_file_id} from ImageKit`);
            } catch (ikError) {
                console.warn(`[DELETE /api/subjects/files] Failed to delete from ImageKit:`, ikError);
                // We don't fail the whole request if ImageKit fails, as the DB entry is already gone
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/subjects/files] error:", error);
        return NextResponse.json(
            { success: false, message: "Server error deleting file" },
            { status: 500 }
        );
    }
}
