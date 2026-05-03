"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, FileText, Calendar, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
                    { headers: { "auth-token": token } }
                );
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="skeleton h-10 w-48" />
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="skeleton h-64 rounded-2xl" />
                    <div className="skeleton h-64 rounded-2xl md:col-span-2" />
                </div>
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="p-8 text-slate-400">Failed to load profile.</div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <User className="text-indigo-400" size={28} />
                My Profile
            </h1>
            <div className="grid md:grid-cols-3 gap-8">
                {}
                <div className="glass-card p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                        <User size={32} className="text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        {profile.user.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-slate-400 mt-2 text-sm">
                        <Mail size={14} />
                        <span>{profile.user.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-3">
                        <Calendar size={12} />
                        <span>
                            Joined{" "}
                            {new Date(
                                profile.user.createdAt
                            ).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                {}
                <div className="md:col-span-2 glass-card p-6 space-y-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
                        Resume Details
                    </h3>
                    {profile.resume ? (
                        <>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                    Current Role
                                </label>
                                <p className="text-lg font-medium text-white mt-1">
                                    {profile.resume.role || "Not specified"}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                        Experience
                                    </label>
                                    <p className="text-white font-medium mt-1">
                                        {profile.resume.experienceYears} Years
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                        Last Updated
                                    </label>
                                    <p className="text-white font-medium mt-1">
                                        {new Date(
                                            profile.resume.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                    Professional Summary
                                </label>
                                <p className="text-slate-300 bg-white/5 p-4 rounded-xl mt-2 leading-relaxed text-sm">
                                    {profile.resume.summary}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                    Skills
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.resume.skills.map(
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
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <FileText
                                size={48}
                                className="mx-auto mb-4 text-slate-600"
                            />
                            <p className="text-slate-400 mb-4">
                                No resume uploaded yet.
                            </p>
                            <Link
                                href="/dashboard/upload"
                                className="btn-primary text-sm"
                            >
                                <Sparkles size={16} />
                                Upload Resume
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
