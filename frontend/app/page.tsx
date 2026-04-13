import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap, Shield, BarChart3, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(242,234,224)] text-white overflow-hidden">
      <div className="bg-mesh" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(242,234,224,0.88)] backdrop-blur-xl border-b border-[rgba(155,142,199,0.24)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold gradient-text">ResumeAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm py-2.5 px-5"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/3 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <Zap size={14} className="text-yellow-400" />
            AI-Powered Resume Optimization
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8">
            <span className="text-white">Land Your</span>
            <br />
            <span className="gradient-text">Dream Job</span>
            <br />
            <span className="text-white">With AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload your resume, paste a job link, and get an{" "}
            <span className="text-indigo-400 font-semibold">ATS-optimized resume</span>{" "}
            with a score, suggestions, and downloadable PDF — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-primary text-lg px-10 py-4"
            >
              Start Optimizing Free <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-lg px-10 py-4"
            >
              I have an account
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-12 mt-20">
            {[
              { value: "10K+", label: "Resumes Optimized" },
              { value: "95%", label: "ATS Pass Rate" },
              { value: "3x", label: "More Interviews" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything You Need to{" "}
              <span className="gradient-text">Get Hired</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Our AI analyzes, optimizes, and scores your resume against any job
              description
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "ATS Optimization",
                desc: "AI rewrites your resume with the perfect keywords to pass Applicant Tracking Systems.",
                color: "from-indigo-500 to-blue-500",
              },
              {
                icon: BarChart3,
                title: "Smart Scoring",
                desc: "Get a detailed ATS compatibility score (0-100) with actionable improvement tips.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Zap,
                title: "Skill Gap Analysis",
                desc: "Instantly see which skills you're missing and what to add to your resume.",
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: FileText,
                title: "Resume Upload",
                desc: "Upload any PDF resume. Our AI parses and understands your experience instantly.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Shield,
                title: "Job Scraping",
                desc: "Paste any job URL — we extract the description and optimize your resume for it.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Sparkles,
                title: "AI Cover Letters",
                desc: "Generate tailored cover letter emails for any company in one click.",
                color: "from-violet-500 to-purple-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-indigo-500/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">
            How It <span className="gradient-text">Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Resume",
                desc: "Drop your PDF resume — AI parses it instantly",
              },
              {
                step: "02",
                title: "Paste Job Link",
                desc: "Add the job URL or paste the description",
              },
              {
                step: "03",
                title: "Get Optimized",
                desc: "Receive ATS-friendly resume + score + tips",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-black text-indigo-500/10 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Simple <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-slate-400 text-lg">Start free. Upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold text-slate-300 mb-1">Free</h3>
              <div className="text-4xl font-extrabold text-white mb-6">₹0<span className="text-sm font-normal text-slate-500">/month</span></div>
              <ul className="space-y-3 text-sm text-slate-400 mb-8">
                {["2 resume optimizations/month", "Basic ATS scoring", "Resume upload & parsing", "Job match analysis"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-indigo-400 text-[10px]">✓</span>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full justify-center text-sm">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="glass-card p-8 border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-4">
                <Zap size={12} /> POPULAR
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
              <div className="text-4xl font-extrabold text-white mb-6">₹299<span className="text-sm font-normal text-slate-500">/month</span></div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                {["Unlimited optimizations", "Premium AI prompts", "Priority processing", "Resume templates", "Skill gap analyzer", "Cold email generator", "LinkedIn profile optimizer"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center">
                      <span className="text-indigo-300 text-[10px]">✓</span>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary w-full justify-center text-sm">
                Start Pro Trial <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Get Hired?</span>
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join thousands of job seekers who landed interviews with our AI optimizer.
            </p>
            <Link href="/register" className="btn-primary text-lg px-10 py-4">
              Start Free Now <Sparkles size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles size={14} className="text-indigo-400" />
            <span>ResumeAI © 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
