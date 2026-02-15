"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, FileText, Calendar, Mail } from 'lucide-react';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
                    headers: { 'auth-token': token }
                });
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-8">Loading profile...</div>;
    if (!profile) return <div className="p-8">Failed to load profile.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 h-fit">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <User size={40} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{profile.user.name}</h2>
                        <div className="flex items-center gap-2 text-gray-500 mt-2">
                            <Mail size={16} />
                            <span>{profile.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
                            <Calendar size={16} />
                            <span>Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Resume Details Card */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Resume Details</h3>

                    {profile.resume ? (
                        <>
                            <div>
                                <label className="text-sm text-gray-500 uppercase font-semibold">Current Role</label>
                                <p className="text-lg font-medium text-gray-800">{profile.resume.role || "Not specified"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 uppercase font-semibold">Experience</label>
                                    <p className="font-medium text-gray-800">{profile.resume.experienceYears} Years</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 uppercase font-semibold">Last Updated</label>
                                    <p className="font-medium text-gray-800">{new Date(profile.resume.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 uppercase font-semibold">Professional Summary</label>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg mt-2 leading-relaxed">
                                    {profile.resume.summary}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 uppercase font-semibold">Skills</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.resume.skills.map((skill: string, i: number) => (
                                        <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No resume uploaded yet.</p>
                            <a href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">Upload Resume</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
