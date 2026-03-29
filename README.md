# Anonymous Crime Reporting System

A full-stack React + Node.js web application that allows citizens to report crimes anonymously (no login required) while giving verified police officials a secure dashboard to view, manage, and act on reports.

---

## Project Structure

```
crime-report/
│
├── README.md
│
├── backend/                               ← Node.js / Express API
│   ├── .env                               ← Environment variables
│   ├── .env.example                       ← Env template
│   ├── package.json
│   ├── server.js                          ← Express entry point
│   ├── config/
│   │   └── database.js                    ← In-memory DB + seed data
│   ├── middleware/
│   │   ├── auth.js                        ← JWT verify middleware
│   │   └── upload.js                      ← Multer file upload
│   ├── models/
│   │   ├── Official.js                    ← Police official schema
│   │   └── Report.js                      ← Crime report schema
│   └── routes/
│       ├── auth.js                        ← Login / Register / Profile
│       ├── reports.js                     ← CRUD + filter + stats
│       └── upload.js                      ← File upload route
│
└── frontend/                              ← React 18 SPA
    ├── .env                               ← API base URL config
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                         ← Router + Navbar layout
        ├── index.js                       ← React root mount
        ├── index.css                      ← Global dark navy theme
        ├── context/
        │   └── AuthContext.js             ← Global auth state (Context API)
        ├── utils/
        │   └── api.js                     ← Axios instance + interceptors
        ├── components/
        │   ├── Navbar.js                  ← Top navigation bar
        │   ├── ProtectedRoute.js          ← Auth guard for police routes
        │   ├── FileUpload.js              ← Drag-and-drop evidence uploader
        │   ├── StatsCard.js               ← Dashboard stat card
        │   └── StatusBadge.js             ← Status / priority badges
        └── pages/
            ├── LandingPage.js             ← Home with typewriter effect
            ├── ReportPage.js              ← Anonymous 2-step crime form
            ├── TrackPage.js               ← Track report by ID
            ├── LoginPage.js               ← Police badge login
            ├── RegisterPage.js            ← New official registration
            ├── DashboardPage.js           ← Reports table + stats
            ├── ReportDetailPage.js        ← Full report + officer actions
            └── NotFoundPage.js            ← 404 page
```

**Total: 30 files**

---

## How to Run

### Backend
```bash
cd backend
npm install
npm run dev        # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start          # http://localhost:3000
```

---

## Demo Login Credentials

| Badge ID | Password   | Name                  | Rank           |
|----------|------------|-----------------------|----------------|
| HYD-001  | Police@123 | Supt. Ramesh Kumar    | Superintendent |
| HYD-002  | Police@456 | Insp. Priya Sharma    | Inspector      |

---

## API Endpoints

### Public
| Method | Endpoint                    | Description                   |
|--------|-----------------------------|-------------------------------|
| POST   | /api/reports                | Submit anonymous crime report |
| GET    | /api/reports/track/:id      | Track report by tracking ID   |
| POST   | /api/auth/login             | Police official login         |
| POST   | /api/auth/register          | Register new official         |
| GET    | /api/health                 | Server health check           |

### Protected (JWT Bearer token required)
| Method | Endpoint                    | Description                   |
|--------|-----------------------------|-------------------------------|
| GET    | /api/reports                | List all reports (filterable) |
| GET    | /api/reports/stats          | Dashboard statistics          |
| GET    | /api/reports/:id            | Get single full report        |
| PATCH  | /api/reports/:id            | Update status / notes         |
| GET    | /api/auth/profile           | Logged-in official profile    |

---

## Key Features

- Anonymous reporting — no login, no IP stored, no personal data
- Multi-file evidence upload — images & videos up to 100MB, max 5 files
- Anonymous tracking ID — citizens can check their report status
- Police dashboard — filter/search reports by status, type, keyword
- Media lightbox — view images and play videos inline
- JWT authentication — secure 8-hour session tokens
- Dark navy UI — matches the provided design screenshot exactly
