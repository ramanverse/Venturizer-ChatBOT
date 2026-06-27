# Venturizer — Lead Qualification Chatbot & ERP Dashboard

> World's First Venture Capability Ecosystem — supporting founders in their 0–100 Crore journey.

## What It Does

A full-stack lead qualification system for Venturizer that includes:

1. **Public Landing Page** — Premium dark-navy website replicating venturizer.in's aesthetic with Philosophy, Models (Venture Trinity), Impact, and Qualification CTA sections.

2. **Chatbot Widget** — An interactive qualification assistant that guides founders (18 questions) and investors (17 questions) through structured flows covering personal info, startup/investment background, traction/portfolio, funding, and validation.

3. **Scoring Engine** — A rule-based scoring system (100 points) that evaluates leads across multiple criteria (MVP status, traction, team, funding stage, deal volume, etc.) and assigns them to buckets: HOT (80+), GOOD (60-79), MAYBE (40-59), LOW (0-39).

4. **ERP Dashboard** — An internal admin console with JWT authentication, KPI overview cards, segmented pill filters, lead table with profile slideouts, score breakdowns, simulated email outbox, CSV export, and internal notes.

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
PORT=5001
DATABASE_URL=postgresql://postgres:password@localhost:5432/venturizer_chatbot
JWT_SECRET=venturizer-secret-key-2024
ADMIN_EMAIL=admin@venturizer.co
ADMIN_PASSWORD=adminpassword
```

### 3. Database Setup

```bash
# Create the database
createdb venturizer_chatbot

# Run the schema migration
psql -d venturizer_chatbot -f backend/models/schema.sql
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Dashboard Login**: admin@venturizer.co / adminpassword

## API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/leads/start` | Initialize a lead session. Body: `{ user_type }`. Returns `session_id`. |
| `POST` | `/api/leads/answer` | Save an answer. Body: `{ session_id, key, value }`. Validates inline. |
| `POST` | `/api/leads/submit` | Final submit. Runs scoring engine, triggers emails. Returns `{ score, bucket }`. |
| `POST` | `/api/dashboard/login` | Admin JWT login. Body: `{ email, password }`. Returns `{ token }`. |
| `GET` | `/api/dashboard/leads` | List leads. Supports `?user_type=&score_bucket=&status=&sector=&date_range=` filters. |
| `GET` | `/api/dashboard/leads/:id` | Full lead profile with details, score breakdown, and email history. |
| `PATCH` | `/api/dashboard/leads/:id/status` | Update lead status or notes. Body: `{ status }` or `{ notes }`. |
| `GET` | `/api/dashboard/stats` | KPI stats for overview cards. Supports `?date_range=`. |
| `GET` | `/api/dashboard/export` | CSV download with active filters. |
| `GET` | `/api/dashboard/emails` | All simulated email logs for outbox tab. |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Vite + React)         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ Landing  │  │ Chatbot  │  │  ERP Dashboard │ │
│  │  Page    │  │  Widget  │  │  (JWT Auth)    │ │
│  └──────────┘  └────┬─────┘  └───────┬────────┘ │
└──────────────────────┼────────────────┼──────────┘
                       │ REST API       │
┌──────────────────────┼────────────────┼──────────┐
│               Backend (Express.js)               │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Lead     │  │ Scoring  │  │  Dashboard   │  │
│  │  Routes   │  │  Engine  │  │  Routes      │  │
│  └─────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        └──────────────┼───────────────┘           │
│                       │                           │
│              ┌────────▼─────────┐                 │
│              │   PostgreSQL     │                 │
│              │  ┌─────────────┐ │                 │
│              │  │ leads       │ │                 │
│              │  │ founder_det │ │                 │
│              │  │ investor_det│ │                 │
│              │  │ score_break │ │                 │
│              │  │ sim_emails  │ │                 │
│              │  └─────────────┘ │                 │
│              └──────────────────┘                 │
└───────────────────────────────────────────────────┘
```

## Scoring Rules

### Founder (100 pts)
| Criterion | Max | Scoring |
|-----------|-----|---------|
| MVP Status | 25 | Revenue=25, Beta=18, Prototype=10, Idea=3 |
| Paying Customers | 15 | Yes=15, No=0 |
| MRR Bonus | 10 | >₹1L=10, ₹10k-1L=5 |
| Team | 10 | 2+ co-founders=10, Solo=5 |
| Validation | 15 | LOI/Pilot=15, Awards/Media=8, None=0 |
| Funding Stage | 5 | Series A=5, Seed=4, Pre-seed=3 |
| Answer Quality | 20 | >100 chars per field=5, short=2 (4 fields) |

### Investor (100 pts)
| Criterion | Max | Scoring |
|-----------|-----|---------|
| Stage Focus | 20 | Seed/Pre-seed=20, All=15, Late=8 |
| Cheque Size | 25 | >₹50L=25, ₹10L-50L=15, <₹10L=8 |
| Active Deployment | 20 | Yes=20, Planning=10, No=3 |
| Deal Volume | 15 | 5+=15, 2-4=8, 0-1=3 |
| Support Value | 10 | 3+ types=10, 1-2=5, None=0 |
| Answer Quality | 10 | >100 chars per field=5, short=2 (2 fields) |

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```
Set `VITE_API_URL` environment variable to your backend URL.

### Backend (Railway)
```bash
# Push to GitHub, connect Railway to repo
# Set environment variables in Railway dashboard
# Railway auto-detects Node.js and runs npm start
```

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Testing**: Jest
