"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    Menu,
    LayoutDashboard,
    MessageSquare,
    GraduationCap,
    Plus,
    LogOut,
    Bot,
} from "lucide-react";
import { CiGift } from "react-icons/ci";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { subjects, activeSubjectId, setActiveSubjectId } = useSubjects();

    // Derive display info from Firebase user
    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    const email = user?.email || "";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);


    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/history", label: "History", icon: MessageSquare },
        {
            href: "/dashboard/study",
            label: "Study Mode",
            icon: GraduationCap,
        },
        {
            href: "/dashboard/chat",
            label: "Chat",
            icon: Bot,
        },
        {
            href: "/dashboard/reedem",
            label: "Reedem",
            icon: CiGift,
        },
    ];

    return (
        <motion.aside
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 72 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden md:flex h-screen bg-card border-r border-border flex-col shrink-0 sticky top-0 z-50 print:hidden"
        >
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-border justify-between">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-heading font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 select-none"
                    >
                        AskMyNotes
                    </motion.div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn("ml-auto", isCollapsed && "mx-auto ml-0")}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 scrollbar-hide">
                {/* Navigation */}
                <div className="px-3 space-y-1">
                    {links.map((link) => {
                        const isActive = link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
                        const isStudyMode = link.label === "Study Mode";

                        return (
                            <div key={link.href} className="space-y-1">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <link.icon
                                                className={cn("h-5 w-5 shrink-0", isActive && "text-primary")}
                                            />
                                            {!isCollapsed && <span>{link.label}</span>}
                                        </Link>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right">{link.label}</TooltipContent>
                                    )}
                                </Tooltip>

                            </div>
                        );
                    })}
                </div>

                {/* Subjects */}
                <div className="px-3">
                    {!isCollapsed && (
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                            Your Subjects
                        </h4>
                    )}
                    <div className="space-y-1">
                        {subjects.length === 0 && !isCollapsed && (
                            <p className="text-xs text-muted-foreground px-3 py-2">
                                No subjects yet. Add one below.
                            </p>
                        )}
                        {subjects.map((subject) => {
                            const isActive = subject.id === activeSubjectId;
                            return (
                                <Tooltip key={subject.id} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setActiveSubjectId(subject.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left",
                                                isActive
                                                    ? "bg-secondary text-foreground border-l-2 border-primary"
                                                    : "text-muted-foreground hover:bg-secondary/50 border-l-2 border-transparent"
                                            )}
                                        >
                                            <div
                                                className={cn("h-2 w-2 rounded-full shrink-0")}
                                                style={{ backgroundColor: `var(--${subject.color}-500)` }}
                                            />
                                            {!isCollapsed && <span className="truncate">{subject.name}</span>}
                                        </button>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right">{subject.name}</TooltipContent>
                                    )}
                                </Tooltip>
                            );
                        })}
                    </div>

                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <div className="mt-4 px-3">
                                <Link href="/dashboard">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 border-dashed border-2 rounded-xl text-muted-foreground hover:text-foreground",
                                            isCollapsed ? "px-0" : ""
                                        )}
                                        disabled={subjects.length >= 3}
                                        asChild={false}
                                    >
                                        <Plus className="h-4 w-4 shrink-0" />
                                        {!isCollapsed && <span>Add Subject</span>}
                                    </Button>
                                </Link>
                            </div>
                        </TooltipTrigger>
                        {subjects.length >= 3 ? (
                            <TooltipContent side={isCollapsed ? "right" : "bottom"}>
                                Maximum 3 subjects reached
                            </TooltipContent>
                        ) : isCollapsed ? (
                            <TooltipContent side="right">Add Subject</TooltipContent>
                        ) : null}
                    </Tooltip>
                </div>
            </div>

            {/* Footer — real Firebase user info + working logout */}
            <div className="p-4 border-t border-border flex flex-col gap-4">
                <div
                    className={cn(
                        "flex items-center gap-3",
                        isCollapsed && "justify-center"
                    )}
                >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {initials}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{email}</p>
                        </div>
                    )}
                </div>

                {!isCollapsed ? (
                    <div className="flex items-center justify-between">
                        <ThemeToggle />
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Log out</TooltipContent>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 items-center">
                        <ThemeToggle />
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Log out</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </div>
        </motion.aside>
    );
}
