# JobTrack AI

**JobTrack AI** is a full-stack, AI-powered job application tracking system designed for university students and recent graduates. It helps you manage your job search pipeline, schedule interviews, and leverages Google Gemini AI to automatically score your resume against job descriptions and generate tailored cover letters.

---

## System Architecture

```
┌────────────────────┐         ┌────────────────────────────┐
│   React Frontend   │  HTTP   │     Django REST Backend     │
│   (Vite + TS)      │◄───────►│     (DRF + SimpleJWT)      │
│   Port 5173        │  JSON   │     Port 8000               │
└────────────────────┘         └──────┬──────┬──────┬────────┘
                                      │      │      │
                               ┌──────▼──┐ ┌─▼────┐ │
                               │PostgreSQL│ │Cache │ │
                               │ (DB)     │ │(File)│ │
                               └─────────┘ └──────┘ │
                                                     │
                          ┌──────────────────────────┼──────────────┐
                          │                          │              │
                   ┌──────▼──────┐          ┌───────▼────┐  ┌─────▼──────┐
                   │ Google      │          │ Google     │  │ SMTP Email │
                   │ Gemini API  │          │ Calendar   │  │ Service    │
                   │ (AI)        │          │ OAuth 2.0  │  │            │
                   └─────────────┘          └────────────┘  └────────────┘
```

### Architecture Overview

The application follows a **client-server architecture** with a clear separation between the React SPA frontend and the Django REST API backend. All communication happens over HTTP using JSON payloads with JWT-based authentication.

- **Frontend (React SPA)**: Single-page application handling routing, state management, and UI rendering. Communicates with the backend via Axios with automatic token refresh.
- **Backend (Django REST Framework)**: Stateless API server providing CRUD operations, authentication, AI integration, and calendar scheduling. Uses file-based caching for email verification codes.
- **Database (PostgreSQL)**: Stores users, profiles, job applications, and calendar tokens.
- **External Services**: Google Gemini API for AI features, Google Calendar API for interview scheduling, SMTP for email verification.

---

## Features

- **Email Authentication**: Secure email-based registration with 6-digit verification codes, JWT access/refresh tokens.
- **Job Tracking**: Full CRUD for job applications with status pipeline (Wishlist → Applied → Interviewing → Offer / Rejected).
- **Kanban Board**: Interactive drag-and-drop board for visualizing application stages.
- **Job URL Scraping**: Paste a job listing URL to auto-extract company, position, location, and description.
- **AI Match Scoring**: Upload your CV and let Gemini AI score (0–100) how well you match a job, with strengths and gaps analysis.
- **AI Cover Letter Generator**: Generate tailored cover letters in formal or friendly tone using Gemini 2.5 Pro.
- **Google Calendar Integration**: Schedule interviews with per-user OAuth consent and create Google Calendar events.
- **Analytics Dashboard**: Visualize application velocity, status distribution, and pipeline health with interactive charts.
- **Email Verification**: Professional HTML verification emails with cooldown timer for resend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, `@hello-pangea/dnd` |
| **Backend** | Django 6, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL |
| **AI** | Google Gemini API (`gemini-2.5-flash` for scoring, `gemini-2.5-pro` for cover letters) |
| **Calendar** | Google Calendar API (OAuth 2.0 per-user consent) |
| **Email** | SMTP (Gmail) with HTML templates, console fallback for development |
| **Containerization** | Docker Compose (PostgreSQL) |
| **Version Control** | Git / GitHub |

---

## Data Model

```
┌──────────────────────┐       ┌──────────────────────────────┐
│        User          │       │       JobApplication          │
├──────────────────────┤       ├──────────────────────────────┤
│ id (PK)              │       │ id (PK)                      │
│ email (unique)       │1    * │ user_id (FK → User)          │
│ first_name           │───────│ company                      │
│ last_name            │       │ position                     │
│ password (hashed)    │       │ url                          │
│ is_verified          │       │ location                     │
│ is_active            │       │ status (enum)                │
│ is_staff             │       │ description                  │
│ date_joined          │       │ notes                        │
└──────────┬───────────┘       │ deadline                     │
           │ 1:1                │ date_applied                 │
┌──────────▼───────────┐       │ match_score                  │
│     UserProfile      │       │ calendar_event_id            │
├──────────────────────┤       │ interview_datetime           │
│ id (PK)              │       │ created_at                   │
│ user_id (FK → User)  │       │ updated_at                   │
│ cv_pdf (file)        │       └──────────────────────────────┘
│ google_access_token  │
│ google_refresh_token │       Status Enum:
│ updated_at           │       wishlist | applied | interviewing
└──────────────────────┘       offer | rejected
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register a new user |
| POST | `/api/auth/login/` | Login and receive JWT tokens |
| POST | `/api/auth/verify-email/` | Verify email with 6-digit code |
| POST | `/api/auth/resend-code/` | Resend verification code |
| POST | `/api/auth/token/refresh/` | Refresh JWT access token |
| GET | `/api/auth/profile/` | Get user profile |
| PATCH | `/api/auth/profile/` | Update profile / upload CV |
| GET | `/api/jobs/` | List user's job applications |
| POST | `/api/jobs/` | Create a job application |
| GET/PUT/DELETE | `/api/jobs/<id>/` | Retrieve / update / delete a job |
| POST | `/api/jobs/scrape/` | Scrape job details from URL |
| POST | `/api/ai/match-score/` | AI match score analysis |
| POST | `/api/ai/cover-letter/` | AI cover letter generation |
| GET | `/api/calendar/auth-url/` | Get Google Calendar OAuth URL |
| GET | `/api/calendar/callback/` | OAuth callback handler |
| POST | `/api/calendar/schedule/` | Schedule interview on Google Calendar |
| DELETE | `/api/calendar/remove/<id>/` | Remove a scheduled interview |
| GET | `/api/analytics/dashboard/` | Dashboard analytics data |

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** — running locally or via `docker-compose up -d`
- **Gemini API Key** — free at [Google AI Studio](https://aistudio.google.com/apikey)
- *(Optional)* Google Calendar OAuth credentials for interview scheduling
- *(Optional)* SMTP credentials (Gmail) for email verification

---

## Setup Instructions

### 1. Database Setup

If you don't have PostgreSQL installed locally, use the provided Docker Compose:

```bash
docker-compose up -d
```

Or create the database manually:

```sql
CREATE DATABASE jobtrack;
CREATE USER jobtrack WITH PASSWORD 'jobtrack';
ALTER ROLE jobtrack SET client_encoding TO 'utf8';
ALTER ROLE jobtrack SET default_transaction_isolation TO 'read committed';
ALTER ROLE jobtrack SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE jobtrack TO jobtrack;
ALTER DATABASE jobtrack OWNER TO jobtrack;
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configure environment variables:
```bash
cp ../.env.example .env
# Edit .env — at minimum set GEMINI_API_KEY
```

Run migrations and start the server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the application at **http://localhost:5173**.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Django secret key |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Yes | PostgreSQL credentials |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `GOOGLE_CALENDAR_CLIENT_ID` | Optional | Google Calendar OAuth client ID |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Optional | Google Calendar OAuth client secret |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | Optional | SMTP credentials for email verification |

---

## Running Tests

```bash
cd backend
source venv/bin/activate
python manage.py test
```

---

## Project Structure

```text
JobTrack/
├── .env.example              # Environment variable template
├── docker-compose.yml        # PostgreSQL container config
├── README.md                 # This file
│
├── backend/
│   ├── accounts/             # User auth, email verification, profiles
│   ├── jobs/                 # Job CRUD, URL scraping, analytics
│   ├── ai_services/          # Gemini AI match scoring & cover letters
│   ├── calendar_integration/ # Google Calendar OAuth & scheduling
│   ├── config/               # Django settings, URL routing
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI (Navbar, JobCard, Modals)
    │   ├── context/          # Auth context with JWT token management
    │   ├── pages/            # Page views (Dashboard, Kanban, Landing)
    │   ├── services/         # Axios API client with interceptors
    │   └── types/            # TypeScript interfaces
    ├── index.html
    ├── vite.config.ts
    └── package.json
```
