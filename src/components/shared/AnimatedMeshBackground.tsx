"use client";

export function AnimatedMeshBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 blur-[100px] animate-blob" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-violet-500/20 dark:bg-violet-500/10 blur-[100px] animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 dark:bg-cyan-500/10 blur-[120px] animate-blob animation-delay-4000" />
        </div>
    );
}
