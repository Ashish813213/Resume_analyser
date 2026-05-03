"use client";
import React, { useState } from "react";
import axios from "axios";
import {
    Briefcase,
    CheckCircle2,
    XCircle,
    Loader2,
    Target,
} from "lucide-react";
export default function MatchJobPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [matchResult, setMatchResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/resume/match`,
                { jobDescription },
                { headers: { "auth-token": token } }
            );
            setMatchResult(res.data);
        } catch (err: any) {
            setError(
                err.response?.data ||
                    "Matching failed. Ensure you have uploaded a resume."
            );
        } finally {
            setLoading(false);
        }
    };
    const score = matchResult?.matchScore || 0;
    const scoreColor =
        score > 70
            ? "text-[rgb(61,49,90)]"
            : score > 40
            ? "text-[rgb(93,79,128)]"
            : "text-[rgb(123,107,157)]";
    const scoreGradient =
        score > 70 ? "#b4d3d9" : score > 40 ? "#bda6ce" : "#9b8ec7";
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Target className="text-indigo-400" size={28} />
                    Job Match Analysis
                </h1>
                <p className="text-slate-400 mt-1">
                    Compare your resume against a job description
                </p>
            </div>
            <div className="glass-card p-6">
                <form onSubmit={handleMatch} className="space-y-4">
                    <label className="block text-slate-300 font-semibold text-sm mb-1">
                        Job Description
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="input-premium h-40 resize-none"
                        placeholder="Paste the job description here..."
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !jobDescription}
                        className="btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Briefcase size={18} />
                                Analyze Match
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <p className="text-red-400 mt-3 text-sm">{error}</p>
                )}
            </div>
            {matchResult && (
                <div className="space-y-6">
                    {}
                    <div className="glass-card p-8 text-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                        <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">
                            Match Score
                        </h3>
                        <div className="score-ring inline-flex">
                            <svg width="140" height="140">
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="56"
                                    stroke="rgba(155,142,199,0.22)"
                                    strokeWidth="10"
                                    fill="transparent"
                                />
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="56"
                                    stroke={scoreGradient}
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={351.86}
                                    strokeDashoffset={
                                        351.86 - (351.86 * score) / 100
                                    }
                                    style={{
                                        transition:
                                            "stroke-dashoffset 1.5s ease",
                                        filter: `drop-shadow(0 0 8px ${scoreGradient}40)`,
                                    }}
                                />
                            </svg>
                            <span
                                className={`score-value text-3xl ${scoreColor}`}
                            >
                                {score}%
                            </span>
                        </div>
                    </div>
                    {}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-400"
                                />
                                Matched Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {matchResult.matchedSkills?.length > 0 ? (
                                    matchResult.matchedSkills.map(
                                        (skill: string, i: number) => (
                                            <span
                                                key={i}
                                                className="skill-chip skill-chip-matched"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )
                                ) : (
                                    <p className="text-slate-500 text-sm italic">
                                        No direct matches
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <XCircle
                                    size={18}
                                    className="text-red-400"
                                />
                                Missing Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {matchResult.missingSkills?.length > 0 ? (
                                    matchResult.missingSkills.map(
                                        (skill: string, i: number) => (
                                            <span
                                                key={i}
                                                className="skill-chip skill-chip-missing"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )
                                ) : (
                                    <p className="text-emerald-400 text-sm font-medium">
                                        🎉 No missing skills!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
