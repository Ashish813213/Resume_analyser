# ResumeAnalyser - Project Context

## Overview
A full-stack web application for resume parsing, job matching, optimization, and AI-powered email generation.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, TypeScript
- **Backend**: Node.js, Express, MongoDB (local or in-memory)
- **AI**: Bytez API (GPT-4o proxy)

## Project Structure

```
Resume_Analyser/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── routes/
│   │   ├── authRoutes.js     # /api/user endpoints
│   │   ├── resumeRoutes.js   # /api/resume endpoints
│   │   └── optimizeRoutes.js  # /api/optimize endpoints
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   └── optimizeController.js
│   ├── models/
│   │   ├── User.js           # Schema: name, email, password
│   │   ├── Resume.js         # Schema: userId, rawText, skills, experienceYears, role, summary, location
│   │   ├── Optimization.js  # Schema: ATS scores, suggestions, skillGaps
│   │   └── JobMatch.js      
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── utils/
│   │   └── bytez.js        # AI API integration
│   ├── mongo_data/           # Persistent in-memory MongoDB storage
│   ├── .env                # PORT=5000, JWT_SECRET, BYTEZ_API_KEY
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Tailwind + custom styles
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx  # Sidebar included
│   │       ├── page.tsx    # Main dashboard
│   │       ├── upload/
│   │       │   └── page.tsx
│   │       ├── results/
│   │       │   └── page.tsx
│   │       ├── optimize/
│   │       │   └── page.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── match/
│   │       │   └── page.tsx
│   │       ├── email/
│   │       │   └── page.tsx
│   │       ├── history/
│   │       │   └── page.tsx
│   │       └── jobs/
│   │           └── page.tsx
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── public/              # SVG assets
│   ├── .next/              # Build output
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication (`/api/user`)
- `POST /register` - Register new user
- `POST /login` - Login, returns JWT token
- `GET /profile` - Get user profile (requires auth)

### Resume (`/api/resume`)
- `POST /upload` - Upload PDF resume (requires auth, multipart)
- `GET /me` - Get current user's resume (requires auth)
- `POST /match` - Match resume against job description (requires auth)
- `GET /matches` - Get job matches (requires auth)
- `GET /suggest-jobs` - Get job suggestions (requires auth)
- `GET /scrape-job-posts` - Scrape LinkedIn jobs (requires auth)
- `POST /generate-email` - Generate cover letter email (requires auth)

### Optimization (`/api/optimize`)
- `POST /submit` - Submit resume for ATS optimization (requires auth)
- `GET /result/:id` - Get optimization result by ID (requires auth)
- `GET /history` - Get optimization history (requires auth)
- `GET /stats` - Get dashboard statistics (requires auth)

## Features

1. **User Auth**: JWT-based registration/login
2. **Resume Upload**: PDF parsing with pdf-parse library
3. **Job Matching**: Match resume skills against job descriptions
4. **ATS Optimization**: AI-powered resume rewriting with scoring
5. **Cover Letter Generation**: AI-generated emails
6. **Job Scraping**: LinkedIn and Naukri job post scraping (cheerio)
7. **Dashboard Stats**: Track optimizations, scores, history
8. **Naukri Job Search**: Full URL format support with location, experience, campus filters

## Naukri Job Search URL Format

Job search URLs generated with:
- Keywords: `?k={keywords}`
- Location: `/keyword-jobs-in-location` or `?l={location}`
- Experience: `?experience={years}`
- Campus/ fresher: `?naukriCampus=true`
- Product source: `?qproductJobSource=2`

Example: `https://www.naukri.com/ai-ml-engineer-jobs-in-mumbai?k=ai%20ml%20engineer&l=mumbai&qproductJobSource=2`

## Running the App

### Backend
```bash
cd backend
npm install
npm start   # Runs on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_CONNECT=mongodb://127.0.0.1:27017/resumematch
JWT_SECRET=supersecretkey123
BYTEZ_API_KEY=3f2f23f370ffbb76a806b756ee5db640
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Design System (Tailwind CSS v4)

Custom color palette:
- Cream background: `#f2eae0`
- Accent primary: `#003049`
- Mauve: `#bda6ce`
- Lavender: `#9b8ec7`
- Mist: `#b4d3d9`

Components: glass-card, btn-primary, btn-secondary, input-premium, skill-chip, stat-card, score-ring, upload-zone, progress-bar

## Database Fallbacks
- MongoDB: Uses local MongoDB if available, otherwise starts embedded in-memory MongoDB (persists to ./mongo_data)
- AI: Uses mock data if BYTEZ_API_KEY is not configured