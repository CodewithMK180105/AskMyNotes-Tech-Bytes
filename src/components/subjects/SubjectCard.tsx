"use client";

import { useState } from "react";
import { Subject } from "@/lib/types";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MoreVertical, Trash2, Upload, ChevronDown, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
    subject: Subject;
    onUploadClick: (subjectId: string) => void;
}

export function SubjectCard({ subject, onUploadClick }: SubjectCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteSubject } = useSubjects();

    const handleDelete = async () => {
        setIsDeleting(true);
        const success = await deleteSubject(subject.id);
        if (!success) {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glassmorphism-card overflow-hidden group flex flex-col"
        >
            <div
                className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    `from-${subject.color}-400 to-${subject.color}-600`
                )}
                style={{
                    backgroundImage: `linear-gradient(to right, var(--${subject.color}-400), var(--${subject.color}-600))`,
                }}
            />

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: `var(--${subject.color}-500)` }}
                            />
                            <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-1">
                                {subject.name}
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground pl-4">
                            {subject.files.length} files • Updated {new Date(subject.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive cursor-pointer gap-2 rounded-lg"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-auto space-y-3">
                    <Button
                        onClick={() => onUploadClick(subject.id)}
                        variant="secondary"
                        className="w-full gap-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Upload Notes
                    </Button>

                    {subject.files.length > 0 && (
                        <div className="border-t border-border pt-3">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>View Files</span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        isExpanded && "rotate-180"
                                    )}
                                />
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-3 space-y-2">
                                            {subject.files.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-white/5 group/file hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FileText className="h-4 w-4 text-primary shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {file.size} • {file.pages} pages
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover/file:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
