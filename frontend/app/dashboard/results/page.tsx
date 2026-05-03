"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Copy,
    Check,
    Download,
    ArrowLeft,
    Loader2,
    Target,
    TrendingUp,
    Shield,
    Zap,
} from "lucide-react";
import Link from "next/link";
export default function ResultsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-96">
                    <Loader2
                        size={32}
                        className="animate-spin text-indigo-400"
                    />
                </div>
            }
        >
            <ResultsContent />
        </Suspense>
    );
}
function ResultsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const polling = searchParams.get("polling") === "true";
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        if (id) {
            fetchResult();
        } else {
            fetchLatest();
        }
    }, [id]);
    const fetchResult = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/optimize/result/${id}`,
                { headers: { "auth-token": token } }
            );
            setResult(res.data);
            if (
                res.data.status === "processing" ||
                res.data.status === "pending"
            ) {
                setTimeout(fetchResult, 3000);
            }
        } catch (err) {
            setError("Failed to load optimization results");
        } finally {
            setLoading(false);
        }
    };
    const fetchLatest = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const historyRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/optimize/history`,
                { headers: { "auth-token": token } }
            );
            if (historyRes.data.length > 0) {
                const latestId = historyRes.data[0]._id;
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/optimize/result/${latestId}`,
                    { headers: { "auth-token": token } }
                );
                setResult(res.data);
            } else {
                setError("No optimizations found. Try optimizing a resume first!");
            }
        } catch (err) {
            setError("Failed to load results");
        } finally {
            setLoading(false);
        }
    };
    const copyResume = () => {
        if (result?.optimizedText) {
            navigator.clipboard.writeText(result.optimizedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const downloadAsTxt = () => {
        if (result?.optimizedText) {
            const blob = new Blob([result.optimizedText], {
                type: "text/plain",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "optimized_resume.txt";
            a.click();
            URL.revokeObjectURL(url);
        }
    };
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="skeleton h-10 w-80" />
                <div className="skeleton h-48 rounded-2xl" />
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="skeleton h-40 rounded-2xl" />
                    <div className="skeleton h-40 rounded-2xl" />
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <XCircle
                    size={48}
                    className="text-red-400 mx-auto mb-4 opacity-50"
                />
                <h2 className="text-xl font-bold text-white mb-2">
                    No Results Yet
                </h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <Link href="/dashboard/optimize" className="btn-primary">
                    <Sparkles size={16} />
                    Optimize Now
                </Link>
            </div>
        );
    }
    if (
        result?.status === "processing" ||
        result?.status === "pending"
    ) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center mx-auto mb-6 pulse-glow">
                    <Loader2
                        size={32}
                        className="text-indigo-400 animate-spin"
                    />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    Optimizing Your Resume...
                </h2>
                <p className="text-slate-400 mb-4">
                    {result?.processingMethod === "bytez"
                        ? "Processing via Bytez API"
                        : "AI is analyzing and optimizing your resume"}
                </p>
                <div className="progress-bar w-64 mx-auto">
                    <div
                        className="progress-bar-fill"
                        style={{ width: "60%", animation: "pulse 2s infinite" }}
                    />
                </div>
                <p className="text-slate-500 text-sm mt-4">
                    This usually takes 15-30 seconds
                </p>
            </div>
        );
    }
    if (result?.status === "failed") {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <AlertTriangle
                    size={48}
                    className="text-yellow-400 mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-white mb-2">
                    Optimization Failed
                </h2>
                <p className="text-slate-400 mb-6">
                    Something went wrong. Please try again.
                </p>
                <Link href="/dashboard/optimize" className="btn-primary">
                    <Sparkles size={16} />
                    Try Again
                </Link>
            </div>
        );
    }
    const score = result?.atsScore || 0;
    const scoreColor =
        score >= 80
            ? "text-[rgb(61,49,90)]"
            : score >= 60
            ? "text-[rgb(93,79,128)]"
            : "text-[rgb(123,107,157)]";
    const scoreGradient =
        score >= 80
            ? "#b4d3d9"
            : score >= 60
            ? "#bda6ce"
            : "#9b8ec7";
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/dashboard/optimize"
                        className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Optimize
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Optimization Results
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {result?.originalFileName || "Your resume"} •{" "}
                        {new Date(
                            result?.completedAt || result?.createdAt
                        ).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={copyResume}
                        className="btn-secondary text-sm py-2.5"
                    >
                        {copied ? (
                            <Check size={16} className="text-emerald-400" />
                        ) : (
                            <Copy size={16} />
                        )}
                        {copied ? "Copied!" : "Copy Resume"}
                    </button>
                    <button
                        onClick={downloadAsTxt}
                        className="btn-primary text-sm py-2.5"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>
            </div>
            {}
            <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {}
                    <div className="score-ring">
                        <svg width="160" height="160">
                            <circle
                                cx="80"
                                cy="80"
                                r="65"
                                stroke="rgba(155,142,199,0.22)"
                                strokeWidth="10"
                                fill="transparent"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="65"
                                stroke={scoreGradient}
                                strokeWidth="10"
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={408}
                                strokeDashoffset={408 - (408 * score) / 100}
                                style={{
                                    transition:
                                        "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    filter: `drop-shadow(0 0 10px ${scoreGradient}40)`,
                                }}
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className={`text-4xl font-extrabold ${scoreColor}`}>
                                {score}
                            </span>
                            <span className="block text-xs text-slate-400 mt-1">
                                ATS Score
                            </span>
                        </div>
                    </div>
                    {}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                {score >= 80
                                    ? "🎯 Excellent! Your resume is highly ATS-compatible"
                                    : score >= 60
                                    ? "📊 Good score with room for improvement"
                                    : "⚡ Needs optimization — follow suggestions below"}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Based on keyword matching, formatting, and
                                industry standards
                            </p>
                        </div>
                        {}
                        {result?.keywordDensity && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-400">
                                        {result.keywordDensity.total}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Total Keywords
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-400">
                                        {result.keywordDensity.matched}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Matched
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-400">
                                        {result.keywordDensity.missing?.length ||
                                            0}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Missing
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {}
            <div className="grid md:grid-cols-2 gap-6">
                {}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <CheckCircle2
                            size={18}
                            className="text-emerald-400"
                        />
                        Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result?.matchedSkills?.length > 0 ? (
                            result.matchedSkills.map(
                                (skill: string, i: number) => (
                                    <span key={i} className="skill-chip skill-chip-matched">
                                        <CheckCircle2 size={12} />
                                        {skill}
                                    </span>
                                )
                            )
                        ) : (
                            <p className="text-slate-500 text-sm italic">
                                No skills data available
                            </p>
                        )}
                    </div>
                </div>
                {}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <AlertTriangle
                            size={18}
                            className="text-orange-400"
                        />
                        Skill Gaps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result?.skillGaps?.length > 0 ? (
                            result.skillGaps.map(
                                (skill: string, i: number) => (
                                    <span key={i} className="skill-chip skill-chip-missing">
                                        <XCircle size={12} />
                                        {skill}
                                    </span>
                                )
                            )
                        ) : (
                            <p className="text-emerald-400 text-sm font-medium">
                                🎉 No skill gaps detected!
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {}
            {result?.suggestions?.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Target size={18} className="text-purple-400" />
                        AI Suggestions
                    </h3>
                    <div className="space-y-3">
                        {result.suggestions.map(
                            (suggestion: string, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs text-purple-400 font-bold">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {suggestion}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
            {}
            <div className="glass-card p-6 relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-indigo-400" />
                        Optimized Resume
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={copyResume}
                            className="btn-secondary text-xs py-2 px-3"
                        >
                            {copied ? (
                                <Check
                                    size={14}
                                    className="text-emerald-400"
                                />
                            ) : (
                                <Copy size={14} />
                            )}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            onClick={downloadAsTxt}
                            className="btn-secondary text-xs py-2 px-3"
                        >
                            <Download size={14} />
                            Download .txt
                        </button>
                    </div>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed bg-black/30 p-6 rounded-xl border border-white/5 text-sm max-h-[500px] overflow-y-auto">
                    {result?.optimizedText || "No optimized text available"}
                </pre>
            </div>
            {}
            <div className="glass-card p-4 bg-gradient-to-r from-cyan-500/5 to-transparent border-cyan-500/15">
                <div className="flex items-center gap-3 text-sm">
                    <Shield size={16} className="text-cyan-400 shrink-0" />
                    <span className="text-slate-400">
                        Processed via{" "}
                        <span className="text-cyan-400 font-medium">
                            {result?.processingMethod === "bytez"
                                ? "Bytez API"
                                : "direct API"}
                        </span>{" "}
                        •{" "}
                        {result?.completedAt
                            ? `Completed ${new Date(
                                  result.completedAt
                              ).toLocaleString()}`
                            : "Processing..."}
                    </span>
                </div>
            </div>
        </div>
    );
}
