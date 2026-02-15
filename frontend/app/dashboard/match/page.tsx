"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Briefcase, Check, X } from 'lucide-react';

export default function MatchJobPage() {
    const [jobDescription, setJobDescription] = useState('');
    const [matchResult, setMatchResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resume/match`,
                { jobDescription },
                { headers: { 'auth-token': token } }
            );
            setMatchResult(res.data);
        } catch (err: any) {
            setError(err.response?.data || 'Matching failed. Ensure you have uploaded a resume.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Job Match Analysis</h1>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <form onSubmit={handleMatch}>
                    <label className="block text-gray-700 font-semibold mb-2">Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40"
                        placeholder="Paste the job description here..."
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !jobDescription}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Analyzing...' : <><Briefcase size={20} /> Analyze Match</>}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {matchResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Score Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md col-span-1 md:col-span-3 text-center">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Match Score</h3>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200" />
                                <circle
                                    cx="64" cy="64" r="56"
                                    stroke="currentColor" strokeWidth="12" fill="transparent"
                                    strokeDasharray={351.86}
                                    strokeDashoffset={351.86 - (351.86 * matchResult.matchScore) / 100}
                                    className={`${matchResult.matchScore > 70 ? 'text-green-500' : matchResult.matchScore > 40 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <span className="absolute text-3xl font-bold text-gray-800">{matchResult.matchScore}%</span>
                        </div>
                    </div>

                    {/* Matched Skills */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 col-span-1 md:col-span-1.5">
                        <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                            <Check size={20} /> Matched Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {matchResult.matchedSkills.length > 0 ? (
                                matchResult.matchedSkills.map((skill: string, i: number) => (
                                    <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-green-600 italic">No direct matches found.</p>
                            )}
                        </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200 col-span-1 md:col-span-1.5">
                        <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                            <X size={20} /> Missing Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {matchResult.missingSkills.length > 0 ? (
                                matchResult.missingSkills.map((skill: string, i: number) => (
                                    <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-red-600 italic">No missing skills detected!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
