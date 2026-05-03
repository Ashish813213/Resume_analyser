"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Sparkles,
} from "lucide-react";
export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        fetchResume();
    }, []);
    const fetchResume = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/resume/me`,
                { headers: { "auth-token": token } }
            );
            setResumeData(res.data);
        } catch (err) {
            console.log("No resume found");
        }
    };
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else {
            setDragActive(false);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]?.type === "application/pdf") {
            setFile(e.dataTransfer.files[0]);
        }
    };
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setError("");
        const formData = new FormData();
        formData.append("resume", file);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/resume/upload`,
                formData,
                {
                    headers: {
                        "auth-token": token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setResumeData(res.data);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data || "Upload failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <FileText className="text-indigo-400" size={28} />
                    Upload Resume
                </h1>
                <p className="text-slate-400 mt-1">
                    Upload your PDF resume to parse skills and experience
                </p>
            </div>
            <div className="glass-card p-6">
                <form onSubmit={handleUpload}>
                    <div
                        className={`upload-zone ${dragActive ? "active" : ""} ${
                            file ? "border-emerald-500/50 bg-emerald-500/5" : ""
                        }`}
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
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="ml-4 p-2 hover:bg-white/10 rounded-lg"
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
                                    PDF files only
                                </p>
                            </>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="btn-primary mt-4 w-full justify-center"
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
                                <Sparkles size={18} />
                                Upload & Analyze
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <p className="text-red-400 mt-3 text-sm">{error}</p>
                )}
            </div>
            {resumeData ? (
                <div className="glass-card p-6 space-y-6">
                    <div className="flex justify-between items-start border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {resumeData.role || "Role Not Detected"}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Experience: {resumeData.experienceYears} Years
                            </p>
                        </div>
                        <CheckCircle2
                            size={28}
                            className="text-emerald-400"
                        />
                    </div>
                    <div>
                        <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">
                            Professional Summary
                        </h4>
                        <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl">
                            {resumeData.summary}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-2">
                            Detected Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills?.map(
                                (skill: string, i: number) => (
                                    <span
                                        key={i}
                                        className="skill-chip skill-chip-neutral"
                                    >
                                        {skill}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <AlertCircle
                        size={48}
                        className="mx-auto mb-4 text-slate-600"
                    />
                    <p className="text-slate-400">
                        No resume uploaded yet. Upload a PDF to get started!
                    </p>
                </div>
            )}
        </div>
    );
}
