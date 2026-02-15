import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
          Match Your Resume to <br />
          <span className="text-blue-600">Your Dream Job</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered resume analysis, job matching, and email generation.
          Optimize your job search workflow in seconds.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            Login
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          {[
            { title: "AI Resume Parsing", desc: "Extract skills and experience instantly from your PDF resume." },
            { title: "Smart Job Matching", desc: "Compare your resume against any job description to see your fit." },
            { title: "Instant Cover Letters", desc: "Generate tailored emails for recruiters in one click." },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <CheckCircle className="text-green-500 mb-4" size={32} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
