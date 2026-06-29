# Agile Mentorship Portal — Project Structure

```
agile-mentorship-portal/
│
├── README.md                          # Full project documentation
├── PROJECT_STRUCTURE.md               # This file
├── requirements.txt                   # Root-level pip requirements (legacy)
│
├── backend/                           # Python FastAPI backend
│   ├── main.py                        # ALL API routes, business logic, app entry point
│   ├── database.py                    # SQLAlchemy DB engine + session factory
│   ├── security.py                    # JWT creation, decoding, password hashing
│   ├── email_service.py               # Gmail SMTP email templates and sender
│   ├── cloudinary_config.py           # Cloudinary upload helper
│   ├── create_tables.py               # Script to create all DB tables from models
│   ├── requirements.txt               # Python dependencies
│   ├── DB.md                          # Full database schema documentation
│   ├── .env                           # Environment variables (NEVER commit this)
│   │
│   ├── models/                        # SQLAlchemy ORM models (one file per table)
│   │   ├── user.py                    # User table — all roles (admin/mentor/mentee)
│   │   ├── mentor.py                  # Mentor profile table
│   │   ├── mentor_invite.py           # Invite codes for mentor signup
│   │   ├── mentor_certificate.py      # Mentor uploaded certificates
│   │   ├── program.py                 # Mentorship programs
│   │   ├── session.py                 # Sessions under a program (live or recorded)
│   │   ├── enrollment.py              # Mentee enrollment in programs
│   │   ├── attendance.py              # Attendance records per session per mentee
│   │   ├── video_progress.py          # Watched segments tracker for recorded videos
│   │   ├── session_completion.py      # Marks when mentee completes a session (≥95%)
│   │   ├── feedback.py                # Mentee ratings and comments for sessions
│   │   ├── notification.py            # In-app notifications per user
│   │   ├── announcement.py            # Platform-wide admin announcements
│   │   ├── resource.py                # Uploaded files (PDF/video/doc/image)
│   │   ├── email_otp.py               # One-time passwords for email verification
│   │   └── password_reset_token.py    # Tokens for forgot-password flow
│   │
│   └── test_db.py                     # Quick DB connection test script
│   └── test_cloudinary.py             # Quick Cloudinary upload test script
│
├── frontend/                          # React + Vite frontend
│   ├── index.html                     # HTML entry point
│   ├── vite.config.js                 # Vite build configuration
│   ├── package.json                   # Node dependencies and scripts
│   ├── vercel.json                    # Vercel rewrite rules (SPA routing fix)
│   ├── eslint.config.js               # ESLint configuration
│   ├── .env.local                     # Frontend env vars (VITE_API_URL)
│   │
│   ├── public/                        # Static assets served as-is
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   └── src/
│       ├── main.jsx                   # React app entry point
│       ├── App.jsx                    # Root component + all React Router routes
│       ├── App.css                    # Global CSS resets
│       ├── index.css                  # Base styles
│       │
│       ├── api/
│       │   └── client.js              # Axios instance (baseURL + withCredentials)
│       │
│       ├── context/
│       │   └── AuthContext.jsx        # Global auth state (user, role, loading)
│       │
│       ├── assets/                    # Images and static files used in code
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       │
│       ├── components/
│       │   ├── NotificationBell.jsx   # Bell icon + dropdown for all portals
│       │   ├── PrivateRoute.jsx       # Route guard — redirects to login if not authed
│       │   └── layouts/
│       │       ├── AdminLayout.jsx    # Sidebar + topbar wrapper for admin pages
│       │       ├── MentorLayout.jsx   # Sidebar + topbar wrapper for mentor pages
│       │       └── MenteeLayout.jsx   # Sidebar + topbar wrapper for mentee pages
│       │
│       └── pages/
│           ├── Home.jsx               # Public landing page
│           │
│           ├── auth/
│           │   ├── Login.jsx          # Login page (admin / mentor / mentee tabs)
│           │   ├── Signup.jsx         # Signup page (mentee + mentor with invite code)
│           │   ├── VerifyEmail.jsx    # OTP verification page after signup
│           │   ├── ForgotPassword.jsx # Request password reset email
│           │   └── ResetPassword.jsx  # Enter new password via reset token
│           │
│           ├── admin/
│           │   ├── Dashboard.jsx      # Admin overview stats + recent activity
│           │   ├── Programs.jsx       # Create/edit/delete programs + cover image
│           │   ├── Sessions.jsx       # Create/edit/delete sessions + cover image
│           │   ├── Users.jsx          # View/manage all users + delete
│           │   ├── Attendance.jsx     # View attendance across all sessions
│           │   ├── Resources.jsx      # Upload/manage global resources
│           │   └── Analytics.jsx      # Platform-wide analytics + CSV export
│           │
│           ├── mentor/
│           │   ├── Dashboard.jsx      # Mentor overview — assigned programs + stats
│           │   ├── Sessions.jsx       # View/create/edit own sessions
│           │   ├── Profile.jsx        # Edit bio, expertise, LinkedIn, photo
│           │   ├── Certificates.jsx   # Upload/manage own certificates
│           │   ├── Resources.jsx      # Upload/manage own resources
│           │   └── Analytics.jsx      # Per-program mentee progress analytics
│           │
│           └── mentee/
│               ├── Dashboard.jsx      # Mentee overview — enrollments + upcoming
│               ├── Programs.jsx       # Browse + request enrolment in programs
│               ├── Enrollments.jsx    # View own enrolments + unenrol
│               ├── Sessions.jsx       # Watch sessions (live join / recorded video)
│               ├── Attendance.jsx     # View own attendance records
│               └── Resources.jsx      # View resources from enrolled programs
│
└── _old_jinja_frontend_reference/     # ARCHIVED — old Jinja2 HTML templates
    ├── static/css/                    # Old CSS files (not used)
    └── templates/                     # Old HTML templates (not used)
```

---

## Key Files Explained

| File | Purpose |
|------|---------|
| `backend/main.py` | Single file containing all 80+ API endpoints, middleware, schedulers |
| `backend/security.py` | JWT token creation/decoding, bcrypt password hashing |
| `backend/email_service.py` | All email templates — OTP, enrollment, session alerts, certificates |
| `backend/cloudinary_config.py` | Wraps Cloudinary SDK upload into a single `upload_file()` function |
| `backend/create_tables.py` | Run once to create all DB tables — uses SQLAlchemy `Base.metadata.create_all()` |
| `frontend/src/App.jsx` | All React Router routes defined here — maps URL paths to page components |
| `frontend/src/context/AuthContext.jsx` | Fetches `/api/me` on load, stores user + role globally |
| `frontend/src/api/client.js` | All API calls go through this axios instance with cookies enabled |
| `frontend/vercel.json` | Tells Vercel to serve `index.html` for all routes (required for React Router) |
