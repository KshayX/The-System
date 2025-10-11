# Architecture Overview

The Real Life Solo Levelling System is split into two deployable services:

1. **Backend API (`backend/`)** – FastAPI service exposing player management, quests, inventory, skills, shop, and analytics endpoints. Uses SQLModel on top of SQLAlchemy for ORM convenience and ships with JWT authentication.
2. **Frontend dashboard (`frontend/`)** – React + Vite single-page application that consumes the REST API and visualises hunter progression with Tailwind-driven styling and Recharts visualisations.

## Data Model Summary

* **Player** – core profile with RPG stats, currency, streak tracking, and mana pool. Levels are derived from total XP using a scaling function.
* **Quest** – supports daily, penalty, emergency, and story quests with deadlines, rewards, and statuses.
* **Item / InventoryItem** – item catalogue and player inventory with equipment flags and stat bonuses.
* **Skill / PlayerSkill** – skill tree definitions and player unlocks including mana costs and level requirements.
* **Transaction & Achievement** – audit trail for rewards and milestone unlocks.
* **AnalyticsSnapshot** – persistent snapshots for long-term analytics (extendable).

## Key Services

* `services/quests.py` – quest lifecycle management including daily quest generation, penalty zone handling, and emergency quest scheduling.
* `services/progression.py` – XP and rank calculations, stat point distribution, and streak updates.
* `utils/leveling.py` – shared XP scaling logic for both backend and frontend clients.

## Extensibility Notes

* Swap SQLite for PostgreSQL by updating `SOLO_SYSTEM_DATABASE_URL` in the environment.
* Implement notification integrations (email, push, SMS) by hooking into quest completion/failure within the routers.
* Extend `AnalyticsSnapshot` for scheduled batch jobs to provide richer historical insight.
* Infrastructure automation templates can live under `infrastructure/` (e.g., Terraform, Helm charts).

## Security Considerations

* JWT secret keys must be rotated and stored securely (e.g., environment secrets or secret manager).
* Password hashing uses `passlib` with bcrypt – ensure dependencies remain patched.
* Enable HTTPS and configure CORS to specific domains in production.
