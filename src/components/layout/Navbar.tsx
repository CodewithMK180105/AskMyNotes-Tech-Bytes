"use client";

import { usePathname } from "next/navigation";
import { useSubjects } from "@/components/providers/SubjectsProvider";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, LogOut, Loader2, Menu } from "lucide-react";

export function Navbar() {
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

    const activeSubject = subjects.find((s) => s.id === activeSubjectId);

    const getPageTitle = () => {
        switch (pathname) {
            case "/dashboard":
                return "My Subjects";
            case "/dashboard/chat":
                return "Chat";
            case "/dashboard/study":
                return "Study Mode";
            default:
                return "Dashboard";
        }
    };

    return (
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-6 z-40 sticky top-0">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 mt-2 rounded-xl">
                            <DropdownMenuItem asChild>
                                <a href="/dashboard" className="cursor-pointer">Dashboard</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/dashboard/chat" className="cursor-pointer">Chat</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/dashboard/study" className="cursor-pointer">Study Mode</a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Subjects</DropdownMenuLabel>
                            {subjects.map(sub => (
                                <DropdownMenuItem
                                    key={sub.id}
                                    onClick={() => setActiveSubjectId(sub.id)}
                                    className="cursor-pointer gap-2"
                                >
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: `var(--${sub.color}-500)` }}
                                    />
                                    <span className="truncate">{sub.name}</span>
                                    {sub.id === (activeSubjectId || subjects[0]?.id) && (
                                        <span className="ml-auto text-xs text-muted-foreground">Active</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href="/dashboard" className="cursor-pointer text-indigo-500 font-medium">+ Add Subject</a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h1 className="text-xl font-heading font-semibold text-foreground hidden sm:block">
                    {getPageTitle()}
                </h1>

                {/* Subject Selector — only show when there are subjects */}
                {subjects.length > 0 && (
                    <div className="hidden sm:flex md:ml-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 h-9 rounded-xl border-border">
                                    <span className="truncate max-w-[150px]">
                                        {activeSubject?.name || subjects[0].name}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px] rounded-xl">
                                <DropdownMenuLabel>Select Subject</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {subjects.map((sub) => (
                                    <DropdownMenuItem
                                        key={sub.id}
                                        className="rounded-lg gap-2 cursor-pointer"
                                        onClick={() => setActiveSubjectId(sub.id)}
                                    >
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: `var(--${sub.color}-500)` }}
                                        />
                                        <span className="truncate">{sub.name}</span>
                                        {sub.id === (activeSubjectId || subjects[0]?.id) && (
                                            <span className="ml-auto text-xs text-muted-foreground">Active</span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* User Dropdown — now powered by Firebase Auth */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 rounded-full pl-2 pr-4 bg-secondary/50 hover:bg-secondary gap-2 border border-border"
                        >
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {initials || <Loader2 className="h-3 w-3 animate-spin" />}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline-block">
                                {displayName.split(" ")[0]}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">{email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-red-500 focus:text-red-500"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
