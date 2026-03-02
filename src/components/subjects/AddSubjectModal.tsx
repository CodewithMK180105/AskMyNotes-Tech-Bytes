"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GradientButton } from "@/components/shared/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => void;
}

export function AddSubjectModal({ isOpen, onClose, onAdd }: AddSubjectModalProps) {
    const [subjectName, setSubjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectName.trim()) return;

        setIsLoading(true);
        onAdd(subjectName.trim());
        setIsLoading(false);
        setSubjectName("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl glassmorphism bg-card/95">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">Add New Subject</DialogTitle>
                    <DialogDescription>
                        Create a new subject to organize your study notes. You can have up to 3 subjects.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject-name">Subject Name</Label>
                        <Input
                            id="subject-name"
                            placeholder="e.g. Machine Learning"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <GradientButton
                            type="submit"
                            disabled={!subjectName.trim() || isLoading}
                            isLoading={isLoading}
                            leftIcon={<Plus className="h-4 w-4" />}
                        >
                            Create Subject
                        </GradientButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
