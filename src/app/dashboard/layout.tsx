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
                    <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 lg:px-16 lg:py-12 relative">
                        {children}
                    </main>
                </div>
            </div>
        </SubjectsProvider>
    );
}
