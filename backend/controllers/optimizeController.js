const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const Optimization = require('../models/Optimization');
const Resume = require('../models/Resume');
const { callNvidiaAI } = require('../utils/bytez');

// Helper: Scrape job description from a URL
async function scrapeJobDescription(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Try common job description selectors
        let description = '';
        const selectors = [
            '.description__text',        // LinkedIn
            '.job-description',           // Generic
            '.jobsearch-jobDescriptionText', // Indeed
            '#job-details',               // LinkedIn alt
            '[data-testid="job-details"]',
            '.posting-requirements',
            'article',
            '.job-posting-content',
        ];

        for (const selector of selectors) {
            const text = $(selector).text().trim();
            if (text && text.length > 100) {
                description = text;
                break;
            }
        }

        // Fallback: get all meaningful text from body
        if (!description) {
            description = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
        }

        return description;
    } catch (error) {
        console.error('Job scraping error:', error.message);
        return null;
    }
}

// Main optimization function 
async function performOptimization(optimizationId) {
    const optimization = await Optimization.findById(optimizationId);
    if (!optimization) {
        console.error(`[AI Worker] Optimization ${optimizationId} not found`);
        return;
    }

    try {
        optimization.status = 'processing';
        await optimization.save();
        console.log(`[AI Worker] Starting optimization for: ${optimization._id}`);

        const resumeText = optimization.originalText;
        const jobDescription = optimization.jobDescription || '';

        // Step 1: Optimize resume for ATS
        const optimizePrompt = `You are an expert ATS Resume Optimizer. Optimize the following resume to be ATS-friendly for the given job description.

RULES:
- Keep all factual information the same
- Improve formatting for ATS parsers
- Add relevant keywords from the job description naturally
- Improve bullet points to show impact with metrics where possible
- Use industry-standard section headings
- Remove any graphics/table references
- Keep it concise and professional

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : 'Optimize for general ATS compatibility.'}

Return ONLY the optimized resume text, no explanations.`;

        const optimizedText = await callNvidiaAI(optimizePrompt, 'Optimize this resume.');

        // Step 2: Score the resume
        const scorePrompt = `You are an ATS scoring expert. Analyze the following resume against the job description and provide a detailed assessment.

Resume:
${optimizedText}

${jobDescription ? `Job Description:\n${jobDescription}` : 'Score for general ATS compatibility.'}

Return STRICT JSON format:
{
    "atsScore": 85,
    "suggestions": [
        "Add more quantifiable achievements",
        "Include missing keyword: Docker",
        "Improve summary section with target role"
    ],
    "skillGaps": ["Docker", "Kubernetes", "AWS"],
    "matchedSkills": ["JavaScript", "React", "Node.js"],
    "keywordDensity": {
        "total": 15,
        "matched": 10,
        "missing": ["Docker", "CI/CD", "Agile"]
    }
}`;

        const scoreResponse = await callNvidiaAI(scorePrompt, 'Score this resume.');

        let scoreData = {};
        try {
            const jsonStr = scoreResponse.replace(/```json\n?|```\n?/g, '').trim();
            scoreData = JSON.parse(jsonStr);
        } catch (e) {
            console.error('[AI Worker] Failed to parse score response:', e);
            scoreData = {
                atsScore: 70,
                suggestions: ['Resume has been optimized for ATS compatibility'],
                skillGaps: [],
                matchedSkills: [],
                keywordDensity: { total: 0, matched: 0, missing: [] }
            };
        }

        // Update optimization record
        optimization.optimizedText = optimizedText;
        optimization.atsScore = scoreData.atsScore || 70;
        optimization.suggestions = scoreData.suggestions || [];
        optimization.skillGaps = scoreData.skillGaps || [];
        optimization.matchedSkills = scoreData.matchedSkills || [];
        optimization.keywordDensity = scoreData.keywordDensity || { total: 0, matched: 0, missing: [] };
        optimization.status = 'completed';
        optimization.completedAt = new Date();
        await optimization.save();

        console.log(`[AI Worker] Optimization completed: ${optimization._id}`);
        return optimization;
    } catch (error) {
        console.error(`[AI Worker] Optimization ${optimizationId} failed:`, error.message);
        optimization.status = 'failed';
        await optimization.save();
    }
}

// Controller: Submit resume for optimization
exports.optimizeResume = async (req, res) => {
    try {
        const { jobUrl, jobDescription: manualJD } = req.body;
        let resumeText = '';
        let originalFileName = '';

        // Get resume text from uploaded file or from saved resume
        if (req.file) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            resumeText = data.text;
            originalFileName = req.file.originalname;
            fs.unlinkSync(req.file.path);
        } else {
            // Use latest saved resume
            const savedResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
            if (!savedResume) return res.status(400).json({ error: 'No resume found. Please upload a PDF.' });
            resumeText = savedResume.rawText;
            originalFileName = savedResume.originalFileName || 'saved_resume';
        }

        // Save or update resume in Resume model (for skills, role, etc.)
        try {
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

            const aiResponse = await callNvidiaAI(systemPrompt, resumeText);
            let parsedData = {};
            try {
                const jsonString = aiResponse.replace(/```json\n|\n```/g, "").trim();
                parsedData = JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse resume data", e);
                parsedData = { skills: [], experienceYears: 0, role: "", summary: "" };
            }

            // Check if resume exists, update or create new
            const existingResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
            if (existingResume) {
                // Update existing resume
                existingResume.rawText = resumeText;
                existingResume.skills = parsedData.skills || [];
                existingResume.experienceYears = parsedData.experienceYears || 0;
                existingResume.role = parsedData.role || "";
                existingResume.summary = parsedData.summary || "";
                existingResume.originalFileName = originalFileName;
                await existingResume.save();
            } else {
                // Create new resume entry
                const resume = new Resume({
                    userId: req.user._id,
                    rawText: resumeText,
                    skills: parsedData.skills || [],
                    experienceYears: parsedData.experienceYears || 0,
                    role: parsedData.role || "",
                    summary: parsedData.summary || "",
                    originalFileName: originalFileName
                });
                await resume.save();
            }
        } catch (resumeSaveErr) {
            console.error("Error saving resume to Resume model:", resumeSaveErr.message);
        }

        // Get job description
        let jobDescription = manualJD || '';
        if (jobUrl && !jobDescription) {
            const scraped = await scrapeJobDescription(jobUrl);
            if (scraped) {
                jobDescription = scraped;
            } else {
                jobDescription = 'Could not scrape job page. Optimizing for general ATS.';
            }
        }

        // Create optimization record
        const optimization = new Optimization({
            userId: req.user._id,
            originalText: resumeText,
            jobDescription,
            jobUrl: jobUrl || '',
            originalFileName,
            status: 'processing',
            processingMethod: 'bytez'
        });
        await optimization.save();

        // Trigger AI processing in the background (Non-blocking)
        // This ensures the user gets a "Processing" response immediately
        setImmediate(() => {
            performOptimization(optimization._id).catch(err => {
                console.error('[Background Process] Unhandled error:', err);
            });
        });

        res.json({
            message: 'Resume optimization started in background',
            optimizationId: optimization._id,
            status: 'processing',
            method: 'bytez'
        });

    } catch (err) {
        console.error('Optimization error:', err);
        res.status(500).json({ error: 'Failed to optimize resume' });
    }
};

// Controller: Get single optimization status/result
exports.getOptimization = async (req, res) => {
    try {
        const optimization = await Optimization.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!optimization) return res.status(404).json({ error: 'Optimization not found' });
        res.json(optimization);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller: Get all optimizations (history)
exports.getHistory = async (req, res) => {
    try {
        const optimizations = await Optimization.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-originalText -optimizedText'); // Don't send full text in list
        res.json(optimizations);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller: Get dashboard stats
exports.getStats = async (req, res) => {
    try {
        const totalOptimizations = await Optimization.countDocuments({ userId: req.user._id });
        const completedOptimizations = await Optimization.countDocuments({ userId: req.user._id, status: 'completed' });
        const latestOptimization = await Optimization.findOne({ userId: req.user._id, status: 'completed' }).sort({ createdAt: -1 });
        const averageScore = await Optimization.aggregate([
            { $match: { userId: req.user._id, status: 'completed' } },
            { $group: { _id: null, avgScore: { $avg: '$atsScore' } } }
        ]);

        res.json({
            totalOptimizations,
            completedOptimizations,
            averageScore: averageScore.length > 0 ? Math.round(averageScore[0].avgScore) : 0,
            latestScore: latestOptimization?.atsScore || 0,
            latestOptimizationId: latestOptimization?._id || null
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Export for direct use
exports.performOptimization = performOptimization;
