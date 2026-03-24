# JobTrack AI

JobTrack AI is a full-stack, AI-powered job application tracking system designed for university students and recent graduates. It helps you manage your job search pipeline, schedule interviews, and uses Google Vertex AI to automatically score your resume against job descriptions and generate tailored cover letters.

## Features

- **Authentication**: Secure email-based JWT authentication.
- **Kanban Board**: Interactive drag-and-drop board for tracking application stages.
- **AI Match Scoring**: Compare your resume against job requirements using Gemini 1.5.
- **AI Cover Letter Architect**: Generate professional or friendly cover letters tailored to each role.
- **Calendar Integration**: Instantly schedule interviews and add them to Google Calendar.
- **Analytics Dashboard**: Visualize your application velocity and pipeline health.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, `hello-pangea/dnd`
- **Backend**: Django, Django REST Framework, PostgreSQL, SimpleJWT
- **AI Services**: Google Cloud Vertex AI (Gemini 1.5 Flash)
- **APIs**: Google Calendar API

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL**: Running locally or via the provided `docker-compose.yml`
- **Google Cloud Platform (GCP) Project** with:
  - Vertex AI API enabled (for AI features)
  - Google Calendar API enabled, with OAuth 2.0 Credentials configured (Web application type)

---

## Setup Instructions

### 1. Database Setup (Optional if you have Local Postgres)

If you don't have PostgreSQL installed locally, you can use the provided Docker Compose file:

```bash
docker-compose up -d
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Copy the `.env.example` from the root directory to `backend/.env`.
   - Update the database credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`). Default is `jobtrack` user and password on port `5432`.
   - Add your Google Cloud GCP Region, Project ID, and OAuth keys.
5. Create logic required for database permissions if starting fresh:
   ```sql
   CREATE DATABASE jobtrack;
   CREATE USER jobtrack WITH PASSWORD 'jobtrack';
   ALTER ROLE jobtrack SET client_encoding TO 'utf8';
   ALTER ROLE jobtrack SET default_transaction_isolation TO 'read committed';
   ALTER ROLE jobtrack SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE jobtrack TO jobtrack;
   -- Important for Django migrations on Postgres 15+
   ALTER DATABASE jobtrack OWNER TO jobtrack;
   ```
6. Run migrations:
   ```bash
   python manage.py migrate
   ```
7. Seed the database with sample data (creates a demo account `demo@jobtrack.ai` / `demo1234`):
   ```bash
   python manage.py seed_jobs
   ```
8. Start the development server:
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
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
4. Access the application at `http://localhost:5173`.

---

## Using the AI Features

To use the Match Score and Cover Letter features, you must:
1. Set up a GCP project and enable the Vertex AI API.
2. Provide `GCP_PROJECT_ID` and `GCP_REGION` in your backend `.env` file.
3. Authenticate your local environment using the gcloud CLI:
   ```bash
   gcloud auth application-default login
   ```

## Using the Calendar Integration

To use the Google Calendar scheduling feature:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Calendar API**.
3. Create **OAuth 2.0 Client IDs** (Application type: Desktop App or Web application if configuring redirect URIs).
4. Download the credentials JSON.
5. Provide the absolute path to this file in your backend `.env` under `GOOGLE_OAUTH_CREDENTIALS_FILE`.

---

## Project Structure

```text
JobTrack/
├── .env.example
├── docker-compose.yml
├──/backend/
│  ├── /accounts/             # Custom JWT User Auth
│  ├── /ai_services/          # Vertex AI Endpoints
│  ├── /calendar_integration/ # Calendar Endpoints
│  ├── /config/               # Django Settings
│  └── /jobs/                 # Jobs CRUD & Analytics
│
└──/frontend/
   ├── /src/
   │   ├── /components/       # Reusable UI (JobCard, Modals)
   │   ├── /context/          # Auth Context Layer
   │   ├── /pages/            # Next-level views (Dashboard, Kanban)
   │   ├── /services/         # Axios Interceptors & API definitions
   │   └── /types/            # TS Interfaces
   └── vite.config.ts
```
