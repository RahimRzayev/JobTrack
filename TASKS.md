# JobTrack AI — Implementation Tasks

> Follow these tasks **in order**. Each phase builds on the previous one. Do not skip ahead.

---

## Phase 1: Project Setup & Configuration

- [ ] Create monorepo structure with `backend/` and `frontend/` directories
- [ ] **Backend:** Initialize Django project (`config/` as project dir)
  - [ ] Install dependencies: `django`, `djangorestframework`, `django-cors-headers`, `psycopg2-binary`, `python-decouple`
  - [ ] Configure PostgreSQL in `settings.py` using env variables
  - [ ] Configure CORS to allow React dev server (`localhost:5173`)
  - [ ] Add DRF to `INSTALLED_APPS` with default authentication classes
- [ ] **Frontend:** Initialize React app with Vite
  - [ ] Install base dependencies: `axios`, `react-router-dom`
  - [ ] Set up folder structure: `components/`, `pages/`, `services/`, `context/`
  - [ ] Create `services/api.js` with Axios instance (base URL from env)
- [ ] Create `.env.example` with all required variables
- [ ] Create `docker-compose.yml` for local PostgreSQL (optional but recommended)
- [ ] Verify both servers start and frontend can reach backend health-check endpoint

---

## Phase 2: User Authentication

- [ ] **Backend:** Create `accounts` Django app
  - [ ] Custom user model (email-based login)
  - [ ] Serializers for registration, login, user profile
  - [ ] Views: `RegisterView`, `LoginView`, `LogoutView`, `MeView`
  - [ ] Wire URLs under `/api/auth/`
  - [ ] Write unit tests for all auth endpoints
- [ ] **Frontend:** Build auth UI
  - [ ] Create `AuthContext` with login state, token storage
  - [ ] Build `LoginPage` and `RegisterPage` components
  - [ ] Add protected route wrapper (redirect to login if not authenticated)
  - [ ] Add logout button to navbar
  - [ ] Test full registration → login → protected page flow

---

## Phase 3: Job Application CRUD

- [ ] **Backend:** Create `jobs` Django app
  - [ ] Define `JobApplication` model with all fields (company, position, url, location, status enum, notes, deadline, date_applied, timestamps)
  - [ ] Create serializer with validation (e.g., deadline must be in the future for new apps)
  - [ ] Create ViewSet with list, create, update, partial_update, destroy
  - [ ] Add filtering by `status` and search by `company`/`position`
  - [ ] Scope all queries to the authenticated user
  - [ ] Write unit tests for CRUD operations
- [ ] **Frontend:** Build job management UI
  - [ ] Create `AddJobModal` form component
  - [ ] Create `JobCard` component (displays company, position, deadline, status badge)
  - [ ] Create `JobListPage` with status filter tabs and search bar
  - [ ] Wire up create, edit, and delete actions to the API
  - [ ] Add loading spinners and error toasts

---

## Phase 4: Intelligent Kanban Board

- [ ] **Frontend:** Install drag-and-drop library (`@hello-pangea/dnd`)
- [ ] Build `KanbanBoard` component
  - [ ] Render five columns: Wishlist, Applied, Interviewing, Offer, Rejected
  - [ ] Populate columns by filtering jobs from API response
  - [ ] Implement drag-and-drop between columns
  - [ ] On drop, send `PATCH /api/jobs/:id/` with new status
  - [ ] Optimistically update UI, roll back on API error
- [ ] Add visual polish: column headers with count badges, empty-state messages
- [ ] Make the board horizontally scrollable on mobile

---

## Phase 5: AI Match Scoring

- [ ] **Backend:** Create `ai_services` Django app
  - [ ] Set up Google Vertex AI client (Gemini 1.5) using service account credentials from env
  - [ ] Create `POST /api/ai/match-score/` endpoint
    - [ ] Accept `resume_text` and `job_description`
    - [ ] Build prompt instructing the model to return JSON: `{ score, strengths, gaps }`
    - [ ] Parse model response, validate structure, return to client
    - [ ] Handle API errors gracefully (rate limits, auth failures, malformed responses)
  - [ ] Write tests with mocked Vertex AI responses
- [ ] **Backend:** Add `match_score` field to `JobApplication` model, add migration
- [ ] **Frontend:** Build match scoring UI
  - [ ] Add "Check Match" button on each `JobCard`
  - [ ] Build `MatchScoreModal`: textarea for CV, displays score + strengths/gaps
  - [ ] Show score badge on card (green ≥ 70, yellow 40-69, red < 40)
  - [ ] Handle loading and error states in the modal

---

## Phase 6: AI Cover Letter Architect

- [ ] **Backend:** Add `POST /api/ai/cover-letter/` endpoint in `ai_services`
  - [ ] Accept `resume_text`, `job_description`, optional `tone`
  - [ ] Build prompt for personalized cover letter generation
  - [ ] Return generated text
  - [ ] Write tests with mocked AI responses
- [ ] **Frontend:** Build cover letter UI
  - [ ] Add "Generate Cover Letter" button on each `JobCard`
  - [ ] Build `CoverLetterPanel`: shows generated letter, tone selector, regenerate button
  - [ ] Add copy-to-clipboard functionality
  - [ ] Handle loading and error states

---

## Phase 7: Google Calendar Integration

- [ ] **Backend:** Create `calendar_integration` Django app
  - [ ] Set up Google OAuth 2.0 flow for Calendar API access
  - [ ] Store user OAuth tokens securely
  - [ ] Create endpoint `POST /api/calendar/schedule/` — accepts job ID, interview datetime
  - [ ] Create a Google Calendar event with a 30-minute reminder
  - [ ] Save `calendar_event_id` on the `JobApplication` model
  - [ ] Support updating/deleting the calendar event
  - [ ] Write tests with mocked Calendar API
- [ ] **Frontend:** Build calendar scheduling UI
  - [ ] When a card moves to "Interviewing", show a date/time picker modal
  - [ ] Send schedule request to backend
  - [ ] Show confirmation with link to Google Calendar event
  - [ ] Display scheduled interview time on the job card

---

## Phase 8: Dashboard & Analytics

- [ ] **Backend:** Create analytics endpoint `GET /api/analytics/dashboard/`
  - [ ] Return: count per status, applications per week/month, average match score
- [ ] **Frontend:** Install charting library (`recharts` or `chart.js`)
- [ ] Build `DashboardPage`
  - [ ] Pie/bar chart: applications by status
  - [ ] Line chart: applications over time
  - [ ] Stat card: average AI match score
  - [ ] Make charts responsive

---

## Phase 9: Polish & Deployment Prep

- [ ] Add a global navbar with links: Dashboard, Kanban Board, Job List
- [ ] Implement responsive design breakpoints (mobile, tablet, desktop)
- [ ] Add a `seed_jobs` Django management command that creates 5 sample applications
- [ ] Write a `README.md` with setup instructions, env variables, and screenshots
- [ ] Run full test suite and fix any failures
- [ ] (Optional) Add `Dockerfile` for backend and `docker-compose.yml` for full stack
- [ ] Final manual QA: register → add jobs → drag on Kanban → run AI scoring → generate cover letter → schedule interview → view dashboard
