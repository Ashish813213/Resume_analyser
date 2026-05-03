"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
                { email, password }
            );
            localStorage.setItem("token", res.data.token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-[rgb(242,234,224)] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="bg-mesh" />
            {}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="glass-card w-full max-w-md p-8 relative z-10">
                {}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">
                        ResumeAI
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-center text-white mb-2">
                    Welcome Back
                </h2>
                <p className="text-center text-slate-400 text-sm mb-8">
                    Sign in to continue optimizing your resume
                </p>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center mb-6">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="email"
                            placeholder="Email address"
                            className="input-premium pl-12"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-premium pl-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center text-base py-3.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />{" "}
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-500 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    );
}
