import { NextRequest, NextResponse } from "next/server";
import { deleteSubject } from "@/lib/db";

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
