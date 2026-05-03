"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
    History,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    ArrowRight,
    Sparkles,
    BarChart3,
    Trash2,
} from "lucide-react";
export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchHistory();
    }, []);
    const fetchHistory = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/optimize/history`,
                { headers: { "auth-token": token } }
            );
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        Completed
                    </span>
                );
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                        <Loader2 size={12} className="animate-spin" />
                        Processing
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                        <Clock size={12} />
                        Pending
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-medium border border-red-500/20">
                        <XCircle size={12} />
                        Failed
                    </span>
                );
            default:
                return null;
        }
    };
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="skeleton h-10 w-64" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
            </div>
        );
    }
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <History className="text-indigo-400" size={28} />
                        Optimization History
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Track all your past resume optimizations
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
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        label: "Total",
                        value: history.length,
                        icon: FileText,
                        color: "text-indigo-400",
                    },
                    {
                        label: "Completed",
                        value: history.filter((h) => h.status === "completed")
                            .length,
                        icon: CheckCircle2,
                        color: "text-emerald-400",
                    },
                    {
                        label: "Avg Score",
                        value: `${
                            history.filter((h) => h.status === "completed")
                                .length > 0
                                ? Math.round(
                                      history
                                          .filter(
                                              (h) => h.status === "completed"
                                          )
                                          .reduce(
                                              (acc, h) =>
                                                  acc + (h.atsScore || 0),
                                              0
                                          ) /
                                          history.filter(
                                              (h) => h.status === "completed"
                                          ).length
                                  )
                                : 0
                        }%`,
                        icon: BarChart3,
                        color: "text-purple-400",
                    },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="stat-card flex items-center gap-4">
                            <Icon size={22} className={stat.color} />
                            <div>
                                <div className="text-xl font-bold text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {}
            {history.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FileText
                        size={48}
                        className="text-slate-600 mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-white mb-2">
                        No optimizations yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Start by optimizing your first resume
                    </p>
                    <Link
                        href="/dashboard/optimize"
                        className="btn-primary"
                    >
                        <Sparkles size={16} />
                        Optimize Now
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item, i) => (
                        <Link
                            key={item._id}
                            href={`/dashboard/results?id=${item._id}`}
                            className="glass-card p-5 flex items-center gap-6 group cursor-pointer hover:border-indigo-500/30"
                        >
                            {}
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                {item.status === "completed" ? (
                                    <span
                                        className={`text-2xl font-bold ${getScoreColor(
                                            item.atsScore
                                        )}`}
                                    >
                                        {item.atsScore}
                                    </span>
                                ) : item.status === "processing" ? (
                                    <Loader2
                                        size={24}
                                        className="text-indigo-400 animate-spin"
                                    />
                                ) : (
                                    <Clock
                                        size={24}
                                        className="text-slate-500"
                                    />
                                )}
                            </div>
                            {}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-white font-semibold truncate">
                                        {item.originalFileName ||
                                            `Optimization #${
                                                history.length - i
                                            }`}
                                    </h3>
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span>
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                    {item.jobUrl && (
                                        <span className="truncate max-w-[200px]">
                                            📎 {item.jobUrl}
                                        </span>
                                    )}
                                    <span className="text-xs">
                                        via{" "}
                                        {item.processingMethod === "bytez"
                                            ? "Bytez"
                                            : "API"}
                                    </span>
                                </div>
                            </div>
                            {}
                            <ArrowRight
                                size={18}
                                className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0"
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
