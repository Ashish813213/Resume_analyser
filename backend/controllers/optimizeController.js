const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const Optimization = require('../models/Optimization');
const Resume = require('../models/Resume');
const { callBytezAI } = require('../utils/bytez');
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
        let description = '';
        const selectors = [
            '.description__text',        
            '.job-description',           
            '.jobsearch-jobDescriptionText', 
            '#job-details',               
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
        if (!description) {
            description = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
        }
        return description;
    } catch (error) {
        console.error('Job scraping error:', error.message);
        return null;
    }
}
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
        const optimizedText = await callBytezAI(optimizePrompt, 'Optimize this resume.');
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
        const scoreResponse = await callBytezAI(scorePrompt, 'Score this resume.');
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
exports.optimizeResume = async (req, res) => {
    try {
        const { jobUrl, jobDescription: manualJD } = req.body;
        let resumeText = '';
        let originalFileName = '';
        if (req.file) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            resumeText = data.text;
            originalFileName = req.file.originalname;
            fs.unlinkSync(req.file.path);
        } else {
            const savedResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
            if (!savedResume) return res.status(400).json({ error: 'No resume found. Please upload a PDF.' });
            resumeText = savedResume.rawText;
            originalFileName = savedResume.originalFileName || 'saved_resume';
        }
        let jobDescription = manualJD || '';
        if (jobUrl && !jobDescription) {
            const scraped = await scrapeJobDescription(jobUrl);
            if (scraped) {
                jobDescription = scraped;
            } else {
                jobDescription = 'Could not scrape job page. Optimizing for general ATS.';
            }
        }
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
exports.getHistory = async (req, res) => {
    try {
        const optimizations = await Optimization.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-originalText -optimizedText'); 
        res.json(optimizations);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
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
exports.performOptimization = performOptimization;
