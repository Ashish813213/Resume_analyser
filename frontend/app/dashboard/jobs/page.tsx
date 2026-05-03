"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Briefcase,
    ArrowRight,
    History,
    Mail,
    Loader2,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
export default function JobsPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);
    const [jobPosts, setJobPosts] = useState<any[]>([]);
    const [contentQuery, setContentQuery] = useState("");
    const [usedContentQuery, setUsedContentQuery] = useState("");
    const [contentNote, setContentNote] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        if (loading) return;
        const params = new URLSearchParams(window.location.search);
        if (params.get("view") === "linkedin-posts") {
            const section = document.getElementById("linkedin-job-posts");
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [loading]);
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const linkedInTemplateUrl =
            "https://www.linkedin.com/search/results/content/?keywords=%22software%20engineer%22%20AND%20%22fresher%22%20AND%20%22job%22&origin=SWITCH_SEARCH_VERTICAL";
        try {
            const [matchesRes, suggestionsRes, contentRes] = await Promise.all([
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/resume/matches`,
                    { headers: { "auth-token": token } }
                ),
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/resume/suggest-jobs`,
                    { headers: { "auth-token": token } }
                ),
                axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/resume/scrape-job-posts?linkedInUrl=${encodeURIComponent(
                        linkedInTemplateUrl
                    )}`,
                    { headers: { "auth-token": token } }
                ),
            ]);
            setMatches(matchesRes.data);
            setSuggestedJobs(suggestionsRes.data);
            setJobPosts(contentRes.data?.posts || []);
            setContentQuery(contentRes.data?.query || "");
            setUsedContentQuery(contentRes.data?.usedQuery || "");
            setContentNote(contentRes.data?.note || "");
        } catch (err) {
            console.error("Error fetching jobs data", err);
        } finally {
            setLoading(false);
        }
    };
    const getApplyLink = (job: any) => {
        if (job?.link && typeof job.link === "string") {
            return job.link;
        }
        const keywords = [job?.title, job?.company, "jobs"]
            .filter(Boolean)
            .join(" ");
        return `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(
            keywords || "software developer jobs"
        )}&location=${encodeURIComponent("India")}`;
    };
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="skeleton h-10 w-48" />
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-48 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Briefcase className="text-indigo-400" size={28} />
                        Job Board
                    </h1>
                    <span className="skill-chip skill-chip-neutral text-xs">
                        Based on your profile
                    </span>
                </div>
                {suggestedJobs.length === 0 && (
                    <div className="glass-card p-6 text-center">
                        <p className="text-slate-400">
                            No jobs found. Try updating your resume skills.
                        </p>
                    </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedJobs.map((job, i) => {
                        const applyLink = getApplyLink(job);
                        return (
                        <div
                            key={i}
                            className="glass-card p-6 flex flex-col group relative"
                        >
                            {job.source === "LinkedIn" && (
                                <span className="absolute top-4 right-4 text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/20">
                                    LinkedIn
                                </span>
                            )}
                            {job.source === "Naukri" && (
                                <span className="absolute top-4 right-4 text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/20">
                                    Naukri
                                </span>
                            )}
                            <h3 className="font-bold text-white text-lg line-clamp-2 mb-1">
                                {job.title}
                            </h3>
                            <p className="text-indigo-400 font-medium text-sm mb-3">
                                {job.company}
                            </p>
                            <p className="text-slate-400 text-sm mb-4 flex-1 line-clamp-3 bg-white/3 p-3 rounded-lg">
                                {job.description}
                            </p>
                            <div className="flex gap-2 mt-auto">
                                <Link
                                    href={`/dashboard/email?company=${encodeURIComponent(
                                        job.company
                                    )}&jd=${encodeURIComponent(
                                        job.description
                                    )}`}
                                    className="flex-1 text-center btn-primary text-xs py-2 justify-center"
                                >
                                    <Mail size={14} />
                                    Draft Email
                                </Link>
                                <a
                                    href={applyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary text-xs py-2 px-3"
                                >
                                    <ExternalLink size={14} />
                                    Apply
                                </a>
                            </div>
                        </div>
                    );
                    })}
                </div>
            </section>
            {}
            <section id="linkedin-job-posts" className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Briefcase size={24} className="text-indigo-400" />
                        LinkedIn Job Posts
                    </h2>
                    {(usedContentQuery || contentQuery) && (
                        <span className="skill-chip skill-chip-neutral text-xs">
                            Query: {usedContentQuery || contentQuery}
                        </span>
                    )}
                </div>
                {jobPosts.length === 0 ? (
                    <div className="glass-card p-6 text-center">
                        <p className="text-slate-400">
                            {contentNote ||
                                "No content posts found right now. LinkedIn may require sign-in for complete results."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobPosts.map((post: any, i: number) => (
                            <div
                                key={`${post.link}-${i}`}
                                className="glass-card p-5 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-bold text-white text-base line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <span className="text-xs text-slate-500 whitespace-nowrap">
                                        {post.postedAt || "Unknown"}
                                    </span>
                                </div>
                                <p className="text-indigo-400 text-sm font-medium">
                                    {post.author || "Unknown"}
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 bg-white/3 p-3 rounded-lg">
                                    {post.description}
                                </p>
                                <div className="flex gap-2 mt-1">
                                    <Link
                                        href={`/dashboard/email?company=${encodeURIComponent(
                                            post.author || "Unknown"
                                        )}&jd=${encodeURIComponent(
                                            post.description || post.title || ""
                                        )}`}
                                        className="btn-secondary text-xs py-2"
                                    >
                                        <Mail size={14} />
                                        Draft Email
                                    </Link>
                                    <a
                                        href={post.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary text-xs py-2"
                                    >
                                        <ExternalLink size={14} />
                                        Open Post
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            {}
            <section className="space-y-6 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <History size={24} className="text-slate-400" />
                    Analyzed Jobs History
                </h2>
                {matches.length > 0 ? (
                    <div className="space-y-3">
                        {matches.map((match: any) => (
                            <div
                                key={match._id}
                                className="glass-card p-5 flex flex-col md:flex-row gap-4 items-start md:items-center"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`text-xl font-bold ${
                                                match.matchScore > 70
                                                    ? "text-emerald-400"
                                                    : match.matchScore > 40
                                                    ? "text-yellow-400"
                                                    : "text-red-400"
                                            }`}
                                        >
                                            {match.matchScore}% Match
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(
                                                match.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 line-clamp-2 text-sm max-w-2xl">
                                        {match.jobDescription}
                                    </p>
                                </div>
                                <Link
                                    href={`/dashboard/email?company=Unknown&jd=${encodeURIComponent(
                                        match.jobDescription
                                    )}`}
                                    className="btn-secondary text-xs py-2"
                                >
                                    <Mail size={14} />
                                    Draft Email
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 italic">
                        No job analysis history found.
                    </p>
                )}
            </section>
        </div>
    );
}
