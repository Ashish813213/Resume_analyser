"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, ArrowRight, History, Mail } from 'lucide-react';
import Link from 'next/link';

export default function JobsPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const [matchesRes, suggestionsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resume/matches`, { headers: { 'auth-token': token } }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resume/suggest-jobs`, { headers: { 'auth-token': token } })
            ]);
            setMatches(matchesRes.data);
            setSuggestedJobs(suggestionsRes.data);
        } catch (err) {
            console.error("Error fetching jobs data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Finding the best jobs for you...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12">

            {/* Search Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Job Board</h1>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Based on your profile
                    </span>
                </div>

                {suggestedJobs.length === 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
                        No jobs found directly. Try updating your resume skills.
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedJobs.map((job, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-md border hover:border-blue-400 transition-all flex flex-col group relative">
                            {job.source === 'LinkedIn' && (
                                <span className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">LinkedIn</span>
                            )}
                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{job.title}</h3>
                                <p className="text-blue-600 font-medium">{job.company}</p>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg flex-1">
                                {job.description}
                            </p>

                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/email?company=${encodeURIComponent(job.company)}&jd=${encodeURIComponent(job.description)}`}
                                    className="flex-1 text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                                >
                                    <Mail size={16} /> Draft Email
                                </Link>
                                {job.link && (
                                    <a
                                        href={job.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm flex items-center"
                                    >
                                        Apply ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Application History Section */}
            <section className="space-y-6 pt-8 border-t">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <History size={28} /> History: Analyzed Jobs
                </h2>
                <div className="space-y-4">
                    {matches.length > 0 ? matches.map((match: any) => (
                        <div key={match._id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`text-2xl font-bold ${match.matchScore > 70 ? 'text-green-600' : match.matchScore > 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                        {match.matchScore}% Match
                                    </div>
                                    <span className="text-sm text-gray-400">{new Date(match.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600 line-clamp-2 text-sm max-w-2xl">{match.jobDescription}</p>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <Link
                                    href={`/dashboard/email?company=Unknown&jd=${encodeURIComponent(match.jobDescription)}`}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Mail size={16} /> Draft Email
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 italic">No job analysis history found.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
