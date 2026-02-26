"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const GradientButton = React.forwardRef<
    HTMLButtonElement,
    GradientButtonProps
>(
    (
        {
            className,
            children,
            isLoading,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-out",
                    "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-[length:200%_auto] hover:bg-right hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);
GradientButton.displayName = "GradientButton";
