"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface NotFoundAlertProps {
    message: string;
}

export function NotFoundAlert({ message }: NotFoundAlertProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="max-w-[80%]"
        >
            <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500 rounded-2xl">
                <AlertCircle className="h-5 w-5 !text-amber-600 dark:!text-amber-500" />
                <AlertTitle className="font-semibold text-base mb-1">
                    {message}
                </AlertTitle>
                <AlertDescription className="text-amber-600/80 dark:text-amber-500/80">
                    Try rephrasing your question or uploading more relevant notes to this subject.
                </AlertDescription>
            </Alert>
        </motion.div>
    );
}
