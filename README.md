# Real Life Solo Levelling System

A full-stack gamification platform inspired by the Solo Leveling player system. The project delivers a production-ready REST API, persistent SQLite storage, and a responsive dashboard that visualises hunter progression, quests, inventory rewards, and analytics.

## Project Structure

```
.
├── backend/        # FastAPI + SQLModel application and automated tests
├── frontend/       # Vite + React + Tailwind responsive dashboard
├── docs/           # Additional documentation (extend as needed)
├── infrastructure/ # Deployment templates (placeholder)
└── README.md
```

## Backend (FastAPI)

### Features

* Player profile management with RPG statistics, rank progression, streak tracking, and mana economy.
* Daily quest orchestration with automatic generation, penalty zone escalation, and emergency quest triggers.
* Reward resolution engine that allocates XP, currency, stat points, and rank upgrades on completion.
* Inventory, skill, and shop modules supporting loot boxes, equipment bonuses, and unlock gating.
* Analytics endpoint exposing streaks, XP averages, and quest history for dashboard visualisations.
* JWT authentication with password hashing and OAuth2 token issuance.

### Running the API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

Environment variables can be customised via `.env` in the backend directory (see `app/config.py`).

### Tests

```bash
cd backend
pytest
```

## Frontend (React + Vite)

### Features

* Authentication panel that stores bearer tokens locally and connects to the API.
* Hunter dashboard surfacing level, stats, streaks, XP progress, daily quest controls, and analytics charting.
* Responsive layout with Tailwind CSS, dark-theme design, and mission cards for active quests.
* React Query powered data fetching with optimistic refreshes following quest completions.

### Running the Dashboard

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` if the backend is hosted elsewhere (defaults to `http://localhost:8000`).

## Deployment Notes

* The backend uses SQLite by default—swap `SOLO_SYSTEM_DATABASE_URL` for PostgreSQL or other RDBMS.
* Add production-grade reverse proxying (e.g., Nginx) and HTTPS termination when deploying publicly.
* Containerisation and IaC templates can be defined inside the `infrastructure/` directory.

## Initial Setup

1. Register a new hunter using the `/auth/register` endpoint (e.g., via cURL or Postman).
2. Use the registered credentials inside the dashboard login panel.
3. Claim the daily quest, complete it to gain XP, and monitor rank progression in real-time.

Enjoy your journey from E-rank to National Level!
