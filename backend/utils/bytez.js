require('dotenv').config();
const OpenAI = require('openai');

function getOpenAIClient() {
    return new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
    });
}

async function callNvidiaAI(systemPrompt, userPrompt) {
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey || apiKey.startsWith('your_') || apiKey.length < 20) {
        console.warn("WARNING: No valid NVIDIA API key found. Using MOCK response.");
        return mockAIResponse(systemPrompt);
    }

    try {
        const completion = await getOpenAIClient().chat.completions.create({
            model: "nvidia/nemotron-3-super-120b-a12b",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 16384,
            reasoning_budget: 4096,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("NVIDIA API Error:", error.response?.data || error.message);
        throw new Error('Failed to communicate with AI service');
    }
}

function mockAIResponse(systemPrompt) {
    if (systemPrompt.includes("Resume Parser")) {
        return JSON.stringify({
            skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
            experienceYears: 3,
            role: "Full Stack Developer",
            summary: "Experienced developer with a focus on modern web technologies."
        });
    }
    if (systemPrompt.includes("Extract required technical skills")) {
        return JSON.stringify(["React", "Node.js", "TypeScript", "Tailwind CSS"]);
    }
if (systemPrompt.includes("Write a short, punchy cover letter")) {
        return "Dear Hiring Manager,\n\nI am excited to apply for the position. With my background in Full Stack Development and expertise in React and Node.js, I am confident in my ability to contribute effectively to your team.\n\nBest regards,\n[Your Name]";
    }
    if (systemPrompt.includes("Suggest jobs")) {
        return JSON.stringify([
            {
                "title": "Junior Python Developer",
                "company": "TechCorp India",
                "description": "Looking for a Python developer with NumPy, Pandas, and data analysis skills. Great opportunity for freshers to grow in a collaborative environment.",
                "link": "https://www.linkedin.com/jobs/search?keywords=Python%20Developer&location=India"
            },
            {
                "title": "React Developer",
                "company": "WebSolutions",
                "description": "Seeking a React.js developer for building modern web applications. Must have experience with JavaScript, React, and responsive design.",
                "link": "https://www.linkedin.com/jobs/search?keywords=React%20Developer&location=India"
            },
            {
                "title": "Full Stack Engineer",
                "company": "CloudTech Systems",
                "description": "MERN stack developer needed for building scalable web apps. Experience with Node.js, Express, MongoDB, and React is required.",
                "link": "https://www.linkedin.com/jobs/search?keywords=Full%20Stack%20Engineer&location=India"
            },
            {
                "title": "Flutter Developer",
                "company": "AppDynamics",
                "description": "Mobile developer with Flutter experience to build cross-platform applications. Great for developers with mobile development interest.",
                "link": "https://www.linkedin.com/jobs/search?keywords=Flutter%20Developer&location=India"
            },
            {
                "title": "Data Analyst",
                "company": "DataFlow Inc",
                "description": "Looking for a data analyst with Python, NumPy, Pandas, and scikit-learn. Experience with data visualization is a plus.",
                "link": "https://www.linkedin.com/jobs/search?keywords=Data%20Analyst&location=India"
            },
            {
                "title": "Junior Web Developer",
                "company": "TechStart",
                "description": "Entry-level web developer position. HTML, CSS, JavaScript skills needed. Training will be provided for React and Node.js.",
                "link": "https://www.linkedin.com/jobs/search?keywords=Junior%20Web%20Developer&location=India"
            }
        ]);
    }
    if (systemPrompt.includes("Suggest jobs")) {
        return JSON.stringify([
            {
                "title": "Senior React Developer",
                "company": "WebTech Solutions",
                "description": "We are looking for a Senior React Developer to lead our frontend team. Must have experience with Next.js, Tailwind CSS, and state management libraries."
            },
            {
                "title": "Full Stack Engineer",
                "company": "Cloud Systems",
                "description": "Join our team to build scalable cloud applications. Proficiency in Node.js, Express, and MongoDB is required. Experience with AWS is a plus."
            },
            {
                "title": "Frontend Architect",
                "company": "Creative Digital",
                "description": "Seeking a creative Frontend Architect to design modern user interfaces. Strong skills in JavaScript, CSS animations, and UI/UX principles needed."
            }
        ]);
    }
    if (systemPrompt.includes("ATS Resume Optimizer") || systemPrompt.includes("Optimize")) {
        return `PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 3+ years of expertise in building scalable web applications using modern JavaScript frameworks. Proven track record of delivering high-quality solutions with measurable impact.

TECHNICAL SKILLS
• Programming Languages: JavaScript (ES6+), TypeScript, Python
• Frontend: React.js, Next.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express.js, REST APIs
• Databases: MongoDB, PostgreSQL
• Tools: Git, Docker, CI/CD, AWS, Agile/Scrum

PROFESSIONAL EXPERIENCE
Full Stack Developer | Tech Company | 2021 - Present
• Developed and maintained 5+ production web applications serving 10,000+ daily users
• Reduced page load time by 40% through code optimization and lazy loading strategies
• Implemented RESTful APIs handling 1M+ requests/month with 99.9% uptime
• Led migration from legacy codebase to React/Next.js, improving developer velocity by 60%

EDUCATION
Bachelor of Technology in Computer Science | University | 2021
• GPA: 3.8/4.0 | Relevant Coursework: Data Structures, Algorithms, Web Development`;
    }
    if (systemPrompt.includes("ATS scoring expert") || systemPrompt.includes("atsScore")) {
        return JSON.stringify({
            atsScore: 82,
            suggestions: [
                "Add more quantifiable achievements with specific metrics",
                "Include keywords: Docker, Kubernetes, CI/CD pipeline experience",
                "Add a 'Projects' section highlighting relevant personal/open-source projects",
                "Optimize summary to include target job title and years of experience",
                "Use action verbs consistently (Developed, Implemented, Led, Designed)"
            ],
            skillGaps: ["Docker", "Kubernetes", "AWS Lambda", "GraphQL"],
            matchedSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Express", "Next.js", "TypeScript"],
            keywordDensity: {
                total: 18,
                matched: 12,
                missing: ["Docker", "Kubernetes", "CI/CD", "GraphQL", "Microservices", "Unit Testing"]
            }
        });
    }
    return "Mock response from AI.";
}

module.exports = { callNvidiaAI };