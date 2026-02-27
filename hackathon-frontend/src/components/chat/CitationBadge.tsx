"use client";

import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CitationBadgeProps {
    filename: string;
    page: number;
}

export function CitationBadge({ filename, page }: CitationBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className="gap-1 px-2 py-0.5 text-xs font-normal border-white/10 hover:border-indigo-500/50 hover:bg-secondary cursor-pointer transition-colors"
        >
            <FileText className="h-3 w-3 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[120px]">{filename}</span>
            <span className="text-muted-foreground ml-1">p.{page}</span>
        </Badge>
    );
}
