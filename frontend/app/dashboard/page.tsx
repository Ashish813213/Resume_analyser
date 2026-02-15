"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resume/me`, {
                headers: { 'auth-token': token }
            });
            setResumeData(res.data);
        } catch (err) {
            console.log("No resume found or error fetching");
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resume/upload`, formData, {
                headers: {
                    'auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResumeData(res.data);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">My Resume</h1>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Upload size={24} className="text-blue-500" />
                    Upload / Update Resume (PDF)
                </h2>
                <form onSubmit={handleUpload} className="flex gap-4 items-center">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Upload & Analyze'}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            {resumeData ? (
                <div className="bg-white p-6 rounded-xl shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-start border-b pb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{resumeData.role || "Role Not Detected"}</h3>
                            <p className="text-gray-500">Experience: {resumeData.experienceYears} Years</p>
                        </div>
                        <CheckCircle className="text-green-500" size={32} />
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Professional Summary</h4>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">{resumeData.summary}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Detected Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills?.map((skill: string, i: number) => (
                                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl text-center text-blue-800">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No resume uploaded yet. Upload a PDF to get started!</p>
                </div>
            )}

            {resumeData && <RecommendedJobs resumeId={resumeData._id} />}
        </div>
    );
}

function RecommendedJobs({ resumeId }: { resumeId: string }) {
    const [jobs, setJobs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [linkedInUrl, setLinkedInUrl] = React.useState('');

    const fetchJobs = async (urlOverride?: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        try {
            const endpoint = urlOverride
                ? `${process.env.NEXT_PUBLIC_API_URL}/resume/suggest-jobs?linkedInUrl=${encodeURIComponent(urlOverride)}`
                : `${process.env.NEXT_PUBLIC_API_URL}/resume/suggest-jobs`;

            const res = await axios.get(endpoint, {
                headers: { 'auth-token': token }
            });
            setJobs(res.data);
        } catch (err) {
            console.log("Error fetching jobs");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchJobs();
    }, [resumeId]);

    const handleLinkedInSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (linkedInUrl) fetchJobs(linkedInUrl);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    Recommended Jobs <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{jobs.length > 0 && jobs[0].source === 'LinkedIn' ? 'LinkedIn Real-Time' : 'AI Curated'}</span>
                </h2>
                <form onSubmit={handleLinkedInSearch} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Paste LinkedIn Search URL..."
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                        className="px-4 py-2 border rounded-lg text-sm w-full md:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Fetching jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500">
                    No jobs found. Try a different URL or re-upload your resume.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-md border hover:border-blue-300 transition-colors flex flex-col group relative">
                            {job.source === 'LinkedIn' && (
                                <span className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">LinkedIn</span>
                            )}
                            <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{job.title}</h3>
                            <p className="text-blue-600 font-medium text-sm mb-2">{job.company}</p>
                            <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{job.description}</p>

                            <div className="flex gap-2 mt-auto">
                                <a
                                    href={`/dashboard/email?company=${encodeURIComponent(job.company)}&jd=${encodeURIComponent(job.description)}`}
                                    className="flex-1 text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition-colors text-sm font-medium"
                                >
                                    Draft Application
                                </a>
                                {job.link && (
                                    <a
                                        href={job.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                                        title="View on LinkedIn"
                                    >
                                        ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
