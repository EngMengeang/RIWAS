# RIWAS — Recruitment Information & Workflow Automation System

RIWAS is a full‑stack recruitment platform that helps HR teams manage job postings, candidate applications, interviews, and evaluation workflows—plus an AI service for job recommendations and a PDF extraction microservice for resumes/cover letters.

This repository contains **three main parts**:

- **Frontend**: React (Vite) web app for HR and Candidate flows
- **Backend**: Node.js + Express REST API with Sequelize + PostgreSQL
- **AI Services**
  - **FastAPI** service for AI-based job recommendations (Sentence-BERT / BERT approach)
  - **Flask** service for extracting text from uploaded PDF resumes/cover letters

---

## Features (high level)

### HR / Recruiter
- Authentication
- Profile management
- Job posting management
- Application tracking & management
- Interview scheduling/management
- Recruitment workflow configuration
- Scoring matrix / templates / attributes
- Dashboard endpoints (analytics/summary)

### Candidate
- Landing & profile
- Upload CV / manage CV
- Browse jobs + job details
- Apply to jobs
- Track application progress
- Notifications

### AI / Automation
- **Resume PDF text extraction** API (Flask + PyMuPDF)
- **Job recommendations** API (FastAPI + SQLAlchemy + ML recommender)

---

## Repository structure

```text
RIWAS/
  Backend/                 # Express API + Sequelize + Postgres
    server.js
    routes/
    models/
    migrations/
    seeders/
    config/
    python_service/        # Flask PDF extraction microservice
  Frontend/                # React (Vite) client
    src/
  FastAPI/                 # AI recommendation service
    main.py
    models.py
    schemas.py
```

---

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL
- Python 3.9+ (recommended) for the AI services
- (Optional) `gunicorn` for running the Flask service in production

---

## Backend (Node.js + Express + Sequelize)

### 1) Install dependencies
```bash
cd Backend
npm install
```

### 2) Create PostgreSQL databases
Use Postgres SQL:

```sql
-- Development 
CREATE DATABASE riwas_db; 

-- Test
CREATE DATABASE riwas_test;

-- Production
CREATE DATABASE riwas_prod;
```

### 3) Run migrations
Development:
```bash
npx sequelize-cli db:migrate --env development
```

Production:
```bash
npx sequelize-cli db:migrate --env production
```

### 4) Seed sample data (optional)
```bash
npx sequelize-cli db:seed:all --env development
```

### 5) Start the server
```bash
npm run dev
```

### Health check
After starting, verify:
- `GET /health` → returns `{ status: "OK", ... }`

### Main API route groups
The Express server mounts routes under:

- `/api/auth`
- `/api/users`
- `/api/profiles`
- `/api/jobpostings`
- `/api/jobapplications`
- `/api/interviews`
- `/api/workflows`
- `/api/status-history`
- `/api/categories`
- `/api/skills`
- `/api/user-skills`
- `/api/matrix-scores`
- `/api/attributes`
- `/api/templates`
- `/api/dashboard`
- `/api/resumes`

---

## Frontend (React)

### Install + run
```bash
cd Frontend
npm install
npm run dev
```

The UI includes routes for both HR pages (dashboard, postings, workflows, matrix, etc.) and candidate pages (landing, upload CV, view jobs, apply, notifications).

---

## FastAPI (AI Job Recommendation Service)

This service exposes endpoints for:
- creating and reading job requirements (`requ`)
- creating user profiles (`user_profile`)
- generating **AI recommendations** for a user against all stored jobs

### Key endpoint
- `GET /user_profile/{user_id}/recommendations?top_n=10`

The response includes:
- `user_id`
- the profile text used for matching
- number of jobs analyzed
- ranked recommendations with similarity scores (based on the recommender implementation)

### Run (typical)
Depending on your environment, you can run with something like:
```bash
cd FastAPI
uvicorn main:app --reload
```

> Note: your repo may include additional config for DB connection in `FastAPI/database.py` and the model logic in `FastAPI/ml_engine.py`.

---

## Flask PDF Extraction Service (Backend/python_service)

This microservice extracts text from PDFs (resumes, cover letters, etc.) using **PyMuPDF (fitz)**.

### Run in development
```bash
cd Backend/python_service
python extract_service.py
```

### Run in production
Option 1:
```bash
./run_production.sh
```

Option 2:
```bash
gunicorn -w 4 -b 127.0.0.1:5001 --timeout 120 extract_service:app
```

### API endpoint
- `POST /extract`
  - Accepts `multipart/form-data` with PDF files
  - Returns JSON with extracted text for each uploaded file
  - Common keys: `resume`, `coverLetter`, or custom field names

---

## Environment variables

You will typically need:
- Backend: database connection settings, `PORT`, `NODE_ENV`, and `CLIENT_URL` (CORS)
- FastAPI: database connection settings (see `FastAPI/database.py`)
- Flask PDF service: (if any) service port/bind configuration

If you want, I can generate ready-to-copy `.env.example` files for:
- `Backend/.env.example`
- `FastAPI/.env.example`
- `Backend/python_service/.env.example`

---

## Development notes

- Start Postgres first
- Run migrations (and seeders if needed)
- Start Backend API
- Start Frontend UI
- Start AI services (FastAPI / Flask) as needed depending on which features you’re working on

---

## License
Add your license here (MIT/Apache-2.0/etc).

---

## Credits / Research
The FastAPI service description references a BERT-based approach following “Panchasara et al. (2023)”.
