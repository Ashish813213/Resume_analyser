const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const Resume = require('../models/Resume');
const JobMatch = require('../models/JobMatch');
const { callNvidiaAI } = require('../utils/bytez');

function deriveSearchKeywordsFromResume(resume) {
    const tokens = [];

    if (resume?.role && resume.role.trim()) {
        tokens.push(resume.role.trim());
    }

    if (Array.isArray(resume?.skills)) {
        for (const skill of resume.skills.slice(0, 3)) {
            if (skill && skill.trim()) {
                tokens.push(skill.trim());
            }
        }
    }

    if (tokens.length === 0) {
        return 'Software Engineer';
    }

    return Array.from(new Set(tokens)).join(' ');
}

function buildLinkedInJobsSearchUrl(linkedInUrl, resumeKeywords) {
    let fallback = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(resumeKeywords)}&location=${encodeURIComponent('India')}`;

    // Support /search/results/content/ URLs (for hiring posts)
    if (linkedInUrl && linkedInUrl.includes('/search/results/content/')) {
        try {
            const parsed = new URL(linkedInUrl);
            // Keep the content search path, just update keywords
            parsed.searchParams.set('keywords', resumeKeywords);
            return parsed.toString();
        } catch (err) {
            return fallback;
        }
    }

    if (!linkedInUrl) {
        return fallback;
    }

    try {
        const parsed = new URL(linkedInUrl);

        if (parsed.hostname.includes('linkedin.com') && !parsed.pathname.includes('/jobs/search')) {
            parsed.pathname = '/jobs/search';
        }

        parsed.searchParams.set('keywords', resumeKeywords);

        if (!parsed.searchParams.has('location')) {
            parsed.searchParams.set('location', 'India');
        }

        return parsed.toString();
    } catch (err) {
        return fallback;
    }
}

function buildNaukriSearchUrl(resumeKeywords, location = 'India', experience = null, campusOnly = false) {
    const slug = String(resumeKeywords || 'software-engineer')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .trim()
        .replace(/\s+/g, '-');

    const locationSlug = location ? location.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') : '';

    let baseUrl = locationSlug
        ? `https://www.naukri.com/${slug}-jobs-in-${locationSlug}`
        : `https://www.naukri.com/${slug}-jobs`;

    const params = new URLSearchParams();
    if (resumeKeywords) params.set('k', resumeKeywords);
    if (location) params.set('l', location);
    if (experience !== null) params.set('experience', experience);
    if (campusOnly) params.set('naukriCampus', 'true');
    params.set('qproductJobSource', '2');

    return `${baseUrl}?${params.toString()}`;
}

function deriveBooleanPostQueryFromResume(resume) {
    const baseKeyword = (resume?.role && resume.role.trim())
        ? resume.role.trim()
        : (resume?.skills?.[0] || 'software engineer');

    const seniorityKeyword = (resume?.experienceYears || 0) <= 1
        ? 'fresher'
        : ((resume?.experienceYears || 0) <= 3 ? 'junior' : 'experienced');

    return `"${baseKeyword}" AND "${seniorityKeyword}" AND "job"`;
}

function deriveContentQueryCandidates(resume) {
    const baseKeyword = (resume?.role && resume.role.trim())
        ? resume.role.trim()
        : (resume?.skills?.[0] || 'software engineer');
    const seniorityKeyword = (resume?.experienceYears || 0) <= 1
        ? 'fresher'
        : ((resume?.experienceYears || 0) <= 3 ? 'junior' : 'experienced');

    return Array.from(new Set([
        deriveBooleanPostQueryFromResume(resume),
        `"${baseKeyword}" AND "hiring" AND "job"`,
        `${baseKeyword} ${seniorityKeyword} jobs`,
        `${baseKeyword} job opening`
    ]));
}

function buildLinkedInContentSearchUrl(linkedInUrl, booleanQuery) {
    const fallback = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(booleanQuery)}&origin=SWITCH_SEARCH_VERTICAL`;

    if (!linkedInUrl) {
        return fallback;
    }

    try {
        const parsed = new URL(linkedInUrl);

        if (parsed.hostname.includes('linkedin.com') && !parsed.pathname.includes('/search/results/content')) {
            parsed.pathname = '/search/results/content/';
        }

        parsed.searchParams.set('keywords', booleanQuery);
        if (!parsed.searchParams.has('origin')) {
            parsed.searchParams.set('origin', 'SWITCH_SEARCH_VERTICAL');
        }

        return parsed.toString();
    } catch (err) {
        return fallback;
    }
}

function isLikelyLinkedInAuthWall(html) {
    if (!html || typeof html !== 'string') return false;

    const lower = html.toLowerCase();
    return lower.includes('sign in to linkedin')
        || lower.includes('join linkedin')
        || lower.includes('/checkpoint/challenge')
        || lower.includes('authwall')
        || lower.includes('security verification')
        || lower.includes('captcha');
}

function extractContentPostsFromLinkedInHtml(html) {
    const $ = cheerio.load(html);
    const posts = [];
    const seen = new Set();

    const pushPost = (post) => {
        if (!post.title || !post.link) return;
        const key = `${post.title}::${post.link}`;
        if (seen.has(key)) return;
        seen.add(key);
        posts.push(post);
    };

    $('.reusable-search__result-container, .search-result__wrapper, .entity-result, [data-urn*="activity"], .search-results-container li').each((_, element) => {
        const card = $(element);

        const author = card
            .find('.update-components-actor__name, .entity-result__primary-subtitle, .actor-name, .app-aware-link span[aria-hidden="true"]')
            .first()
            .text()
            .replace(/\s+/g, ' ')
            .trim();

        const snippet = card
            .find('.update-components-text, .feed-shared-update-v2__description, .entity-result__summary, p')
            .first()
            .text()
            .replace(/\s+/g, ' ')
            .trim();

        const link = card
            .find('a.app-aware-link[href*="/posts/"], a[href*="/feed/update/"], a[href*="/posts/"]')
            .first()
            .attr('href');

        const timeText = card
            .find('.update-components-actor__sub-description, .entity-result__secondary-subtitle')
            .first()
            .text()
            .replace(/\s+/g, ' ')
            .trim();

        const normalizedLink = !link
            ? ''
            : (link.startsWith('http') ? link : `https://www.linkedin.com${link}`);

        const title = snippet
            ? snippet.slice(0, 120)
            : (author ? `${author} posted a job update` : 'LinkedIn job post');

        pushPost({
            title,
            author: author || 'Unknown',
            description: snippet || 'No text preview available for this post.',
            postedAt: timeText || 'Unknown',
            link: normalizedLink,
            source: 'LinkedIn Content Search',
        });
    });

    return posts;
}

function extractJobsAsPostCards(html) {
    const $ = cheerio.load(html);
    const posts = [];
    const seen = new Set();

    const pushPost = (post) => {
        if (!post.title || !post.link) return;
        const key = `${post.title}::${post.link}`;
        if (seen.has(key)) return;
        seen.add(key);
        posts.push(post);
    };

    $('.base-search-card, .base-card').each((_, element) => {
        const card = $(element);
        const title = card.find('h3.base-search-card__title, .base-search-card__title, h3').first().text().replace(/\s+/g, ' ').trim();
        const company = card.find('h4.base-search-card__subtitle, .base-search-card__subtitle, h4').first().text().replace(/\s+/g, ' ').trim();
        const link = card.find('a.base-card__full-link, a').first().attr('href');
        const location = card.find('.job-search-card__location, .base-search-card__metadata').first().text().replace(/\s+/g, ' ').trim();
        const normalizedLink = !link
            ? ''
            : (link.startsWith('http') ? link : `https://www.linkedin.com${link}`);

        pushPost({
            title,
            author: company || 'Unknown Company',
            description: `Job at ${company || 'Unknown Company'}${location ? ` in ${location}` : ''}.`,
            postedAt: location || 'LinkedIn Jobs',
            link: normalizedLink,
            source: 'LinkedIn Jobs Fallback',
        });
    });

    return posts;
}

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

        const aiResponse = await callNvidiaAI(systemPrompt, rawText);
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
        const aiResponse = await callNvidiaAI(systemPrompt, jobDescription);

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

        const emailBody = await callNvidiaAI(systemPrompt, "Generate the email.");

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
        const seenLinks = new Set();

        const pushJob = ({ title, company, description, link, source }) => {
            if (!title || !company || !link) return;

            let cleanLink = link;
            if (cleanLink.startsWith('//')) {
                cleanLink = `https:${cleanLink}`;
            }
            if (!cleanLink.startsWith('http')) {
                if (source === 'Naukri') {
                    cleanLink = `https://www.naukri.com${cleanLink.startsWith('/') ? '' : '/'}${cleanLink}`;
                } else {
                    cleanLink = `https://www.linkedin.com${cleanLink.startsWith('/') ? '' : '/'}${cleanLink}`;
                }
            }

            if (seenLinks.has(cleanLink)) return;
            seenLinks.add(cleanLink);

            suggestions.push({
                title,
                company,
                description,
                link: cleanLink,
                source
            });
        };

        const resumeKeywords = deriveSearchKeywordsFromResume(resume);
        const templateUrl = req.query.linkedInUrl;
        const scrapeUrl = buildLinkedInJobsSearchUrl(templateUrl, resumeKeywords);
        const naukriUrl = buildNaukriSearchUrl(resumeKeywords, resume.location, resume.experienceYears, req.query.campus === 'true');

        console.log("Scraping LinkedIn URL:", scrapeUrl);

        let linkedInFailed = false;
        let naukriFailed = false;

        try {
            const response = await axios.get(scrapeUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });

            const $ = cheerio.load(response.data);

            $('.base-search-card, .base-card').each((i, element) => {
                const card = $(element);
                const title = card.find('h3.base-search-card__title, .base-search-card__title, h3').first().text().replace(/\s+/g, ' ').trim();
                const company = card.find('h4.base-search-card__subtitle, .base-search-card__subtitle, h4').first().text().replace(/\s+/g, ' ').trim();
                const link = card.find('a.base-card__full-link, a').first().attr('href');
                const location = card.find('.job-search-card__location, .base-search-card__metadata').first().text().replace(/\s+/g, ' ').trim();
                const description = `Job at ${company}${location ? ` in ${location}` : ''}. Click Apply to see full details on LinkedIn.`;

                pushJob({ title, company, description, link, source: 'LinkedIn' });
            });

            if (suggestions.length === 0) {
                $('li').each((i, element) => {
                    const title = $(element).find('h3.base-search-card__title').text().trim();
                    const company = $(element).find('h4.base-search-card__subtitle').text().trim();
                    const link = $(element).find('a.base-card__full-link').attr('href');
                    const location = $(element).find('span.job-search-card__location').text().trim();
                    const description = `Job at ${company} in ${location}. Click 'Apply' to see full details on LinkedIn.`;

                    pushJob({ title, company, description, link, source: 'LinkedIn' });
                });
            }
        } catch (scrapeErr) {
            console.error("LinkedIn Scrape Error:", scrapeErr.message);
            linkedInFailed = true;
        }

        try {
            const naukriResponse = await axios.get(naukriUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                timeout: 15000,
            });

            const $n = cheerio.load(naukriResponse.data);

            $n('article.jobTuple, .srp-jobtuple-wrapper, .cust-job-tuple').each((_, element) => {
                const card = $n(element);
                const titleEl = card.find('a.title, .title a, a[href*="job-listings"]').first();
                const title = titleEl.text().replace(/\s+/g, ' ').trim();
                const company = card.find('.comp-name, .subTitle a, .companyInfo .comp-name').first().text().replace(/\s+/g, ' ').trim();
                const link = titleEl.attr('href');
                const location = card.find('.locWdth, .location, .loc span').first().text().replace(/\s+/g, ' ').trim();
                const descriptionText = card.find('.job-desc, .job-description').first().text().replace(/\s+/g, ' ').trim();
                const description = descriptionText
                    ? descriptionText
                    : `Job at ${company}${location ? ` in ${location}` : ''}. Click Apply to see full details on Naukri.`;

                pushJob({ title, company, description, link, source: 'Naukri' });
            });
        } catch (naukriErr) {
            console.error('Naukri Scrape Error:', naukriErr.message);
            naukriFailed = true;
        }

        suggestions = suggestions.slice(0, 9);

        // If scraping yielded no results, use AI as backup
        if (suggestions.length === 0 || linkedInFailed) {
            console.log("Using AI fallback for job suggestions...");
            const systemPrompt = `You are a Career Advisor. Based on the user's resume, suggest 6 relevant job opportunities.
            For each job, provide:
            - Job Title (use realistic titles like "Junior Python Developer", "React Developer", "Full Stack Engineer", "Python Data Analyst")
            - Company Name (use generic realistic names like "TechCorp", "DataFlow Systems", "CloudTech", "WebSolutions", "AppDynamics")
            - Brief Job Description (2-3 sentences emphasizing skills from the resume)
            - A realistic application link (use "https://www.linkedin.com/jobs/search?keywords=[job title]&location=India")
            
            Resume Skills: ${resume.skills.join(", ")}
            Resume Role: ${resume.role || "Software Developer"}
            
            Return the output in strict JSON format:
            [
              {
                "title": "Frontend Developer",
                "company": "TechCorp",
                "description": "Looking for a React expert...",
                "link": "https://www.linkedin.com/jobs/search?keywords=Frontend Developer&location=India"
              }
            ]`;

            try {
                const aiResponse = await callNvidiaAI(systemPrompt, "Suggest jobs.");
                const jsonString = aiResponse.replace(/```json\n|\n```/g, "").trim();
                const aiSuggestions = JSON.parse(jsonString);
                
                // Convert AI suggestions to our format
                aiSuggestions.forEach((job) => {
                    if (job.title && job.company) {
                        pushJob({
                            title: job.title,
                            company: job.company,
                            description: job.description || `Job opportunity for ${job.title}`,
                            link: job.link || `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(job.title)}&location=India`,
                            source: 'AI'
                        });
                    }
                });
} catch (e) {
                console.error("AI Fallback Error", e);
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

exports.scrapeLinkedInJobPosts = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        if (!resume) return res.status(400).send('Please upload a resume first');

        const booleanQuery = deriveBooleanPostQueryFromResume(resume);
        const queryCandidates = deriveContentQueryCandidates(resume);
        const resumeKeywords = deriveSearchKeywordsFromResume(resume);
        const templateUrl = req.query.linkedInUrl;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://www.linkedin.com/',
        };

        let posts = [];
        let usedQuery = queryCandidates[0];
        let usedUrl = buildLinkedInContentSearchUrl(templateUrl, usedQuery);
        let authWallDetected = false;

        for (const candidateQuery of queryCandidates) {
            const candidateUrl = buildLinkedInContentSearchUrl(templateUrl, candidateQuery);

            try {
                const response = await axios.get(candidateUrl, {
                    headers,
                    timeout: 15000,
                });

                if (isLikelyLinkedInAuthWall(response.data)) {
                    authWallDetected = true;
                    continue;
                }

                const extracted = extractContentPostsFromLinkedInHtml(response.data);
                if (extracted.length > 0) {
                    posts = extracted;
                    usedQuery = candidateQuery;
                    usedUrl = candidateUrl;
                    break;
                }
            } catch (candidateErr) {
                console.error('LinkedIn content candidate scrape error:', candidateErr.message);
            }
        }

        let fallbackUsed = false;
        if (posts.length === 0) {
            const fallbackJobsUrl = buildLinkedInJobsSearchUrl(templateUrl, resumeKeywords);
            try {
                const fallbackResponse = await axios.get(fallbackJobsUrl, {
                    headers,
                    timeout: 15000,
                });

                posts = extractJobsAsPostCards(fallbackResponse.data);
                if (posts.length > 0) {
                    fallbackUsed = true;
                    usedUrl = fallbackJobsUrl;
                    usedQuery = `${resumeKeywords} jobs`;
                }
            } catch (fallbackErr) {
                console.error('LinkedIn jobs fallback scrape error:', fallbackErr.message);
            }
        }

        const trimmedPosts = posts.slice(0, 15);
        const note = trimmedPosts.length === 0
            ? (authWallDetected
                ? 'LinkedIn sign-in wall detected. Public content results are blocked in this request context.'
                : 'No public post cards found. LinkedIn may require sign-in for full results.')
            : (fallbackUsed
                ? 'Content posts were limited, so results were fetched from LinkedIn Jobs search fallback.'
                : undefined);

        return res.json({
            query: booleanQuery,
            usedQuery,
            sourceUrl: usedUrl,
            count: trimmedPosts.length,
            posts: trimmedPosts,
            note,
        });
    } catch (err) {
        console.error('LinkedIn content scrape error:', err.message);
        return res.status(500).json({
            error: 'Failed to scrape LinkedIn content posts',
            details: err.message,
        });
    }
};
