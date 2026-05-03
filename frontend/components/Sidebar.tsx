"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Sparkles,
    FileText,
    History,
    Briefcase,
    Mail,
    User,
    LogOut,
    Zap,
    ChevronRight,
} from "lucide-react";
export default function Sidebar() {
    const pathname = usePathname();
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };
    const mainNav = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Optimize Resume", href: "/dashboard/optimize", icon: Sparkles },
        { name: "Results", href: "/dashboard/results", icon: Zap },
        { name: "History", href: "/dashboard/history", icon: History },
    ];
    const toolsNav = [
        { name: "Upload Resume", href: "/dashboard/upload", icon: FileText },
        { name: "Match Job", href: "/dashboard/match", icon: Briefcase },
        { name: "Email Generator", href: "/dashboard/email", icon: Mail },
        { name: "My Profile", href: "/dashboard/profile", icon: User },
    ];
    const matchedJobsNav = [
        {
            name: "Jobs For My Resume",
            href: "/dashboard/jobs",
            activePath: "/dashboard/jobs",
            icon: Briefcase,
        },
        {
            name: "LinkedIn Job Posts",
            href: "/dashboard/jobs?view=linkedin-posts",
            activePath: "/dashboard/jobs",
            icon: Briefcase,
        },
    ];
    return (
        <div className="sidebar-desktop h-screen w-72 bg-[rgba(242,234,224,0.95)] text-white flex flex-col fixed z-50 border-r border-[rgba(155,142,199,0.24)]">
            {}
            <div className="p-6 pb-4">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight gradient-text">
                            ResumeAI
                        </h1>
                        <p className="text-[10px] uppercase tracking-[3px] text-slate-500 font-medium">
                            Optimizer
                        </p>
                    </div>
                </Link>
            </div>
            {}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                <p className="text-[11px] uppercase tracking-[2px] text-slate-600 font-semibold px-3 mb-2 mt-2">
                    Main
                </p>
                {mainNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                isActive
                                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30"
                                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />
                            )}
                            <Icon
                                size={18}
                                className={
                                    isActive
                                        ? "text-indigo-400"
                                        : "text-slate-500 group-hover:text-indigo-400 transition-colors"
                                }
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                            {isActive && (
                                <ChevronRight
                                    size={14}
                                    className="ml-auto text-indigo-400"
                                />
                            )}
                        </Link>
                    );
                })}
                <p className="text-[11px] uppercase tracking-[2px] text-slate-600 font-semibold px-3 mb-2 mt-6">
                    Resume Match
                </p>
                {matchedJobsNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.activePath;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                isActive
                                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30"
                                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />
                            )}
                            <Icon
                                size={18}
                                className={
                                    isActive
                                        ? "text-indigo-400"
                                        : "text-slate-500 group-hover:text-indigo-400 transition-colors"
                                }
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                            {isActive && (
                                <ChevronRight
                                    size={14}
                                    className="ml-auto text-indigo-400"
                                />
                            )}
                        </Link>
                    );
                })}
                <p className="text-[11px] uppercase tracking-[2px] text-slate-600 font-semibold px-3 mb-2 mt-6">
                    Tools
                </p>
                {toolsNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                isActive
                                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30"
                                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />
                            )}
                            <Icon
                                size={18}
                                className={
                                    isActive
                                        ? "text-indigo-400"
                                        : "text-slate-500 group-hover:text-indigo-400 transition-colors"
                                }
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            {}
            <div className="px-4 py-3">
                <div className="glass-card p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-yellow-400" />
                        <span className="text-sm font-bold text-white">
                            Upgrade to Pro
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                        Unlimited optimizations, premium templates & priority AI
                    </p>
                    <button className="w-full py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                        ₹299/month →
                    </button>
                </div>
            </div>
            {}
            <div className="px-3 pb-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all w-full group"
                >
                    <LogOut
                        size={18}
                        className="group-hover:text-red-400 transition-colors"
                    />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
