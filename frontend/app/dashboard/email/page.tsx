"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Copy, Check } from 'lucide-react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

export default function EmailGeneratorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmailGeneratorContent />
        </Suspense>
    );
}

function EmailGeneratorContent() {
    const searchParams = useSearchParams();
    const [companyName, setCompanyName] = useState(searchParams.get('company') || '');
    const [jobDescription, setJobDescription] = useState(searchParams.get('jd') || '');
    const [emailContent, setEmailContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resume/generate-email`,
                { companyName, jobDescription },
                { headers: { 'auth-token': token } }
            );
            setEmailContent(res.data.email);
        } catch (err: any) {
            setError(err.response?.data || 'Generation failed. Ensure you have uploaded a resume.');
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
            <h1 className="text-3xl font-bold text-gray-800">Email Generator</h1>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Google"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Job Description (Brief)</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                            placeholder="Paste relevant parts of the JD here..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !companyName || !jobDescription}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Generating...' : <><Mail size={20} /> Generate Email</>}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {emailContent && (
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 animate-in fade-in slide-in-from-bottom-4 relative group">
                    <button
                        onClick={copyToClipboard}
                        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 flex items-center gap-1"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                        <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Generated Draft</h3>
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {emailContent}
                    </pre>
                </div>
            )}
        </div>
    );
}
