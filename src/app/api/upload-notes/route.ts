// ─────────────────────────────────────────────────────────
// API Proxy: Upload Notes → ImageKit → Supabase → n8n
// ─────────────────────────────────────────────────────────
// Flow:
//  1. Receive file + subject + userId from frontend
//  2. Upload file to ImageKit → get public URL
//  3. Upsert subject in Supabase subjects table
//  4. Insert file record (imagekit_url) in subject_files table
//  5. POST { fileName, fileUrl, subject } to n8n webhook-test
// ─────────────────────────────────────────────────────────

// ── Route Segment Config ───────────────────────────────────
// Raise the execution timeout so large PDF uploads don't hit the
// default 10s Next.js limit. The body size limit is raised in
// next.config.ts via experimental.serverActions.bodySizeLimit.
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds

import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagekit";
import { toFile } from "@imagekit/nodejs";
import { upsertSubject, insertSubjectFile, getSubjectFileCount } from "@/lib/db";

const N8N_UPLOAD_URL =
    "https://nikunjn8n.up.railway.app/webhook/upload-notes";

const MAX_FILES_PER_SUBJECT = 3;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const subject = formData.get("subject") as string | null;
        const subjectColor = (formData.get("subjectColor") as string) || "indigo";
        // Firebase UID — sent from frontend so we can store per-user data
        const userId = (formData.get("userId") as string) || "anonymous";

        if (!file || !subject) {
            return NextResponse.json(
                { success: false, message: "Missing file or subject" },
                { status: 400 }
            );
        }

        // ── Step 1: Upsert subject in Supabase ────────────────
        const shortName = subject.substring(0, 4).toUpperCase();
        const subjectRow = await upsertSubject(userId, subject, shortName, subjectColor);
        console.log(`[upload-notes] Upserted subject:`, subjectRow?.id || "NULL");

        if (subjectRow) {
            // Enforce max 3 files per subject on the server side too
            const fileCount = await getSubjectFileCount(subjectRow.id);
            if (fileCount >= MAX_FILES_PER_SUBJECT) {
                return NextResponse.json(
                    { success: false, message: `Maximum ${MAX_FILES_PER_SUBJECT} files allowed per subject.` },
                    { status: 400 }
                );
            }
        }

        // ── Step 2: Upload to ImageKit ─────────────────────────
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(
            `[upload-notes] Uploading "${file.name}" (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB) to ImageKit...`
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let ikResult: any;
        try {
            // @imagekit/nodejs v7: files.upload() takes an Uploadable file.
            // toFile() wraps a Buffer into the correct Uploadable shape.
            ikResult = await imagekit.files.upload({
                file: await toFile(buffer, file.name, { type: file.type }),
                fileName: file.name,
                folder: "/AskMyNotes/notes/",
                useUniqueFileName: true,
            });
        } catch (ikError: unknown) {
            // Surface the real ImageKit error — don't swallow it as a generic 502.
            const ikMessage =
                ikError instanceof Error
                    ? ikError.message
                    : JSON.stringify(ikError);
            console.error("[upload-notes] ImageKit upload error:", ikMessage);
            return NextResponse.json(
                { success: false, message: `ImageKit upload failed: ${ikMessage}` },
                { status: 502 }
            );
        }

        const fileUrl: string = ikResult.url;
        const fileId: string = ikResult.fileId;
        console.log(`[upload-notes] ImageKit upload success. URL: ${fileUrl}`);

        // ── Step 3: Save file record to Supabase ───────────────
        if (subjectRow) {
            const fileRow = await insertSubjectFile(subjectRow.id, file.name, fileUrl, fileId);
            console.log(`[upload-notes] Inserted file record:`, fileRow?.id || "NULL");
        }

        // ── Step 4: Notify n8n webhook-test (Asynchronous) ─────
        const n8nPayload = {
            fileName: file.name,
            fileUrl,
            subject,
            subjectId: subjectRow?.id || null,
            imageKitFileId: fileId,
        };

        // Fire and forget n8n notification
        fetch(N8N_UPLOAD_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(n8nPayload),
        }).catch(err => {
            console.warn("[upload-notes] Background n8n error:", err);
        });

        // Return immediately after Step 3
        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            fileUrl,
            subjectId: subjectRow?.id,
        });

    } catch (error) {
        console.error("[upload-notes proxy] Unhandled error:", error);
        const message =
            error instanceof Error ? error.message : "Proxy request failed";
        return NextResponse.json(
            { success: false, message },
            { status: 502 }
        );
    }
}
