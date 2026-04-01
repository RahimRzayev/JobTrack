# JobTrack AI — Full-Stack Build Prompt

> **Use this prompt with an AI coding agent (Copilot, Cursor, etc.) to scaffold and build the entire project.**

---

## Role & Context

You are a senior full-stack developer building **JobTrack AI** — a web application that helps university students and recent graduates track internship/job applications and leverage AI to improve their search.

**Tech stack (non-negotiable):**

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Django + Django REST Framework |
| Database | PostgreSQL |
| AI Engine | Google Cloud Vertex AI (Gemini 1.5) |
| Auth | Django session auth (or JWT via `djangorestframework-simplejwt`) |
| Styling | Tailwind CSS (or Material UI — pick one and stay consistent) |
| Version Control | Git / GitHub |

---

## What to Build

### 1. Project Bootstrapping
- Initialize a **monorepo** with two top-level directories: `frontend/` (React + Vite) and `backend/` (Django).
- Set up PostgreSQL as the default database in Django settings.
- Configure CORS so the React dev server can talk to the Django API.
- Create a `.env.example` with all required environment variables (DB creds, Google Cloud project ID, API keys).

### 2. Authentication
- Implement **user registration and login** (email + password).
- Protect all API endpoints behind authentication.
- Provide `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/me/` endpoints.

### 3. Job Application CRUD
- **Model `JobApplication`** with fields: `id`, `user` (FK), `company`, `position`, `url`, `location`, `status` (enum: Wishlist / Applied / Interviewing / Offer / Rejected), `notes`, `deadline`, `date_applied`, `created_at`, `updated_at`.
- RESTful API: `GET /api/jobs/`, `POST /api/jobs/`, `PATCH /api/jobs/:id/`, `DELETE /api/jobs/:id/`.
- Filter by status, search by company/position.

### 4. Intelligent Kanban Board (Frontend)
- Render a **drag-and-drop Kanban board** with five columns: *Wishlist → Applied → Interviewing → Offer → Rejected*.
- Each card shows company name, position, deadline, and AI match score (if available).
- Dragging a card to a new column sends a `PATCH` to update the status.
- Use a library like `@hello-pangea/dnd` (or `react-beautiful-dnd` fork).

### 5. AI Match Scoring
- **Endpoint `POST /api/ai/match-score/`** — accepts `resume_text` and `job_description`, calls Google Vertex AI (Gemini 1.5), and returns a JSON object: `{ "score": 0-100, "strengths": [...], "gaps": [...] }`.
- On the frontend, show a button on each job card: "Check Match". Clicking it opens a modal where the user pastes (or selects their saved) CV and triggers the scoring.
- Display the score as a colored badge on the card (green ≥ 70, yellow 40-69, red < 40).

### 6. AI Cover Letter Architect
- **Endpoint `POST /api/ai/cover-letter/`** — accepts `resume_text`, `job_description`, and optional `tone` (formal / friendly), returns a generated cover letter.
- Frontend: a "Generate Cover Letter" button on each job card opens a panel with the generated text, copy-to-clipboard, and a "Regenerate" option.

### 7. Google Calendar Automation
- When a job's status changes to **"Interviewing"**, prompt the user to schedule an interview date/time.
- Use the **Google Calendar API** (OAuth 2.0) to create an event with a reminder.
- Store the `calendar_event_id` on the `JobApplication` model so it can be updated or deleted.

### 8. Dashboard & Analytics
- A simple dashboard page showing:
  - Total applications by status (bar or pie chart).
  - Applications over time (line chart).
  - Average AI match score.
- Use a charting library such as `recharts` or `chart.js`.

---

## Code Quality Requirements
- **Backend:** Use Django serializers for validation. Write model-level unit tests for every endpoint. Use `python-decouple` or `django-environ` for environment variables.
- **Frontend:** Use functional components + hooks. Keep API calls in a dedicated `services/api.js` module using `axios`. Handle loading and error states on every async action.
- **General:** Follow PEP 8 (Python) and ESLint defaults (JS/React). Keep components small and focused — one file per component.

---

## File Structure (Expected)

```
JobTrack/
├── backend/
│   ├── manage.py
│   ├── config/              # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/            # User auth app
│   ├── jobs/                # Job application CRUD app
│   ├── ai_services/         # AI match score & cover letter app
│   ├── calendar_integration/ # Google Calendar app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── services/        # API service modules
│   │   ├── context/         # React context providers
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── docker-compose.yml       # Optional: for local PostgreSQL
└── README.md
```

---

## Constraints & Guidelines
1. **Do NOT use SQLite** — always configure PostgreSQL.
2. **Always seed at least 5 sample job applications** via a Django management command (`python manage.py seed_jobs`).
3. Handle Vertex AI API errors gracefully — return user-friendly messages, never raw tracebacks.
4. Use **environment variables** for all secrets and API keys — never hardcode them.
5. Make the UI **responsive** — it must look good on both desktop and mobile.
6. Refer to `TASKS.md` in the project root for the step-by-step implementation order.
