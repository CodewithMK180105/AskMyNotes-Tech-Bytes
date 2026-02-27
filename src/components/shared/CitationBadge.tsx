"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CitationBadgeProps {
    filename: string;
    page?: number | string;
    className?: string;
}

export function CitationBadge({ filename, page, className }: CitationBadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-medium text-indigo-500 transition-colors hover:bg-indigo-500/20",
                className
            )}
        >
            <FileText className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{filename}</span>
            {page && (
                <>
                    <span className="opacity-40 px-0.5">|</span>
                    <span>Ref: {page}</span>
                </>
            )}
        </div>
    );
}
