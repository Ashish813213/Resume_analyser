# ResumeAI - Product Requirements Document (PRD)

## 1. Executive Summary

**ResumeAI** is an AI-powered full-stack web application that enables job seekers to optimize their resumes for ATS (Applicant Tracking Systems), analyze skill gaps against job descriptions, and generate personalized cover letters. The platform scrapes job postings from LinkedIn and Naukri, matches candidate skills to job requirements, and provides actionable optimization suggestions with comprehensive scoring.

**Mission**: Democratize resume optimization using AI to help job seekers land their dream jobs with ATS-compliant resumes, detailed match scores, and professionally generated cover letters.

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

### 3.1 User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Landing] → [Register] → [Login] → [Dashboard]                        │
│                                            ↓                           │
│              ┌──────────┬──────────┬──────────┬──────────┐          │
│              │ Upload  │Optimize  │ Match   │  Jobs   │          │
│              │Resume   │Resume   │Job     │Scraping │          │
│              └────┬─────┘────┬─────┘────┬─────┘────┬────┐       │
│                   │          │          │         │     │       │
│                   ↓          ↓          ↓         ↓     ↓       │
│              [Parsed   │[ATS     │[Skill   │[LinkedIn│Email│     │
│               Data]    │Score]   │Gap %]   │Jobs]   │Gen]│     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Screens

| Screen | Path | Purpose |
|--------|------|---------|
| Landing | `/` | Marketing homepage with CTAs |
| Login | `/login` | User authentication |
| Register | `/register` | New user signup |
| Dashboard | `/dashboard` | User hub with stats & quick actions |
| Upload Resume | `/dashboard/upload` | PDF upload & parsing |
| Optimize Resume | `/dashboard/optimize` | ATS optimization with JD |
| Results | `/dashboard/results` | Detailed optimization output |
| Job Match | `/dashboard/match` | Skill gap analysis |
| Jobs | `/dashboard/jobs` | Scraped job listings |
| Email Generator | `/dashboard/email` | Cover letter generation |
| History | `/dashboard/history` | Past optimizations |
| Profile | `/dashboard/profile` | User settings |

---

## 4. Functional Requirements

### 4.1 Authentication Module

#### 4.1.1 User Registration
- **Endpoint**: `POST /api/user/register`
- **Input**: `{ name, email, password }`
- **Validation**: Email uniqueness, password minimum 6 characters
- **Output**: `{ user: { id, name, email } }`
- **Security**: Bcrypt hashing with salt rounds = 10

#### 4.1.2 User Login
- **Endpoint**: `POST /api/user/login`
- **Input**: `{ email, password }`
- **Output**: `{ token, user: { id, name, email } }`
- **JWT**: 256-bit signed token with user ID payload

#### 4.1.3 Profile Retrieval
- **Endpoint**: `GET /api/user/profile`
- **Auth**: Required (Bearer token)
- **Output**: `{ user: {...}, resume: {...} }`

### 4.2 Resume Module

#### 4.2.1 Resume Upload
- **Endpoint**: `POST /api/resume/upload`
- **Auth**: Required
- **Input**: `multipart/form-data` with PDF file
- **Processing**:
  1. PDF text extraction via `pdf-parse`
  2. AI parsing prompt to extract skills, experience, role, summary
  3. Store parsed data in MongoDB
  4. Delete temporary upload file
- **Output**: `{ userId, rawText, skills[], experienceYears, role, summary }`

#### 4.2.2 Resume Retrieval
- **Endpoint**: `GET /api/resume/me`
- **Auth**: Required
- **Output**: Latest resume for authenticated user

#### 4.2.3 Job Matching
- **Endpoint**: `POST /api/resume/match`
- **Auth**: Required
- **Input**: `{ jobDescription }`
- **Processing**:
  1. AI extracts required skills from JD
  2. Compare with user's resume skills
  3. Calculate match percentage: `matchedSkills.length / jobSkills.length * 100`
  4. Identify missing skills
- **Output**: `{ jobDescription, extractedSkills[], matchScore, matchedSkills[], missingSkills[] }`

#### 4.2.4 Email Generation
- **Endpoint**: `POST /api/resume/generate-email`
- **Auth**: Required
- **Input**: `{ jobDescription, companyName }`
- **Processing**: AI generates 150-200 word cover letter
- **Output**: `{ email }`

#### 4.2.5 Job Suggestions
- **Endpoint**: `GET /api/resume/suggest-jobs`
- **Auth**: Required
- **Processing**:
  1. Derive keywords from resume role & skills
  2. Scrape LinkedIn Jobs search results
  3. Scrape Naukri job listings
  4. Fallback to AI-generated suggestions
- **Output**: `[{ title, company, description, link, source }]` (max 9)

#### 4.2.6 LinkedIn Posts Scraping
- **Endpoint**: `GET /api/resume/scrape-job-posts`
- **Auth**: Required
- **Processing**:
  1. Build boolean query from resume
  2. Scrape LinkedIn content search
  3. Handle auth wall detection
  4. Fallback to jobs search
- **Output**: `{ query, usedQuery, count, posts[], note? }`

### 4.3 Optimization Module

#### 4.3.1 Resume Optimization Submission
- **Endpoint**: `POST /api/optimize/submit`
- **Auth**: Required
- **Input**: `multipart/form-data` (optional PDF) or `{ jobUrl, jobDescription }`
- **Processing**:
  1. Extract PDF text or use saved resume
  2. Scrape job URL if provided
  3. Create Optimization record with status: 'processing'
  4. Queue background processing via `setImmediate()`
- **Output**: `{ message, optimizationId, status }`

#### 4.3.2 Background Optimization Worker
- **Trigger**: Called via `setImmediate()` after submission
- **Processing**:
  1. **Optimization Prompt**: AI rewrites resume for ATS with:
     - Same factual information preserved
     - ATS-friendly formatting
     - Keywords naturally integrated
     - Metric-based bullet points
     - Standard section headings
  2. **Scoring Prompt**: AI generates:
     - ATS score (0-100)
     - Suggestions array
     - Skill gaps array
     - Matched skills array
     - Keyword density metrics
  3. Update Optimization record
  4. Set status: 'completed' or 'failed'
- **Estimated Time**: 10-30 seconds

#### 4.3.3 Optimization Result Retrieval
- **Endpoint**: `GET /api/optimize/result/:id`
- **Auth**: Required
- **Output**: Full optimization object

#### 4.3.4 Optimization History
- **Endpoint**: `GET /api/optimize/history`
- **Auth**: Required
- **Output**: Array of past optimizations (excluding text content)

#### 4.3.5 Stats Retrieval
- **Endpoint**: `GET /api/optimize/stats`
- **Auth**: Required
- **Aggregation**:
  - Total optimizations count
  - Completed count
  - Average ATS score
  - Latest score
- **Output**: `{ totalOptimizations, completedOptimizations, averageScore, latestScore, latestOptimizationId }`

---

## 5. Data Models

### 5.1 User Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date (default: now)
}
```

### 5.2 Resume Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  rawText: String,
  skills: [String],
  experienceYears: Number,
  role: String,
  summary: String,
  originalFileName: String,
  createdAt: Date (default: now)
}
```

### 5.3 Optimization Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  originalText: String (required),
  optimizedText: String,
  jobDescription: String,
  jobUrl: String,
  atsScore: Number (default: 0),
  suggestions: [String],
  skillGaps: [String],
  matchedSkills: [String],
  keywordDensity: {
    total: Number,
    matched: Number,
    missing: [String]
  },
  status: Enum['pending', 'processing', 'completed', 'failed'],
  processingMethod: String (default: 'bytez'),
  originalFileName: String,
  createdAt: Date (default: now),
  completedAt: Date
}
```

### 5.4 JobMatch Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  jobDescription: String (required),
  extractedSkills: [String],
  matchScore: Number,
  missingSkills: [String],
  matchedSkills: [String],
  createdAt: Date (default: now)
}
```

---

## 6. API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|------------|
| POST | /api/user/register | No | New user signup |
| POST | /api/user/login | No | User login |
| GET | /api/user/profile | Yes | Get user & resume |
| POST | /api/resume/upload | Yes | Upload PDF |
| GET | /api/resume/me | Yes | Get latest resume |
| POST | /api/resume/match | Yes | Job skill matching |
| POST | /api/resume/generate-email | Yes | Cover letter gen |
| GET | /api/resume/suggest-jobs | Yes | Job recommendations |
| GET | /api/resume/scrape-job-posts | Yes | LinkedIn posts |
| GET | /api/resume/matches | Yes | Past matches |
| POST | /api/optimize/submit | Yes | Start optimization |
| GET | /api/optimize/result/:id | Yes | Get result |
| GET | /api/optimize/history | Yes | Past optimizations |
| GET | /api/optimize/stats | Yes | User statistics |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Page load time: < 2 seconds
- API response time: < 3 seconds (excluding AI processing)
- Background optimization: 10-30 seconds

### 7.2 Scalability
- Concurrent users: 100+ expected
- Resume file size: Max 5MB
- Supported format: PDF only

### 7.3 Security
- JWT tokens with 256-bit signing
- Bcrypt password hashing (salt: 10)
- File upload validation (Multer)
- CORS enabled

### 7.4 Reliability
- Fallback MongoDB: In-memory server if local DB unavailable
- Fallback AI: Mock responses when API key missing
- Error handling: Graceful degradation

### 7.5 Accessibility
- Responsive design (mobile, tablet, desktop)
- Keyboard navigation support
- Clear visual hierarchy

---

## 8. AI Prompt Engineering

### 8.1 Resume Parser Prompt
```
You are a Resume Parser. Extract the following from the resume text:
- Skills (array of strings)
- Years of Experience (number)
- Current Job Role (string)
- Professional Summary (short paragraph)

Return strict JSON format:
{
  "skills": ["skill1", "skill2"],
  "experienceYears": 5,
  "role": "Software Engineer",
  "summary": "..."
}
```

### 8.2 ATS Optimizer Prompt
```
You are an ATS Resume Optimizer.

RULES:
- Keep all factual information the same
- Improve formatting for ATS parsers
- Add relevant keywords from job description
- Use industry-standard section headings
- Remove graphics/table references

Return ONLY optimized resume text.
```

### 8.3 ATS Scorer Prompt
```
Analyze the resume against the job description and return STRICT JSON:
{
  "atsScore": 85,
  "suggestions": ["...", "..."],
  "skillGaps": ["...", "..."],
  "matchedSkills": ["...", "..."],
  "keywordDensity": { "total": 15, "matched": 10, "missing": ["..."] }
}
```

---

## 9. Third-Party Integrations

### 9.1 AI Service (Bytez API)
- **Base URL**: `https://api.bytez.com/v1/chat/completions`
- **Model**: `openai/gpt-4o`
- **Fallback**: Mock responses when API key unavailable
- **Error Handling**: Graceful fallback to static data

### 9.2 Job Scraping Targets
- **LinkedIn**: `linkedin.com/jobs/search`
- **Naukri**: `naukri.com`
- **Tools**: axios + cheerio for HTML parsing
- **User-Agent**: Simulated browser headers

### 9.3 PDF Processing
- **Library**: `pdf-parse`
- **Output**: Extracted text string
- **Limitations**: Image-based PDFs not supported

---

## 10. Project Structure

```
Resume_Analyser/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   └── optimizeController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── Optimization.js
│   │   └── JobMatch.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   └── optimizeRoutes.js
│   ├── utils/
│   │   └── bytez.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── email/
│   │   │   ├── history/
│   │   │   ├── jobs/
│   │   │   ├── layout.tsx
│   │   │   ├── match/
│   │   │   ├── optimize/
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── results/
│   │   │   └── upload/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── finetune.txt
```

---

## 11. Deployment Requirements

### 11.1 Environment Variables

**Backend (.env)**
```
PORT=5000
DB_CONNECT=mongodb://localhost:27017/resumematch
JWT_SECRET=your_secure_jwt_secret
BYTEZ_API_KEY=your_bytez_api_key
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 11.2 Running the Application

```bash
# Backend
cd backend
npm install
npm start  # Runs on port 5000

# Frontend
cd frontend
npm install
npm run dev  # Runs on port 3000
```

---

## 12. Acceptance Criteria

### 12.1 Authentication
- [ ] User can register with name, email, password
- [ ] User can login and receive JWT token
- [ ] Protected routes require valid token

### 12.2 Resume Management
- [ ] PDF upload extracts text correctly
- [ ] AI parses skills, experience, role, summary
- [ ] Resume retrieved from database

### 12.3 Optimization
- [ ] Background processing completes within 30 seconds
- [ ] ATS score displayed (0-100)
- [ ] Suggestions and skill gaps provided
- [ ] Optimized text retrievable

### 12.4 Job Matching
- [ ] Job description input accepted
- [ ] Match percentage calculated
- [ ] Matched and missing skills identified

### 12.5 Job Scraping
- [ ] LinkedIn jobs scraped (with fallback)
- [ ] Naukri jobs scraped (with fallback)
- [ ] Clean job objects returned

### 12.6 Email Generation
- [ ] Cover letter generated (150-200 words)
- [ ] Company name incorporated

### 12.7 UI/UX
- [ ] Dark theme with glassmorphism effects
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states displayed
- [ ] Error messages shown

---

## 13. Future Enhancements

| Priority | Feature | Description |
|----------|---------|------------|
| High | PDF Export | Download optimized resume as PDF |
| High | Multiple Resumes | Store and switch between resumes |
| Medium | LinkedIn OAuth | Import profile directly |
| Medium | Email Scheduler | Send cover letters via SMTP |
| Medium |ATS Templates | Multiple resume templates |
| Low | Team Features | Recruiter dashboard |
| Low | Analytics | Detailed application tracking |

---

## 14. Known Limitations

1. **PDF Parsing**: Only text-based PDFs work; scanned images require OCR
2. **Job Scraping**: LinkedIn blocks unauthenticated requests; rate limiting applies
3. **AI Dependence**: Quality depends on Bytez API response
4. **File Size**: 5MB max upload
5. **Concurrent Processing**: Single background worker (serialized optimizations)

---

## 15. Success Metrics

| Metric | Target |
|--------|-------|
| User Registration | 10,000+ users |
| Resume Uploads | 50,000+ |
| Optimizations Completed | 100,000+ |
| Average ATS Score Improvement | +15 points |
| User Satisfaction | 4.5/5 rating |

---

*Document Version: 1.0*  
*Last Updated: May 2026*  
*Author: ResumeAI Product Team*