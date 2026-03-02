import { AnimatedMeshBackground } from "@/components/shared/AnimatedMeshBackground";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <AnimatedMeshBackground />

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md z-10 flex flex-col items-center">
                <div
                    className="flex items-center gap-2 mb-8 group transition-transform hover:scale-105 cursor-default"
                >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-heading font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500">
                        AskMyNotes
                    </span>
                </div>

                {children}
            </div>
        </div>
    );
}
