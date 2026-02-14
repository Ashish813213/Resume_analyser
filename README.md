# ResumeMatch

A simple full-stack web application for resume parsing, job matching, and email generation using AI.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI**: Bytez API (Mocked/Proxy to GPT-4o)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (already created) with your credentials:
   ```env
   PORT=5000
   DB_CONNECT=mongodb://localhost:27017/resumematch
   JWT_SECRET=your_jwt_secret
   BYTEZ_API_KEY=your_api_key
   ```
   **Important**: You must have MongoDB installed and running.
   - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Install it and ensure the service is running.
4. Start the server:
   ```bash
   npm start
   ```
   Server runs on http://localhost:5000

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on http://localhost:3000

## Features
- **Register/Login**: Secure JWT authentication.
- **Upload Resume**: Upload PDF to extract skills and summary.
- **Job Match**: Paste a JD to see skill match percentage.
- **Email Gen**: Generate a cover letter based on your resume and target job.

## AI Configuration
## Fallbacks Implemented
- **Database**: If a local MongoDB instance is not found, the app will automatically start an **in-memory MongoDB** instance. Note that data will be lost when the server stops.
- **AI Service**: If no valid `BYTEZ_API_KEY` is provided in `.env`, the app will use **mock data** for resume parsing and email generation, so you can test the UI flow without an API key.
