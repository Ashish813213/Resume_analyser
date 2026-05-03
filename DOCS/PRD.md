# ResumeAI - Product Requirements Document (PRD)

## 1. Executive Summary

**ResumeAI** is an AI-powered full-stack web application that enables job seekers to optimize their resumes for ATS (Applicant Tracking Systems), analyze skill gaps against job descriptions, and generate personalized cover letters. The platform scrapes job postings from LinkedIn and Naukri, matches candidate skills to job requirements, and provides actionable optimization suggestions with comprehensive scoring.

**Mission**: Democratize resume optimization using AI to help job seekers land their dream jobs with ATS-compliant resumes, detailed match scores, and professionally generated cover letters.

**Target Users**: Job seekers, career changers, fresh graduates, and professionals looking to improve their resume acceptance rate.

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| TypeScript | 5.x | Type-safe frontend development |
| Tailwind CSS | 3.x | Utility-first styling |
| Lucide React | Latest | Icon library |
| Axios | 1.x | HTTP client for API calls |
| React Context API | Built-in | Local state management |

### 2.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | JavaScript runtime |
| Express.js | 4.x | REST API framework |
| MongoDB | Latest | Primary database |
| Mongoose | 8.x | ODM for MongoDB |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| multer | 1.x | File upload middleware |
| pdf-parse | 1.x | PDF text extraction |
| axios | 1.x | HTTP client for scraping |
| cheerio | 1.x | HTML parsing for scraping |
| mongodb-memory-server | Latest | Fallback in-memory DB |

### 2.3 AI Integration

| Service | Model | Purpose |
|---------|-------|---------|
| Bytez API | openai/gpt-4o | Primary AI engine |
| Mock Fallback | Static JSON | Demo/offline mode |

---

## 3. User Experience

### 3.1 User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Landing] ──► [Register] ──► [Login] ──► [Dashboard]              │
│                                            │                         │
│              ┌─────────────────────────────┼─────────────────────┐   │
│              │                             │                      │   │
│              ▼                             ▼                      ▼   │
│    ┌─────────────────┐          ┌─────────────────┐                 │
│    │  Upload Resume │─────────►│  Parse Resume   │                 │
│    │   (PDF Only)   │          │  (AI Extract)   │                 │
│    └─────────────────┘          └─────────────────┘                 │
│              │                             │                         │
│              ▼                             ▼                         │
│    ┌─────────────────┐          ┌─────────────────┐                 │
│    │ Optimize Resume│─────────►│ ATS Score (0-100)│                │
│    │ + Job Desc     │          │ + Suggestions    │                 │
│    └─────────────────┘          └─────────────────┘                 │
│              │                             │                         │
│              ▼                             ▼                         │
│    ┌─────────────────┐          ┌─────────────────┐                 │
│    │   Job Match     │─────────►│  Skill Gap %    │                 │
│    │ + Job Desc     │          │ + Missing Skills│                 │
│    └─────────────────┘          └─────────────────┘                 │
│              │                             │                         │
│              ▼                             ▼                         │
│    ┌─────────────────┐          ┌─────────────────┐                 │
│    │  Job Scraping  │─────────►│ LinkedIn Jobs  │                  │
│    │ (LinkedIn/Naukri)        │ + Naukri Jobs  │                  │
│    └─────────────────┘          └─────────────────┘                 │
│              │                             │                         │
│              ▼                             ▼                         │
│    ┌─────────────────┐          ┌─────────────────┐                 │
│    │ Email Generator│─────────►│ Cover Letter   │                  │
│    │ + Company Name │          │ (150-200 words)│                │
│    └─────────────────┘          └─────────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Screens

| Screen | Path | Description |
|--------|------|-------------|
| Landing | `/` | Marketing homepage with feature highlights and CTAs |
| Login | `/login` | User authentication with email/password |
| Register | `/register` | New user signup form |
| Dashboard | `/dashboard` | User hub showing stats, quick actions, recent activity |
| Upload Resume | `/dashboard/upload` | PDF upload interface with parsing status |
| Optimize Resume | `/dashboard/optimize` | ATS optimization with job description input |
| Results | `/dashboard/results` | Detailed optimization output with score and suggestions |
| Job Match | `/dashboard/match` | Skill gap analysis against job description |
| Jobs | `/dashboard/jobs` | Scraped job listings from LinkedIn and Naukri |
| Email Generator | `/dashboard/email` | Cover letter generation interface |
| History | `/dashboard/history` | Past optimizations with search/filter |
| Profile | `/dashboard/profile` | User settings and account management |

---

## 4. Functional Requirements

### 4.1 Authentication Module

#### 4.1.1 User Registration

| Attribute | Details |
|-----------|---------|
| Endpoint | `POST /api/user/register` |
| Auth Required | No |
| Input | `{ name, email, password }` |
| Validation | Email must be unique, password minimum 6 characters |
| Output | `{ user: { id, name, email } }` |
| Security | Bcrypt hashing with salt rounds = 10 |
| Error Cases | Email already exists, invalid input format |

```javascript
// Request
POST /api/user/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}

// Response (200)
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// Error Response (400)
"Email already exists"
```

#### 4.1.2 User Login

| Attribute | Details |
|-----------|---------|
| Endpoint | `POST /api/user/login` |
| Auth Required | No |
| Input | `{ email, password }` |
| Output | `{ token, user: { id, name, email } }` |
| JWT | 256-bit signed token with user ID payload |
| Error Cases | Email not found, invalid password |

```javascript
// Request
POST /api/user/login
{
  "email": "john@example.com",
  "password": "secure123"
}

// Response (200)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// Headers
auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4.1.3 Profile Retrieval

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/user/profile` |
| Auth Required | Yes (Bearer token) |
| Output | `{ user: {...}, resume: {...} }` |

```javascript
// Request
GET /api/user/profile
Authorization: Bearer <token>

// Response (200)
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-15T10:00:00.000Z"
  },
  "resume": {
    "_id": "607f1f77bcf86cd799439022",
    "skills": ["JavaScript", "React", "Node.js"],
    "experienceYears": 3,
    "role": "Full Stack Developer",
    "summary": "Experienced developer..."
  }
}
```

### 4.2 Resume Module

#### 4.2.1 Resume Upload

| Attribute | Details |
|-----------|---------|
| Endpoint | `POST /api/resume/upload` |
| Auth Required | Yes |
| Input | `multipart/form-data` with PDF file |
| Processing | 1. PDF text extraction via `pdf-parse`<br>2. AI parsing prompt<br>3. Store in MongoDB<br>4. Delete temp file |
| Output | Complete resume object with parsed fields |
| File Size Limit | 5MB |
| Supported Format | PDF only |
| Error Cases | No file uploaded, invalid format, parsing failure |

```javascript
// Request
POST /api/resume/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="resume"; filename="resume.pdf"
<PDF binary data>
--boundary

// Response (200)
{
  "_id": "607f1f77bcf86cd799439022",
  "userId": "507f1f77bcf86cd799439011",
  "rawText": "John Doe\nFull Stack Developer...",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
  "experienceYears": 3,
  "role": "Full Stack Developer",
  "summary": "Experienced developer with focus on modern web technologies.",
  "originalFileName": "resume.pdf",
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

#### 4.2.2 Resume Retrieval

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/resume/me` |
| Auth Required | Yes |
| Output | Latest resume for authenticated user |
| Error Cases | No resume found |

```javascript
// Request
GET /api/resume/me
Authorization: Bearer <token>

// Response (200)
{
  "_id": "607f1f77bcf86cd799439022",
  "userId": "507f1f77bcf86cd799439011",
  "skills": ["JavaScript", "React", "Node.js"],
  "experienceYears": 3,
  "role": "Full Stack Developer",
  "summary": "Experienced developer...",
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

#### 4.2.3 Job Matching

| Attribute | Details |
|-----------|---------|
| Endpoint | `POST /api/resume/match` |
| Auth Required | Yes |
| Input | `{ jobDescription }` |
| Processing | 1. AI extracts required skills from JD<br>2. Compare with resume skills<br>3. Calculate match percentage<br>4. Identify missing skills |
| Match Score Formula | `(matchedSkills.length / jobSkills.length) * 100` |
| Output | Match object with score and skill arrays |

```javascript
// Request
POST /api/resume/match
Authorization: Bearer <token>
{
  "jobDescription": "We are looking for a React Developer with TypeScript experience..."
}

// Response (200)
{
  "_id": "707f1f77bcf86cd799439033",
  "userId": "507f1f77bcf86cd799439011",
  "jobDescription": "We are looking for a React Developer...",
  "extractedSkills": ["React", "TypeScript", "JavaScript", "Redux"],
  "matchScore": 75,
  "matchedSkills": ["React", "JavaScript"],
  "missingSkills": ["TypeScript", "Redux"],
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

#### 4.2.4 Email Generation

| Attribute | Details |
|-----------|---------|
| Endpoint | `POST /api/resume/generate-email` |
| Auth Required | Yes |
| Input | `{ jobDescription, companyName }` |
| Output | `{ email }` - Cover letter body |
| Length | 150-200 words |

```javascript
// Request
POST /api/resume/generate-email
Authorization: Bearer <token>
{
  "jobDescription": "We are looking for a React Developer...",
  "companyName": "Tech Corp"
}

// Response (200)
{
  "email": "Dear Hiring Manager,\n\nI am excited to apply for the React Developer position at Tech Corp..."
}
```

#### 4.2.5 Job Suggestions

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/resume/suggest-jobs` |
| Auth Required | Yes |
| Processing | 1. Derive keywords from resume<br>2. Scrape LinkedIn Jobs<br>3. Scrape Naukri<br>4. AI fallback |
| Max Results | 9 |

```javascript
// Request
GET /api/resume/suggest-jobs
Authorization: Bearer <token>

// Response (200)
[
  {
    "title": "Senior React Developer",
    "company": "WebTech Solutions",
    "description": "We are looking for a Senior React Developer...",
    "link": "https://www.linkedin.com/jobs/123456",
    "source": "LinkedIn"
  },
  {
    "title": "Full Stack Engineer",
    "company": "Cloud Systems",
    "description": "Join our team to build scalable cloud applications...",
    "link": "https://www.naukri.com/job/789012",
    "source": "Naukri"
  }
]
```

#### 4.2.6 LinkedIn Posts Scraping

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/resume/scrape-job-posts` |
| Auth Required | Yes |
| Query Param | `linkedInUrl` (optional) |
| Processing | 1. Build boolean query<br>2. Scrape LinkedIn content<br>3. Handle auth wall<br>4. Jobs fallback |

```javascript
// Request
GET /api/resume/scrape-job-posts?linkedInUrl=https://linkedin.com
Authorization: Bearer <token>

// Response (200)
{
  "query": "\"React Developer\" AND \"fresher\" AND \"job\"",
  "usedQuery": "\"React Developer\" AND \"fresher\" AND \"job\"",
  "sourceUrl": "https://www.linkedin.com/search/results/content/...",
  "count": 15,
  "posts": [
    {
      "title": "We are hiring React Developers",
      "author": "Tech Corp",
      "description": "Looking for talented developers...",
      "postedAt": "2h ago",
      "link": "https://www.linkedin.com/posts/123",
      "source": "LinkedIn Content Search"
    }
  ],
  "note": "Content posts were limited, so results were fetched from LinkedIn Jobs search fallback."
}
```

### 4.3 Optimization Module

#### 4.3.1 Resume Optimization Submission

| Attribute | Details |
|-----------|---------|
| Endpoint | `POST /api/optimize/submit` |
| Auth Required | Yes |
| Input | `multipart/form-data` (PDF) + `{ jobUrl, jobDescription }` |
| Processing | 1. Extract text or use saved resume<br>2. Scrape job URL if provided<br>3. Queue background processing |
| Background | Uses `setImmediate()` for non-blocking execution |
| Output | `{ message, optimizationId, status }` |

```javascript
// Request
POST /api/optimize/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

jobUrl: https://careers.company.com/job/123
jobDescription: (optional manual JD)

// Or with file
--boundary
Content-Disposition: form-data; name="resume"; filename="resume.pdf"
<PDF binary>
--boundary

// Response (200)
{
  "message": "Resume optimization started in background",
  "optimizationId": "807f1f77bcf86cd799439044",
  "status": "processing",
  "method": "bytez"
}
```

#### 4.3.2 Background Optimization Worker

**Phase 1: Resume Optimization**

The AI rewrites the resume for ATS compatibility following these rules:
- Preserve all factual information
- Improve formatting for ATS parsers
- Integrate relevant keywords naturally
- Use metric-based bullet points
- Apply industry-standard section headings
- Remove graphics and table references

**Phase 2: ATS Scoring**

The AI analyzes and returns structured JSON:
- ATS score (0-100)
- Actionable suggestions
- Skill gaps identification
- Matched skills list
- Keyword density metrics

```javascript
// Internal Processing Call
// After submission, worker executes:

// 1. Optimization Prompt Output
"PROFESSIONAL SUMMARY

Experienced Full Stack Developer with 3+ years of expertise..."

// 2. Scoring Prompt Output
{
  "atsScore": 82,
  "suggestions": [
    "Add more quantifiable achievements",
    "Include keywords: Docker, Kubernetes",
    "Add Projects section"
  ],
  "skillGaps": ["Docker", "Kubernetes"],
  "matchedSkills": ["JavaScript", "React", "Node.js"],
  "keywordDensity": {
    "total": 18,
    "matched": 12,
    "missing": ["Docker", "Kubernetes"]
  }
}
```

#### 4.3.3 Optimization Result Retrieval

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/optimize/result/:id` |
| Auth Required | Yes |
| Output | Full optimization object |

```javascript
// Request
GET /api/optimize/result/807f1f77bcf86cd799439044
Authorization: Bearer <token>

// Response (200)
{
  "_id": "807f1f77bcf86cd799439044",
  "userId": "507f1f77bcf86cd799439011",
  "originalText": "John Doe\nFull Stack Developer...",
  "optimizedText": "PROFESSIONAL SUMMARY\n\nExperienced Full Stack Developer...",
  "jobDescription": "We are looking for a React Developer...",
  "jobUrl": "https://careers.company.com/job/123",
  "atsScore": 82,
  "suggestions": [...],
  "skillGaps": ["Docker", "Kubernetes"],
  "matchedSkills": ["React", "JavaScript", "Node.js"],
  "keywordDensity": {...},
  "status": "completed",
  "processingMethod": "bytez",
  "originalFileName": "resume.pdf",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "completedAt": "2026-01-15T10:00:15.000Z"
}
```

#### 4.3.4 Optimization History

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/optimize/history` |
| Auth Required | Yes |
| Output | Array of past optimizations |
| Excludes | Text content (originalText, optimizedText) |

```javascript
// Request
GET /api/optimize/history
Authorization: Bearer <token>

// Response (200)
[
  {
    "_id": "807f1f77bcf86cd799439044",
    "jobUrl": "https://careers.company.com/job/123",
    "atsScore": 82,
    "status": "completed",
    "createdAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "_id": "807f1f77bcf86cd799439055",
    "jobUrl": "https://jobs.tech.com/456",
    "atsScore": 78,
    "status": "completed",
    "createdAt": "2026-01-14T15:30:00.000Z"
  }
]
```

#### 4.3.5 Statistics Retrieval

| Attribute | Details |
|-----------|---------|
| Endpoint | `GET /api/optimize/stats` |
| Auth Required | Yes |
| Aggregation | Total, Completed, Average Score, Latest Score |

```javascript
// Request
GET /api/optimize/stats
Authorization: Bearer <token>

// Response (200)
{
  "totalOptimizations": 25,
  "completedOptimizations": 22,
  "averageScore": 76,
  "latestScore": 82,
  "latestOptimizationId": "807f1f77bcf86cd799439044"
}
```

---

## 5. Data Models

### 5.1 User Schema

| Field | Type | Required | Unique | Default |
|-------|------|----------|--------|---------|
| _id | ObjectId | Auto | Yes | - |
| name | String | Yes | No | - |
| email | String | Yes | Yes | - |
| password | String | Yes | No | - |
| createdAt | Date | No | No | Date.now |

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 5.2 Resume Schema

| Field | Type | Required | Default |
|-------|------|----------|---------|
| _id | ObjectId | Auto | - |
| userId | ObjectId (ref: User) | Yes | - |
| rawText | String | No | - |
| skills | [String] | No | [] |
| experienceYears | Number | No | - |
| role | String | No | - |
| summary | String | No | - |
| originalFileName | String | No | - |
| createdAt | Date | No | Date.now |

```javascript
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rawText: { type: String },
  skills: [{ type: String }],
  experienceYears: { type: Number },
  role: { type: String },
  summary: { type: String },
  originalFileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});
```

### 5.3 Optimization Schema

| Field | Type | Required | Default |
|-------|------|----------|---------|
| _id | ObjectId | Auto | - |
| userId | ObjectId (ref: User) | Yes | - |
| originalText | String | Yes | - |
| optimizedText | String | No | - |
| jobDescription | String | No | - |
| jobUrl | String | No | - |
| atsScore | Number | No | 0 |
| suggestions | [String] | No | [] |
| skillGaps | [String] | No | [] |
| matchedSkills | [String] | No | [] |
| keywordDensity | Object | No | {total: 0, matched: 0, missing: []} |
| status | String (enum) | No | 'pending' |
| processingMethod | String | No | 'bytez' |
| originalFileName | String | No | - |
| createdAt | Date | No | Date.now |
| completedAt | Date | No | - |

```javascript
const optimizationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String, required: true },
  optimizedText: { type: String },
  jobDescription: { type: String },
  jobUrl: { type: String },
  atsScore: { type: Number, default: 0 },
  suggestions: [{ type: String }],
  skillGaps: [{ type: String }],
  matchedSkills: [{ type: String }],
  keywordDensity: {
    total: { type: Number, default: 0 },
    matched: { type: Number, default: 0 },
    missing: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingMethod: { type: String, default: 'bytez' },
  originalFileName: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});
```

### 5.4 JobMatch Schema

| Field | Type | Required | Default |
|-------|------|----------|---------|
| _id | ObjectId | Auto | - |
| userId | ObjectId (ref: User) | Yes | - |
| jobDescription | String | Yes | - |
| extractedSkills | [String] | No | [] |
| matchScore | Number | No | - |
| missingSkills | [String] | No | [] |
| matchedSkills | [String] | No | [] |
| createdAt | Date | No | Date.now |

```javascript
const jobMatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String, required: true },
  extractedSkills: [{ type: String }],
  matchScore: { type: Number },
  missingSkills: [{ type: String }],
  matchedSkills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});
```

---

## 6. API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|------------|
| POST | /api/user/register | No | Create new user account |
| POST | /api/user/login | No | Authenticate and get token |
| GET | /api/user/profile | Yes | Get user and resume data |

### Resume Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|------------|
| POST | /api/resume/upload | Yes | Upload and parse PDF |
| GET | /api/resume/me | Yes | Get latest resume |
| POST | /api/resume/match | Yes | Match skills to JD |
| POST | /api/resume/generate-email | Yes | Generate cover letter |
| GET | /api/resume/suggest-jobs | Yes | Get job recommendations |
| GET | /api/resume/scrape-job-posts | Yes | Scrape LinkedIn posts |
| GET | /api/resume/matches | Yes | Get past matches |

### Optimization Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|------------|
| POST | /api/optimize/submit | Yes | Start optimization |
| GET | /api/optimize/result/:id | Yes | Get optimization result |
| GET | /api/optimize/history | Yes | Get optimization history |
| GET | /api/optimize/stats | Yes | Get user statistics |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| API response time | < 3 seconds (excluding AI) |
| Background optimization | 10-30 seconds |
| File upload processing | < 5 seconds |

### 7.2 Scalability

| Metric | Target |
|--------|--------|
| Concurrent users | 100+ |
| Max file size | 5MB |
| Supported format | PDF only |
| API rate limit | 100 requests/minute |

### 7.3 Security

| Feature | Implementation |
|--------|----------------|
| Authentication | JWT tokens (256-bit signing) |
| Password hashing | Bcrypt (salt: 10) |
| File validation | Multer with file type checking |
| CORS | Enabled for frontend origin |
| Input sanitization | Server-side validation |

### 7.4 Reliability

| Feature | Implementation |
|--------|----------------|
| Database fallback | In-memory MongoDB if local unavailable |
| AI fallback | Mock responses when API key missing |
| Error handling | Graceful degradation with user feedback |
| Logging | Console logging for debugging |

### 7.5 Accessibility

| Feature | Requirement |
|---------|-------------|
| Responsive design | Mobile, tablet, desktop |
| Keyboard navigation | Full support |
| Visual hierarchy | Clear labels and states |
| Loading states | User feedback during processing |
| Error messages | Clear, actionable messages |

---

## 8. AI Prompt Engineering

### 8.1 Resume Parser Prompt

```
You are a Resume Parser. Extract the following information from the resume text provided:

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
}
```

### 8.2 ATS Optimizer Prompt

```
You are an expert ATS Resume Optimizer. Optimize the following resume to be ATS-friendly for the given job description.

RULES:
- Keep all factual information the same
- Improve formatting for ATS parsers
- Add relevant keywords from the job description naturally
- Improve bullet points to show impact with metrics where possible
- Use industry-standard section headings
- Remove any graphics/table references
- Keep it concise and professional

Resume:

{resumeText}

{jobDescription ? `Job Description:\n${jobDescription}` : 'Optimize for general ATS compatibility.'}

Return ONLY the optimized resume text, no explanations.
```

### 8.3 ATS Scorer Prompt

```
You are an ATS scoring expert. Analyze the following resume against the job description and provide a detailed assessment.

Resume:

{optimizedText}

{jobDescription ? `Job Description:\n${jobDescription}` : 'Score for general ATS compatibility.'}

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
}
```

### 8.4 Cover Letter Prompt

```
You are a professional career assistant. Write a short, punchy cover letter email (150-200 words) for a job application based on the user's resume summary and the job description provided. Company Name: {companyName}.

Resume Summary: {resumeSummary}

Job Description: {jobDescription}

Return only the email body text.
```

---

## 9. Third-Party Integrations

### 9.1 AI Service (Bytez API)

| Attribute | Value |
|-----------|-------|
| Base URL | `https://api.bytez.com/v1/chat/completions` |
| Model | `openai/gpt-4o` |
| Temperature | 0.7 |
| Fallback | Mock responses when API key unavailable |
| Error Handling | Graceful fallback to static data |

```javascript
// API Request
{
  model: "openai/gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.7
}

// Headers
{
  Authorization: `Bearer ${apiKey}`,
  Content-Type: "application/json"
}
```

### 9.2 Job Scraping Targets

| Platform | URL Pattern | Tools |
|----------|-------------|-------|
| LinkedIn | `linkedin.com/jobs/search` | axios + cheerio |
| Naukri | `naukri.com` | axios + cheerio |

**User-Agent Header**:
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
```

### 9.3 PDF Processing

| Library | Purpose |
|----------|---------|
| pdf-parse | Extract text from PDF |
| multer | Handle file uploads |

---

## 10. Project Structure

```
Resume_Analyser/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── resumeController.js    # Resume & job logic
│   │   └── optimizeController.js # Optimization logic
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Resume.js             # Resume schema
│   │   ├── Optimization.js      # Optimization schema
│   │   └── JobMatch.js          # JobMatch schema
│   ├── routes/
│   │   ├── authRoutes.js        # /api/user routes
│   │   ├── resumeRoutes.js     # /api/resume routes
│   │   └── optimizeRoutes.js    # /api/optimize routes
│   ├── utils/
│   │   └── bytez.js             # AI API wrapper
│   ├── .env                     # Environment config
│   ├── package.json
│   └── server.js                # Express server
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── email/
│   │   │   │   └── page.tsx    # Email generator
│   │   │   ├── history/
│   │   │   │   └── page.tsx    # Optimization history
│   │   │   ├── jobs/
│   │   │   │   └── page.tsx    # Scraped jobs
│   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   ├── match/
│   │   │   │   └── page.tsx    # Job matching
│   │   │   ├── optimize/
│   │   │   │   └── page.tsx   # Resume optimization
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── profile/
│   │   │   │   └── page.tsx   # User profile
│   │   │   ├── results/
│   │   │   │   └── page.tsx    # Optimization results
│   │   │   └── upload/
│   │   │       └── page.tsx    # Resume upload
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx       # Register page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   └── Sidebar.tsx       # Navigation sidebar
│   ├── .env.local            # Frontend env
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   └── PRD.md                # This document
│
├── README.md                 # Setup guide
└── finetune.txt             # Fine-tuning data
```

---

## 11. Deployment Requirements

### 11.1 Environment Variables

**Backend (.env)**

```env
PORT=5000
DB_CONNECT=mongodb://localhost:27017/resumematch
JWT_SECRET=your_secure_jwt_secret_min_32_chars
BYTEZ_API_KEY=your_bytez_api_key
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 11.2 Running the Application

**Backend Setup**

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server
npm start
# Server runs on http://localhost:5000
```

**Frontend Setup**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

### 11.3 Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | 20.x or higher |
| MongoDB | Latest (or use built-in fallback) |
| npm | Latest |

---

## 12. Acceptance Criteria

### 12.1 Authentication

- [ ] User can register with name, email, password
- [ ] Duplicate email shows error message
- [ ] User can login with correct credentials
- [ ] Invalid credentials show error message
- [ ] Protected routes reject requests without token
- [ ] Token is stored in localStorage after login
- [ ] Logout clears token and redirects to login

### 12.2 Resume Management

- [ ] PDF file uploads successfully
- [ ] Non-PDF files show error
- [ ] File >5MB shows size error
- [ ] AI parses skills correctly
- [ ] AI parses experience years
- [ ] AI parses job role
- [ ] AI parses summary
- [ ] Resume saved to database
- [ ] Resume retrieved correctly
- [ ] Multiple uploads replace previous resume

### 12.3 Optimization

- [ ] Submit starts background processing
- [ ] Status shows "processing" immediately
- [ ] Background worker completes in <30s
- [ ] Status updates to "completed"
- [ ] ATS score displays (0-100)
- [ ] Suggestions array populated
- [ ] Skill gaps identified
- [ ] Matched skills listed
- [ ] Optimized text retrievable
- [ ] Failed status on error

### 12.4 Job Matching

- [ ] Job description input accepted
- [ ] Skills extracted from JD
- [ ] Match percentage calculated correctly
- [ ] Matched skills displayed
- [ ] Missing skills displayed
- [ ] No resume shows appropriate error

### 12.5 Job Scraping

- [ ] LinkedIn jobs scraped successfully
- [ ] Empty results handled gracefully
- [ ] Naukri jobs scraped successfully
- [ ] Auth wall detected and handled
- [ ] Minimum 9 suggestions returned
- [ ] AI fallback generates suggestions

### 12.6 Email Generation

- [ ] Cover letter generated (150-200 words)
- [ ] Company name incorporated
- [ ] No resume shows appropriate error
- [ ] Email is professional and concise

### 12.7 UI/UX

- [ ] Dark theme applied consistently
- [ ] Glassmorphism effects visible
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] Loading spinner during API calls
- [ ] Error messages displayed clearly
- [ ] Success confirmations shown
- [ ] Navigation works correctly
- [ ] Sidebar shows active state

### 12.8 History & Stats

- [ ] History shows past optimizations
- [ ] Stats display total count
- [ ] Stats display completed count
- [ ] Stats display average score
- [ ] Stats display latest score

---

## 13. Known Limitations

| Limitation | Description | Mitigation |
|-----------|-------------|------------|
| PDF Parsing | Only text-based PDFs work; scanned images require OCR | Show error message for scanned PDFs |
| Job Scraping | LinkedIn blocks unauthenticated requests; rate limiting applies | Use fallback to AI suggestions |
| AI Dependence | Quality depends on Bytez API response | Mock fallback available |
| File Size | 5MB max upload | Show file size limit error |
| Concurrent Processing | Single background worker (serialized) | Queue system future enhancement |
| No PDF Export | Download as PDF not implemented | Future feature |

---

## 14. Future Enhancements

| Priority | Feature | Description | Status |
|----------|--------|-------------|--------|
| High | PDF Export | Download optimized resume as PDF | Planned |
| High | Multiple Resumes | Store and switch between resumes | Planned |
| Medium | LinkedIn OAuth | Import profile directly | Planned |
| Medium | Email Scheduler | Send cover letters via SMTP | Planned |
| Medium | ATS Templates | Multiple resume templates | Planned |
| Low | Team Features | Recruiter dashboard | Future |
| Low | Analytics | Detailed application tracking | Future |

---

## 15. Success Metrics

| Metric | Target |
|--------|--------|
| User Registration | 10,000+ users |
| Resume Uploads | 50,000+ |
| Optimizations Completed | 100,000+ |
| Average ATS Score Improvement | +15 points |
| User Satisfaction | 4.5/5 rating |
| Page Load Time | < 2 seconds |
| API Response Time | < 3 seconds |

---

## 16. Glossary

| Term | Definition |
|------|------------|
| ATS | Applicant Tracking System - Software used by employers to screen resumes |
| JWT | JSON Web Token - Standard for secure authentication |
| Bcrypt | Password hashing algorithm |
| multer | Node.js middleware for handling multipart/form-data |
| PDF | Portable Document Format |
| cheerio | Fast, flexible implementation of core jQuery |
| axios | Promise-based HTTP client |
| Mongoose | MongoDB object modeling tool |

---

*Document Version: 1.0*  
*Last Updated: May 2026*  
*Author: ResumeAI Product Team*