"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GradientButton } from "@/components/shared/GradientButton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    subjectId: string;
    existingFileCount: number;
}

export function UploadZone({ isOpen, onClose, subjectName, subjectId, existingFileCount }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const newFiles = Array.from(e.dataTransfer.files).filter(
                file => file.type === "application/pdf" || file.type === "text/plain"
            );
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (files.length === 0) return;

        setIsUploading(true);
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    setIsUploading(false);
                    setIsSuccess(true);
                    setTimeout(() => {
                        onClose();
                        // Reset state
                        setTimeout(() => {
                            setFiles([]);
                            setIsSuccess(false);
                            setUploadProgress(0);
                        }, 300);
                    }, 1500);
                }, 500);
            }
            setUploadProgress(progress);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl glassmorphism bg-card/95">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">Upload Notes</DialogTitle>
                    <DialogDescription>
                        Add PDF or TXT files to {subjectName}. Max size 10MB per file.
                    </DialogDescription>
                </DialogHeader>

                {!isSuccess ? (
                    <div className="space-y-6 py-4">
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
                                <p className="text-xs text-muted-foreground">PDF or TXT (MAX. 10MB)</p>
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

                        {files.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground">Selected Files</h4>
                                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {files.map((file, idx) => (
                                        <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <File className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-sm truncate font-medium">{file.name}</span>
                                            </div>
                                            {!isUploading && (
                                                <button
                                                    onClick={() => removeFile(idx)}
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
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Uploading {files.length} files...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress
                                    value={uploadProgress}
                                    className="h-2 bg-secondary flex-1"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
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
                            Your notes have been successfully added to {subjectName}.
                        </p>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}
