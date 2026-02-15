"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Briefcase, Mail, LogOut } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const menuItems = [
        { name: "Upload Resume", href: "/dashboard", icon: FileText },
        { name: "My Profile", href: "/dashboard/profile", icon: FileText },
        { name: "Jobs & Applications", href: "/dashboard/jobs", icon: Briefcase },
        { name: "Match Job", href: "/dashboard/match", icon: Briefcase },
        { name: "Email Generator", href: "/dashboard/email", icon: Mail },
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4 fixed">
            <h1 className="text-2xl font-bold mb-8 text-center text-blue-400">ResumeMatch</h1>
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-blue-600" : "hover:bg-gray-800"
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition-colors mt-auto"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
    );
}
