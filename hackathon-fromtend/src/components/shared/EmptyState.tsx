import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Icon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-heading text-foreground mb-2">
                {title}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
