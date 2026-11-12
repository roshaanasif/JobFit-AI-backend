# JobFit AI Backend

A Node.js + Express backend for a resume-to-job-fit analysis platform. The service allows users to register, authenticate, manage profiles, upload resumes and job descriptions, analyze resume-job alignment using Gemini AI, and review historical reports and dashboard KPIs.

## Overview

JobFit AI Backend is designed to power a resume matching and career preparation workflow. Users can:

- create an account and authenticate securely
- update profile information and profile pictures
- upload a resume and target job description
- generate an AI-based job-fit report with match score, skill gaps, interview questions, and preparation plan
- review historical reports and dashboard metrics
- manage JWT and refresh-token-based sessions

The API is built with Express and MongoDB, and uses Google Gemini for analysis and Cloudinary for profile picture storage.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Cloudinary (profile image uploads)
- Google Gemini API (resume analysis)
- Multer (file uploads)
- PDF parsing and OCR support
- CORS and cookie parsing

## Features

### Authentication and session management

- user registration
- user login
- logout with token blacklist support
- refresh-token renewal
- authenticated route protection with middleware

### Profile management

- update name and email
- upload profile picture
- delete profile picture
- fetch authenticated user details

### Resume analysis

- upload resume in PDF form
- upload or provide job description text
- extract text from uploaded job description images if needed
- generate a structured AI report

### AI-generated report output

Each report can include:

- job role and company information
- overall match score (0-100)
- missing or weak skills
- technical interview questions with model answers and intent
- day-by-day preparation plan
- timestamps and report history

### Dashboard and report history

- total analysis summary per user
- average match score
- strong matches count
- skill gap totals
- report history filtering and pagination
- recent reports retrieval
- searchable history by role, company, or skill

## Project Structure

```text
backend/
├── .env
├── .gitignore
├── package.json
├── server.js
├── README.md
├── node_modules/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.Controllers.js
│   │   ├── profile.Controllers.js
│   │   └── report.Controllers.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── file.middleware.js
│   ├── models/
│   │   ├── report.model.js
│   │   ├── tokenblacklisting.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── profile.routes.js
│   │   └── report.routes.js
│   ├── services/
│   │   ├── cloudinary.service.js
│   │   └── gemini.service.js
│   └── utils/
│       ├── extractTextFromImage.js
│       └── reportSchema.zod.js
└── package-lock.json
```

## Prerequisites

Before running the project, make sure you have:

- Node.js v18 or newer
- MongoDB instance running locally or remotely
- Google Gemini API key
- Cloudinary account and credentials
- a frontend running on `http://localhost:3000` if using CORS-enabled browser testing

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Notes:

- `MONGODB_URI` is required for database connection.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` must be strong random strings.
- `GEMINI_API_KEY` powers the AI resume match analysis.
- Cloudinary credentials are used for profile-picture uploads.

## Installation

```bash
npm install
```

## Running the Project

Start the backend server:

```bash
npm run dev
```

By default, the app listens on:

```text
http://localhost:5000
```

## API Endpoints

All routes are mounted under `/api`.

### Authentication

#### Register user

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Login user

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Get current user

```http
GET /api/auth/get-me
```

Requires authentication.

#### Logout user

```http
POST /api/auth/logout
```

Requires authentication.

#### Refresh token

```http
GET /api/auth/refresh-token
```

Uses the refresh token from cookies.

### Profile

#### Update profile

```http
PUT /api/profile/
```

Form-data fields:

- `name`
- `email`
- `profilePicture` (optional image file)

Requires authentication.

#### Upload profile picture

```http
POST /api/profile/picture
```

Form-data field:

- `profilePicture`

#### Delete profile picture

```http
DELETE /api/profile/picture
```

Requires authentication.

### Reports

#### Generate resume/job-fit report

```http
POST /api/report/
```

Multipart form-data:

- `resume` (required file)
- `jobDescription` (optional file)
- `description` (optional text)
- `jobDescription` as a text field, if file upload is not used

Example:

```bash
curl -X POST http://localhost:5000/api/report \
  -H "Cookie: Jwt_Token=YOUR_TOKEN" \
  -F "resume=@resume.pdf" \
  -F "jobDescription=@job-description.txt"
```

#### Get single report by ID

```http
GET /api/report/:id
```

Requires authentication. Only the owning user can access their report.

#### Get report history

```http
GET /api/report/report-history/:id
```

Query parameters:

- `recent=true` for latest 3 reports
- `page` for pagination
- `limit` for items per page

#### Search report history

```http
POST /api/report/report-history/search
```

Request body:

```json
{
  "search": "backend developer"
}
```

Query parameters:

- `filter=all|strong|good|low`
- `page`
- `limit`

### Dashboard

#### Get dashboard KPIs

```http
GET /api/dashboard/KPI
```

Requires authentication.

Returns metrics such as:

- total analyses
- average match score
- strong matches count
- total skill gaps

## Authentication Behavior

The API uses JWTs stored in cookies and also supports Bearer tokens via the `Authorization` header when needed. The middleware checks for a valid token and rejects invalid or expired user sessions.

Typical cookie names:

- `Jwt_Token`
- `refreshToken`

## Data Models

### User model

Fields include:

- `name`
- `email`
- `password` (hashed via bcrypt)
- `profilePicture`
- `public_id`
- timestamps

### Report model

Fields include:

- `user`
- `jobRole`
- `company`
- `jobDescription`
- `description`
- `resume`
- `matchScore`
- `skillGap`
- `preparationPlan`
- `technicalQuestions`
- timestamps

### Token blacklist model

Used for invalidating logged-out tokens.

## AI Report Logic

The backend integrates with Google Gemini to compare the uploaded resume against a job description. The generated result focuses on:

- resume-to-role alignment
- missing technical skills
- interview question preparation
- actionable study plan

The output is structured according to a Zod-based report schema used in the generator service.

## File Handling

The system uses Multer with in-memory storage and a 3MB file limit per upload. Profile images use Cloudinary, while resume and description files are processed by the server for AI-based analysis.

## CORS and Local Development

The API is configured for local development with:

```js
origin: "http://localhost:3000"
```

This means the frontend should typically run on port 3000 while the backend runs on port 5000.

## Security Notes

- password hashing with bcrypt
- JWT-based protected routes
- refresh-token rotation support
- logout invalidates tokens by storing them in a blacklist collection
- production-ready cookie settings can be enforced using `secure` and `sameSite` settings

## Limitations / Notes

- profile picture upload and report generation require valid Cloudinary and Gemini configuration
- the app currently assumes local frontend access on `localhost:3000`
- file size is limited to 3MB via Multer for uploads
- AI output depends on the quality and completeness of the resume and the job description


