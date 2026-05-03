"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
    Sparkles,
    TrendingUp,
    FileText,
    Target,
    Zap,
    ArrowRight,
    BarChart3,
    Clock,
    CheckCircle2,
} from "lucide-react";
export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        try {
            const [statsRes, profileRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/optimize/stats`, {
                    headers: { "auth-token": token },
                }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
                    headers: { "auth-token": token },
                }),
            ]);
            setStats(statsRes.data);
            setProfile(profileRes.data);
        } catch (err) {
            console.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="space-y-8">
                <div className="skeleton h-10 w-64" />
                <div className="grid md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="skeleton h-48 rounded-2xl" />
            </div>
        );
    }
    const statCards = [
        {
            label: "Total Optimizations",
            value: stats?.totalOptimizations || 0,
            icon: FileText,
            color: "from-indigo-500 to-blue-500",
            textColor: "text-indigo-400",
        },
        {
            label: "Completed",
            value: stats?.completedOptimizations || 0,
            icon: CheckCircle2,
            color: "from-emerald-500 to-teal-500",
            textColor: "text-emerald-400",
        },
        {
            label: "Average ATS Score",
            value: `${stats?.averageScore || 0}%`,
            icon: BarChart3,
            color: "from-purple-500 to-pink-500",
            textColor: "text-purple-400",
        },
        {
            label: "Latest Score",
            value: `${stats?.latestScore || 0}%`,
            icon: TrendingUp,
            color: "from-cyan-500 to-blue-500",
            textColor: "text-cyan-400",
        },
    ];
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome back,{" "}
                        <span className="gradient-text">
                            {profile?.user?.name || "User"}
                        </span>
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Here&apos;s your resume optimization overview
                    </p>
                </div>
                <Link
                    href="/dashboard/optimize"
                    className="btn-primary text-sm"
                >
                    <Sparkles size={16} />
                    New Optimization
                </Link>
            </div>
            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="stat-card group">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}
                                >
                                    <Icon size={18} className="text-white" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {card.value}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                {card.label}
                            </div>
                        </div>
                    );
                })}
            </div>
            {}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    {
                        title: "Optimize Resume",
                        desc: "Upload your resume + paste a job link to get ATS-optimized results",
                        icon: Sparkles,
                        href: "/dashboard/optimize",
                        color: "from-indigo-500 to-purple-500",
                        primary: true,
                    },
                    {
                        title: "Match Job",
                        desc: "See how well your current resume matches a specific job description",
                        icon: Target,
                        href: "/dashboard/match",
                        color: "from-cyan-500 to-blue-500",
                        primary: false,
                    },
                    {
                        title: "Generate Email",
                        desc: "Create a professional cover letter email for any company",
                        icon: Zap,
                        href: "/dashboard/email",
                        color: "from-purple-500 to-pink-500",
                        primary: false,
                    },
                ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={i}
                            href={action.href}
                            className={`glass-card p-6 group cursor-pointer ${
                                action.primary
                                    ? "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5"
                                    : ""
                            }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                            >
                                <Icon size={22} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {action.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                {action.desc}
                            </p>
                            <span className="text-indigo-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Get started{" "}
                                <ArrowRight size={14} />
                            </span>
                        </Link>
                    );
                })}
            </div>
            {}
            {stats?.latestOptimizationId && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            Latest Optimization
                        </h3>
                        <Link
                            href={`/dashboard/results?id=${stats.latestOptimizationId}`}
                            className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center gap-1"
                        >
                            View Full Results <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="flex items-center gap-8">
                        {}
                        <div className="score-ring">
                            <svg width="80" height="80">
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="rgba(155,142,199,0.35)"
                                    strokeWidth="8"
                                    fill="transparent"
                                />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={201}
                                    strokeDashoffset={
                                        201 -
                                        (201 * (stats?.latestScore || 0)) / 100
                                    }
                                    style={{
                                        transition: "stroke-dashoffset 1.5s ease",
                                    }}
                                />
                                <defs>
                                    <linearGradient
                                        id="scoreGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#9b8ec7" />
                                        <stop
                                            offset="100%"
                                            stopColor="#bda6ce"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="score-value text-lg">
                                {stats?.latestScore || 0}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-slate-400 mb-2">
                                ATS Compatibility Score
                            </div>
                            <div className="progress-bar w-full max-w-md">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${stats?.latestScore || 0}%`,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-slate-500 mt-2">
                                {(stats?.latestScore || 0) >= 80
                                    ? "🎯 Great score! Your resume is very ATS-friendly."
                                    : (stats?.latestScore || 0) >= 60
                                    ? "📊 Good start. Check suggestions to improve further."
                                    : "⚡ Room for improvement. Optimize with our AI."}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {}
            <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
                    <span className="text-sm font-semibold text-white">Bytez API Processing Active</span>
                </div>
                <p className="text-slate-400 text-sm">
                    Background processing is handled through Bytez API calls from the backend.
                    Jobs are queued and processed automatically.
                </p>
            </div>
        </div>
    );
}
