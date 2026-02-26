import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { SubjectsProvider } from "@/components/providers/SubjectsProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SubjectsProvider>
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
                        {children}
                    </main>
                </div>
            </div>
        </SubjectsProvider>
    );
}
