"use client";
import React, { useState, Suspense } from "react";
import axios from "axios";
import { Mail, Copy, Check, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
export default function EmailGeneratorPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 text-slate-400">Loading...</div>
            }
        >
            <EmailGeneratorContent />
        </Suspense>
    );
}
function EmailGeneratorContent() {
    const searchParams = useSearchParams();
    const [companyName, setCompanyName] = useState(
        searchParams.get("company") || ""
    );
    const [jobDescription, setJobDescription] = useState(
        searchParams.get("jd") || ""
    );
    const [emailContent, setEmailContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/resume/generate-email`,
                { companyName, jobDescription },
                { headers: { "auth-token": token } }
            );
            setEmailContent(res.data.email);
        } catch (err: any) {
            setError(
                err.response?.data ||
                    "Generation failed. Ensure you have uploaded a resume."
            );
        } finally {
            setLoading(false);
        }
    };
    const copyToClipboard = () => {
        navigator.clipboard.writeText(emailContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Mail className="text-indigo-400" size={28} />
                    Email Generator
                </h1>
                <p className="text-slate-400 mt-1">
                    Generate professional cover letter emails using AI
                </p>
            </div>
            <div className="glass-card p-6">
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 font-semibold text-sm mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="input-premium"
                            placeholder="e.g. Google"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 font-semibold text-sm mb-2">
                            Job Description (Brief)
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="input-premium h-32 resize-none"
                            placeholder="Paste relevant parts of the JD here..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={
                            loading || !companyName || !jobDescription
                        }
                        className="btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Mail size={18} />
                                Generate Email
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <p className="text-red-400 mt-3 text-sm">{error}</p>
                )}
            </div>
            {emailContent && (
                <div className="glass-card p-6 relative border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">
                            Generated Draft
                        </h3>
                        <button
                            onClick={copyToClipboard}
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
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed bg-black/30 p-5 rounded-xl border border-white/5 text-sm">
                        {emailContent}
                    </pre>
                </div>
            )}
        </div>
    );
}
