import Sidebar from "@/components/Sidebar";
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[rgb(242,234,224)]">
            <div className="bg-mesh" />
            <Sidebar />
            <main className="flex-1 ml-72 main-content-shift p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
