"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
    const dotVariants = {
        start: { y: 0 },
        end: { y: -5 },
    };

    const containerVariants = {
        start: {
            transition: {
                staggerChildren: 0.15,
                repeat: Infinity,
                repeatType: "reverse" as const,
            },
        },
        end: {
            transition: {
                staggerChildren: 0.15,
                repeat: Infinity,
                repeatType: "reverse" as const,
            },
        },
    };

    return (
        <div className="flex items-center gap-2 p-4 glassmorphism-card w-16 h-10 shadow-md animate-in fade-in slide-in-from-bottom-2">
            <motion.div
                variants={containerVariants}
                initial="start"
                animate="end"
                className="flex gap-1"
            >
                <motion.span
                    variants={dotVariants}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                />
                <motion.span
                    variants={dotVariants}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                    className="w-1.5 h-1.5 bg-violet-500 rounded-full"
                />
                <motion.span
                    variants={dotVariants}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                    className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
                />
            </motion.div>
        </div>
    );
}
