"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GradientButton } from "@/components/shared/GradientButton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadMultipleNotes } from "@/lib/api";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { useAuth } from "@/components/providers/AuthProvider";

const MAX_FILES_PER_SUBJECT = 3;

interface UploadZoneProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    subjectName: string;
    /** How many files this subject already has */
    existingFileCount: number;
}

export function UploadZone({ isOpen, onClose, subjectId, subjectName, existingFileCount }: UploadZoneProps) {
    const { addFileToSubject, subjects } = useSubjects();
    const { user } = useAuth();
    const subjectColor = subjects.find((s) => s.id === subjectId)?.color || "indigo";

    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFileName, setCurrentFileName] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const slotsRemaining = MAX_FILES_PER_SUBJECT - existingFileCount;
    const canAddMore = slotsRemaining > 0;

    const addFiles = (incoming: File[]) => {
        setFiles((prev) => {
            const totalAfter = prev.length + existingFileCount;
            const allowed = MAX_FILES_PER_SUBJECT - totalAfter;
            if (allowed <= 0) return prev;
            const valid = incoming
                .filter((f) => f.type === "application/pdf" || f.type === "text/plain")
                .slice(0, allowed);
            return [...prev, ...valid];
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files));
        }
        // Reset the input so the same file can be re-selected if needed
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadErrors([]);
        setCurrentFileName(files[0]?.name || "");

        try {
            const { results, errors } = await uploadMultipleNotes(
                files,
                subjectName,
                (completed, total, currentFile) => {
                    const progress = Math.round((completed / total) * 100);
                    setUploadProgress(progress);
                    setCurrentFileName(currentFile);
                },
                {
                    userId: user?.id || "anonymous",
                    subjectColor,
                    subjectId,
                }
            );

            setIsUploading(false);

            // Register successfully uploaded files in the subjects context
            results.forEach((result, idx) => {
                if (result.success !== false) {
                    const uploadedFile = files[idx];
                    if (uploadedFile) {
                        addFileToSubject(subjectId, {
                            id: `file_${Date.now()}_${idx}`,
                            name: uploadedFile.name,
                            size: `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`,
                            pages: 0, // unknown at upload time
                            uploaded_at: new Date().toISOString().split("T")[0],
                        });
                    }
                }
            });

            if (errors.length > 0) {
                setUploadErrors(errors);
                if (errors.length < files.length) {
                    setIsSuccess(true);
                    setTimeout(() => {
                        onClose();
                        setTimeout(() => {
                            setFiles([]);
                            setIsSuccess(false);
                            setUploadProgress(0);
                            setUploadErrors([]);
                        }, 300);
                    }, 3000);
                }
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setTimeout(() => {
                        setFiles([]);
                        setIsSuccess(false);
                        setUploadProgress(0);
                    }, 300);
                }, 1500);
            }
        } catch (err) {
            setIsUploading(false);
            const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
            setUploadErrors([message]);
        }
    };

    const resetState = () => {
        setFiles([]);
        setIsSuccess(false);
        setUploadProgress(0);
        setUploadErrors([]);
        setCurrentFileName("");
    };

    const totalSelected = files.length + existingFileCount;
    const atCapacity = totalSelected >= MAX_FILES_PER_SUBJECT;

    return (
        <Dialog open={isOpen} onOpenChange={() => { onClose(); setTimeout(resetState, 300); }}>
            <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[500px] max-h-[95vh] rounded-2xl glassmorphism bg-card/95 overflow-hidden flex flex-col px-4 sm:px-6">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">Upload Notes</DialogTitle>
                    <DialogDescription>
                        Add PDF or TXT files to <strong>{subjectName}</strong>.
                        {" "}Max <strong>{MAX_FILES_PER_SUBJECT} files</strong> per subject
                        {existingFileCount > 0 && ` (${existingFileCount} already uploaded)`}.
                    </DialogDescription>
                </DialogHeader>

                {!isSuccess ? (
                    <div className="space-y-5 py-2 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {/* File capacity indicator */}
                        <div className="flex items-center gap-2 px-1">
                            <div className="flex gap-1">
                                {Array.from({ length: MAX_FILES_PER_SUBJECT }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-2 rounded-full flex-1 transition-all duration-300",
                                            i < existingFileCount
                                                ? "bg-indigo-500 w-8"
                                                : i < totalSelected
                                                    ? "bg-violet-400 w-8"
                                                    : "bg-secondary w-8"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                                {existingFileCount}/{MAX_FILES_PER_SUBJECT} slots used
                                {files.length > 0 && ` (+${files.length} queued)`}
                            </span>
                        </div>

                        {/* Drop zone */}
                        {canAddMore && files.length < slotsRemaining ? (
                            <div
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden group",
                                    isDragging
                                        ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                        : "border-border hover:border-indigo-500/50 hover:bg-white/5",
                                    isUploading && "pointer-events-none opacity-50"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isDragging && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-20 animate-pulse" />
                                )}

                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 px-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                                        isDragging ? "bg-indigo-500 text-white" : "bg-secondary text-muted-foreground group-hover:text-indigo-500"
                                    )}>
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <p className="mb-1 text-sm text-foreground font-medium">
                                        <span className="text-indigo-500">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF or TXT — up to {slotsRemaining - files.length} more file{slotsRemaining - files.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.txt"
                                    multiple
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5">
                                <Info className="h-5 w-5 text-amber-500 shrink-0" />
                                <p className="text-sm text-amber-500">
                                    {existingFileCount >= MAX_FILES_PER_SUBJECT
                                        ? `This subject already has ${MAX_FILES_PER_SUBJECT} files (maximum reached).`
                                        : `You've selected the maximum number of files for this upload.`}
                                </p>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground">
                                    Selected Files <span className="text-muted-foreground">({files.length}/{slotsRemaining} slots)</span>
                                </h4>
                                <div className="max-h-[140px] overflow-y-auto overflow-x-hidden space-y-2 pr-1 custom-scrollbar">
                                    {files.map((file, idx) => (
                                        <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-white/5 overflow-hidden w-full max-w-full">
                                            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                                <File className="w-4 h-4 text-primary shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-sm truncate font-medium block">{file.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </span>
                                                </div>
                                            </div>
                                            {!isUploading && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div className="py-4 flex flex-col items-center justify-center space-y-4 w-full overflow-hidden max-w-full">
                                <motion.img
                                    src="/icon.svg"
                                    className="h-10 w-10 overflow-hidden rounded-full shrink-0"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                <p className="text-sm text-muted-foreground animate-pulse text-center w-full px-2 truncate block max-w-[85vw] sm:max-w-[400px]">
                                    Uploading {currentFileName ? `"${currentFileName}"` : `${files.length} files`}...
                                </p>
                            </div>
                        )}

                        {uploadErrors.length > 0 && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 max-w-full overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    <span className="text-sm font-medium text-red-500 truncate">Upload Errors</span>
                                </div>
                                <div className="space-y-1 overflow-auto max-h-24">
                                    {uploadErrors.map((error, idx) => (
                                        <p key={idx} className="text-xs text-red-400 break-words">{error}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 pb-2 shrink-0">
                            <Button variant="ghost" onClick={onClose} disabled={isUploading}>
                                Cancel
                            </Button>
                            <GradientButton
                                onClick={handleUpload}
                                disabled={files.length === 0 || isUploading}
                                isLoading={isUploading}
                            >
                                Upload {files.length > 0 && `(${files.length})`}
                            </GradientButton>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-10"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15, delay: 0.1 }}
                            className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
                        <p className="text-muted-foreground text-center">
                            Your notes have been successfully uploaded to the subject "{subjectName}".
                        </p>
                        {uploadErrors.length > 0 && (
                            <p className="text-xs text-amber-500 mt-2 text-center">
                                Note: {uploadErrors.length} file(s) had errors. Successfully uploaded {files.length - uploadErrors.length} file(s).
                            </p>
                        )}
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}
