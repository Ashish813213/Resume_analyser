"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Upload,
    Link2,
    FileText,
    Loader2,
    PenLine,
    Zap,
    ArrowRight,
    X,
    AlertCircle,
} from "lucide-react";
export default function OptimizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [jobUrl, setJobUrl] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [useManualJD, setUseManualJD] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
            } else {
                setError("Please upload a PDF file");
            }
        }
    };
    const handleOptimize = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        try {
            const formData = new FormData();
            if (file) {
                formData.append("resume", file);
            }
            if (useManualJD && jobDescription) {
                formData.append("jobDescription", jobDescription);
            }
            if (!useManualJD && jobUrl) {
                formData.append("jobUrl", jobUrl);
            }
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/optimize/submit`,
                formData,
                {
                    headers: {
                        "auth-token": token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const optimizationId = res.data._id || res.data.optimizationId;
            if (res.data.status === "processing") {
                router.push(
                    `/dashboard/results?id=${optimizationId}&polling=true`
                );
            } else {
                router.push(`/dashboard/results?id=${optimizationId}`);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                    "Optimization failed. Make sure you have uploaded a resume."
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Sparkles className="text-indigo-400" size={28} />
                    Optimize Resume
                </h1>
                <p className="text-slate-400 mt-2">
                    Upload your resume and paste a job link — our AI will
                    optimize it for ATS compatibility
                </p>
            </div>
            {}
            <div className="flex items-center gap-4">
                {[
                    { num: 1, label: "Upload Resume", active: true },
                    { num: 2, label: "Add Job Details", active: true },
                    { num: 3, label: "Get Results", active: false },
                ].map((step, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    step.active
                                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                        : "bg-white/5 text-slate-500 border border-white/10"
                                }`}
                            >
                                {step.num}
                            </div>
                            <span
                                className={`text-sm font-medium ${
                                    step.active
                                        ? "text-white"
                                        : "text-slate-500"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {i < 2 && (
                            <div className="flex-1 h-px bg-white/10" />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <form onSubmit={handleOptimize} className="space-y-6">
                {}
                <div className="glass-card p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-400" />
                        Step 1: Resume
                    </h3>
                    <div
                        className={`upload-zone ${
                            dragActive ? "active" : ""
                        } ${file ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] || null)
                            }
                            className="hidden"
                        />
                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <FileText
                                        size={24}
                                        className="text-emerald-400"
                                    />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium">
                                        {file.name}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        {(file.size / 1024).toFixed(1)} KB •
                                        Ready to optimize
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X
                                        size={16}
                                        className="text-slate-400"
                                    />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload
                                    size={40}
                                    className="mx-auto text-slate-500 mb-4"
                                />
                                <p className="text-white font-medium mb-1">
                                    Drop your resume here or click to browse
                                </p>
                                <p className="text-slate-500 text-sm">
                                    PDF files only • Max 10MB
                                </p>
                                <p className="text-indigo-400 text-xs mt-3">
                                    Or leave empty to use your last uploaded
                                    resume
                                </p>
                            </>
                        )}
                    </div>
                </div>
                {}
                <div className="glass-card p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Link2 size={18} className="text-indigo-400" />
                        Step 2: Job Details
                    </h3>
                    {}
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setUseManualJD(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !useManualJD
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Link2 size={14} className="inline mr-1.5" />
                            Paste URL
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseManualJD(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                useManualJD
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <PenLine size={14} className="inline mr-1.5" />
                            Paste Description
                        </button>
                    </div>
                    {useManualJD ? (
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="input-premium h-40 resize-none"
                            placeholder="Paste the full job description here..."
                        />
                    ) : (
                        <input
                            type="url"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            className="input-premium"
                            placeholder="https://www.linkedin.com/jobs/view/..."
                        />
                    )}
                    <p className="text-slate-500 text-xs mt-3">
                        💡 Tip: Paste the exact job posting URL from LinkedIn,
                        Indeed, or any job board for best results
                    </p>
                </div>
                {}
                {error && (
                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <AlertCircle
                            size={18}
                            className="text-red-400 mt-0.5 shrink-0"
                        />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
                {}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center text-lg py-4"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Optimizing with AI...</span>
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            <span>Optimize My Resume</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
            {}
            <div className="glass-card p-4 bg-gradient-to-r from-cyan-500/5 to-transparent border-cyan-500/15">
                <div className="flex items-center gap-2 text-sm">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-slate-400">
                        Processing powered by{" "}
                        <span className="text-cyan-400 font-medium">Bytez API</span>. Your request will be queued and processed in
                        the background.
                    </span>
                </div>
            </div>
        </div>
    );
}
