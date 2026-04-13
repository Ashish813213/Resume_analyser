import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ResumeAI - AI Resume Optimizer | Land Your Dream Job',
  description: 'AI-powered resume optimization. Upload your resume, paste a job link, and get an ATS-optimized resume with score, suggestions, and downloadable PDF — in seconds.',
  keywords: 'resume optimizer, ATS resume, AI resume, job application, career tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
