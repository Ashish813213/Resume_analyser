const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const Resume = require('../models/Resume');
const JobMatch = require('../models/JobMatch');
const { callBytezAI } = require('../utils/bytez');

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded');

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        const rawText = data.text;

        // Call AI to parse resume
        const systemPrompt = `You are a Resume Parser. Extract the following information from the resume text provided:
    - Skills (as a list of strings)
    - Years of Experience (number)
    - Current Job Role (string)
    - Professional Summary (short paragraph)
    
    Return the output in strict JSON format:
    {
      "skills": ["skill1", "skill2"],
      "experienceYears": 5,
      "role": "Software Engineer",
      "summary": "..."
    }`;

        const aiResponse = await callBytezAI(systemPrompt, rawText);
        let parsedData = {};
        try {
            // Clean markdown code blocks if present
            const jsonString = aiResponse.replace(/```json\n|\n```/g, "").trim();
            parsedData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse AI response", e);
            parsedData = { skills: [], experienceYears: 0, role: "Unknown", summary: "Failed to parse" };
        }

        const resume = new Resume({
            userId: req.user._id,
            rawText: rawText,
            skills: parsedData.skills || [],
            experienceYears: parsedData.experienceYears || 0,
            role: parsedData.role || "",
            summary: parsedData.summary || "",
            originalFileName: req.file.originalname
        });

        const savedResume = await resume.save();

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(savedResume);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during resume processing');
    }
};

exports.getResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        if (!resume) return res.status(404).send("Resume not found");
        res.json(resume);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

exports.matchJob = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

        if (!resume) return res.status(400).send('Please upload a resume first');

        // Call AI to extract skills from JD
        const systemPrompt = `Extract required technical skills and qualifications from the job description. Return only a JSON array of strings. Example: ["React", "Node.js"]`;
        const aiResponse = await callBytezAI(systemPrompt, jobDescription);

        let jobSkills = [];
        try {
            const jsonString = aiResponse.replace(/```json\n|\n```/g, "").trim();
            jobSkills = JSON.parse(jsonString);
        } catch (e) {
            jobSkills = [];
        }

        // Calculate match
        const resumeSkillsLower = resume.skills.map(s => s.toLowerCase());
        const matchedSkills = jobSkills.filter(skill => resumeSkillsLower.includes(skill.toLowerCase()));
        const missingSkills = jobSkills.filter(skill => !resumeSkillsLower.includes(skill.toLowerCase()));

        const matchScore = jobSkills.length > 0
            ? Math.round((matchedSkills.length / jobSkills.length) * 100)
            : 0;

        const jobMatch = new JobMatch({
            userId: req.user._id,
            jobDescription,
            extractedSkills: jobSkills,
            matchScore,
            matchedSkills,
            missingSkills
        });

        await jobMatch.save();
        res.json(jobMatch);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during job matching');
    }
};

exports.generateEmail = async (req, res) => {
    try {
        const { jobDescription, companyName } = req.body;
        const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

        if (!resume) return res.status(400).send('Please upload a resume first');

        const systemPrompt = `You are a professional career assistant. Write a short, punchy cover letter email (150-200 words) for a job application based on the user's resume summary and the job description provided. Company Name: ${companyName}.
        
        Resume Summary: ${resume.summary}
        
        Job Description: ${jobDescription}
        
        Return only the email body text.`;

        const emailBody = await callBytezAI(systemPrompt, "Generate the email.");

        res.json({ email: emailBody });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error generating email');
    }
};

exports.suggestJobs = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        if (!resume) return res.status(400).send('Please upload a resume first');

        let suggestions = [];

        // Check if there are query parameters for LinkedIn scraping OR auto-generate them
        let scrapeUrl = req.query.linkedInUrl;

        if (!scrapeUrl) {
            // Auto-generate LinkedIn Search URL based on Resume
            const keywords = resume.skills.slice(0, 2).join(" ") + " " + (resume.role || "");
            const location = "India"; // Defaulting to India as per user context, or make it dynamic later
            console.log(`Auto-generating LinkedIn search for: ${keywords}`);
            scrapeUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
        }

        console.log("Scraping LinkedIn URL:", scrapeUrl);

        try {
            const response = await axios.get(scrapeUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });

            const $ = cheerio.load(response.data);

            $('li').each((i, element) => {
                const title = $(element).find('h3.base-search-card__title').text().trim();
                const company = $(element).find('h4.base-search-card__subtitle').text().trim();
                const link = $(element).find('a.base-card__full-link').attr('href');
                const location = $(element).find('span.job-search-card__location').text().trim();
                // LinkedIn search results don't clearly expose the full description in the list view
                // We will use a placeholder that encourages the user to click the link
                const description = `Job at ${company} in ${location}. Click 'Apply' to see full details on LinkedIn.`;

                if (title && company && link) {
                    suggestions.push({
                        title,
                        company,
                        description,
                        link,
                        source: 'LinkedIn'
                    });
                }
            });

            // Limit to 6 suggestions to avoid overwhelming
            suggestions = suggestions.slice(0, 9);

        } catch (scrapeErr) {
            console.error("LinkedIn Scrape Error:", scrapeErr.message);
            // Fallback to AI will happen below if suggestions is empty
        }

        // If scraping yielded no results (or anti-bot blocked it), use AI as backup
        if (suggestions.length === 0) {
            const systemPrompt = `You are a Career Advisor. Based on the user's resume, suggest 3 relevant job opportunities.
            For each job, provide:
            - Job Title
            - Company Name (use "Tech Corp", "Data Systems Inc" or similar realistic placeholders if specific real ones aren't available)
            - Brief Job Description (emphasizing skills found in the resume)
            
            Resume Summary: ${resume.summary}
            Skills: ${resume.skills.join(", ")}
            
            Return the output in strict JSON format:
            [
              {
                "title": "Frontend Developer",
                "company": "Tech Innovators",
                "description": "Looking for a React expert..."
              }
            ]`;

            const aiResponse = await callBytezAI(systemPrompt, "Suggest jobs.");

            try {
                const jsonString = aiResponse.replace(/```json\n|\n```/g, "").trim();
                suggestions = JSON.parse(jsonString);
            } catch (e) {
                console.error("AI Parse Error", e);
                suggestions = [];
            }
        }

        res.json(suggestions);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error suggesting jobs');
    }
};

exports.getJobMatches = async (req, res) => {
    try {
        const matches = await JobMatch.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error fetching matches');
    }
};
