# Agile Mentorship Portal

A full-stack mentorship platform with three separate portals — Admin, Mentor, and Mentee — built for managing agile mentorship programs, live and recorded sessions, enrollments, attendance, and certificates.

**Live URL:** https://agile-version1.vercel.app

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Steps to Run Locally](#steps-to-run-locally)
7. [Steps to Create the Database](#steps-to-create-the-database)
8. [Environment Variables](#environment-variables)
9. [Deployment Guide](#deployment-guide)
10. [API Overview](#api-overview)
11. [Known Limitations](#known-limitations)

---

## Features

### Admin Portal
- Create and manage mentorship programs and sessions
- Assign mentors to programs
- Approve / reject mentee enrollment requests
- View and manage all users
- Upload global resources
- View platform-wide analytics and export CSV reports
- Send platform announcements

### Mentor Portal
- View assigned programs and sessions
- Create and manage own sessions (live or recorded)
- Mark mentee attendance for live sessions
- Upload session resources and personal certificates
- View per-program mentee progress analytics
- Edit profile (bio, expertise, LinkedIn, photo)

### Mentee Portal
- Browse available programs and request enrollment
- Watch recorded sessions with video progress tracking (95% completion rule)
- Join live sessions via meeting link
- View own attendance records
- Earn certificate eligibility on program completion
- Receive in-app and email notifications

### General
- Cookie-based JWT authentication (httpOnly, secure in production)
- Email OTP verification on signup
- Forgot password / reset password flow
- Real-time notification bell with mark-as-read
- Cover image uploads for programs and sessions (Cloudinary)
- Rate limiting on auth endpoints (brute-force protection)
- Mobile responsive UI

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18 |
| **Frontend Build** | Vite | 5 |
| **Frontend Routing** | React Router | 6 |
| **Frontend Styling** | Inline styles (no CSS framework) | — |
| **HTTP Client** | Axios | — |
| **Backend** | Python + FastAPI | 3.14 / 0.136 |
| **ORM** | SQLAlchemy | 2.0 |
| **Database** | PostgreSQL (NeonDB hosted) | — |
| **Auth** | JWT (python-jose) + bcrypt (passlib) | — |
| **Rate Limiting** | slowapi | 0.1.10 |
| **File Storage** | Cloudinary | — |
| **Email** | Gmail SMTP (smtplib) | — |
| **Task Scheduler** | APScheduler | 3.10 |
| **Frontend Hosting** | Vercel | — |
| **Backend Hosting** | Render | — |

---

## Architecture

```
Users (Browser / Phone)
        │
        ▼ HTTPS
┌───────────────────────────────────┐
│  FRONTEND — Vercel                │
│  React + Vite + React Router      │
│  https://agile-version1.vercel.app│
│  Admin | Mentor | Mentee Portals  │
└───────────────┬───────────────────┘
                │ REST API + Cookie Auth
                ▼
┌───────────────────────────────────┐
│  BACKEND — Render                 │
│  Python FastAPI + SQLAlchemy      │
│  https://agile-mentorship-        │
│  backend.onrender.com             │
└───────┬───────────┬───────────────┘
        │           │           │
        ▼           ▼           ▼
  PostgreSQL    Cloudinary    Gmail SMTP
  (NeonDB)     File Storage   Emails
```

---

## Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full file tree with descriptions.

---

## Prerequisites

Make sure you have these installed:

- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**
- A **PostgreSQL** database (local or hosted — NeonDB recommended)
- A **Cloudinary** account (free tier)
- A **Gmail** account with App Password enabled

---

## Steps to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/CodeWizardAn/agile-version1.git
cd agile-version1
```

### 2. Set up the Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Create the backend `.env` file

Create a file called `.env` inside the `backend/` folder:

```env
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
SECRET_KEY=your_random_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

> To generate a secure SECRET_KEY, run:
> ```python
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### 4. Create the database tables

```bash
# Make sure you are inside backend/ with venv activated
python create_tables.py
```

### 5. Seed the admin user

Open a Python shell and run:

```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("YourAdminPassword"))
```

Then run this SQL in your database:

```sql
INSERT INTO "User" (user_id, full_name, email, password_hash, role, status)
VALUES ('26001', 'Admin', 'admin@yourdomain.com', '<PASTE_BCRYPT_HASH_HERE>', 'admin', 'active');
```

### 6. Start the Backend server

```bash
# Inside backend/ with venv activated
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 7. Set up the Frontend

```bash
# Open a new terminal
cd frontend
npm install
```

### 8. Create the frontend `.env.local` file

Create a file called `.env.local` inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:8000
```

### 9. Start the Frontend

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Steps to Create the Database

Full SQL schema is in [backend/DB.md](backend/DB.md). Quick summary:

### Option A — Run create_tables.py (recommended)

```bash
cd backend
# Activate venv first
python create_tables.py
```

This uses SQLAlchemy to auto-create all tables from the model definitions.

### Option B — Run SQL manually

Copy the SQL from `backend/DB.md` and run it in order in your PostgreSQL client (NeonDB SQL editor, pgAdmin, or psql).

**Table creation order (due to foreign keys):**

1. `User`
2. `Mentor`
3. `MentorInvite`
4. `MentorCertificate`
5. `Programs`
6. `Session`
7. `Enrollment`
8. `Attendence`
9. `VideoProgress`
10. `SessionCompletion`
11. `feedback`
12. `announcements`
13. `notifications`
14. `Certificate`
15. `PasswordResetToken`
16. `Resource`
17. `EmailOTP`

Then insert the admin seed user (see [backend/DB.md](backend/DB.md)).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SECRET_KEY` | JWT signing key — must be random and secret | 64-char hex string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123...` |
| `GMAIL_USER` | Gmail address used to send emails | `app@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your login password) | `xxxx xxxx xxxx xxxx` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `ENVIRONMENT` | `development` or `production` | `development` |

> For Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## Deployment Guide

### Backend — Deploy to Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

4. Add all environment variables from the table above
5. Set `ENVIRONMENT=production`
6. Set `FRONTEND_URL` to your Vercel URL
7. Click Deploy

### Frontend — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
5. Click Deploy

### Redeploy after code changes

- **Backend:** Render → Manual Deploy → Deploy latest commit
- **Frontend:** Vercel auto-deploys on every push to `main`

### Production checklist

- [ ] `ENVIRONMENT=production` set on Render
- [ ] `FRONTEND_URL` set to Vercel URL on Render
- [ ] `SECRET_KEY` is a real random value (not a placeholder)
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] NeonDB automated backups enabled

---

## API Overview

Base URL: `https://agile-mentorship-backend.onrender.com`

Interactive docs: `https://agile-mentorship-backend.onrender.com/docs`

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/auth/` | Login, signup, OTP verify, forgot/reset password |
| Admin | `/api/admin/` | Programs, sessions, users, enrollments, attendance |
| Mentor | `/api/mentor/` | Sessions, profile, resources, certificates, attendance |
| Mentee | `/api/mentee/` | Programs, enrollments, sessions, attendance |
| Notifications | `/api/notifications/` | Fetch, mark read |
| Video | `/api/video/` | Progress tracking for recorded sessions |
| Upload | `/api/upload-cover` | Cover image upload (Cloudinary) |

---

## Known Limitations

| Limitation | Impact | Suggested Fix |
|-----------|--------|---------------|
| Render free tier sleeps after 15 min inactivity | ~30 sec cold start delay | Upgrade to paid plan or move to VPS |
| Gmail SMTP limited to ~500 emails/day | Not suitable for large user base | Switch to SendGrid or Mailgun |
| No automated DB backups configured | Risk of data loss | Enable NeonDB automated backups |
| `main.py` is a single 2100+ line file | Hard to maintain at scale | Split into FastAPI routers |
| In-memory rate limiting (slowapi) | Resets on server restart | Use Redis-backed rate limiting |
| No automated test suite | Regressions caught manually only | Add pytest for backend, Vitest for frontend |
