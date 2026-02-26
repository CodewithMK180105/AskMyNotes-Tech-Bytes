"use client";

import { usePathname } from "next/navigation";
import { dummySubjects, dummyUser } from "@/lib/dummy-data";
import { ThemeToggle } from "./ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, LogOut } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

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
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-heading font-semibold text-foreground">
                    {getPageTitle()}
                </h1>

                {/* Subject Selector (Dummy) */}
                <div className="hidden sm:flex ml-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 h-9 rounded-xl border-border">
                                <span className="truncate max-w-[150px]">
                                    {dummySubjects[0].name}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] rounded-xl">
                            <DropdownMenuLabel>Select Subject</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {dummySubjects.map((sub, idx) => (
                                <DropdownMenuItem
                                    key={sub.id}
                                    className="rounded-lg gap-2 cursor-pointer"
                                >
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: `var(--${sub.color}-500)` }}
                                    />
                                    <span className="truncate">{sub.name}</span>
                                    {idx === 0 && (
                                        <span className="ml-auto text-xs text-muted-foreground">Active</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 rounded-full pl-2 pr-4 bg-secondary/50 hover:bg-secondary gap-2 border border-border"
                        >
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {dummyUser.avatar_initials}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline-block">
                                {dummyUser.name.split(" ")[0]}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{dummyUser.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {dummyUser.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg text-red-500 focus:text-red-500">
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
