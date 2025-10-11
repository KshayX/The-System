# Real Life Solo Leveling System

An industry-ready, full-stack Solo Leveling inspired gamification platform that transforms real-life habit tracking into RPG progression. The application includes a RESTful API built with Express + Prisma and a Vite + React dashboard with real-time inspired visuals.

## Features

- Player stat progression with leveling, rank classification, and power level calculations.
- Daily quest system that enforces the "Preparation To Become Powerful" routine with timers and penalties.
- Automatic penalty zone survival quests when daily quests fail.
- Emergency quest triggers for user-defined high priority missions.
- Inventory, loot boxes, and shop items with stat bonuses.
- Skill tree visualization with job change callouts and achievements tracker.
- Analytics dashboard summarizing progress, streaks, and reward totals.

## Tech Stack

- **Backend:** Node.js, Express, Prisma ORM (SQLite by default)
- **Frontend:** React + Vite + TypeScript, Recharts (ready for analytics visualizations)
- **Auth:** JWT authentication with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

Copy the server environment variables and run the initial migration:

```bash
cp apps/server/.env.example apps/server/.env
npm run prisma:migrate
npm run -w apps/server seed
```

### Development

Run both the API and the client dashboard in parallel:

```bash
npm run dev
```

- API: http://localhost:4000
- Frontend: http://localhost:5173 (proxying API calls)

### Production Build

```bash
npm run build
```

The Express server compiles to `apps/server/dist` and the Vite client outputs to `apps/client/dist`.

## Database Schema

The Prisma schema models users, profiles, quests, transactions, skills, inventory, and achievements. SQLite is used locally, but you can switch to PostgreSQL by updating the datasource in `apps/server/prisma/schema.prisma`.

## API Overview

- `POST /api/auth/register` – create an account
- `POST /api/auth/login` – log in and receive a JWT token
- `GET /api/player/me` – fetch profile, stats, and achievements
- `POST /api/player/allocate` – allocate stat points
- `POST /api/quests/daily` – spawn the daily preparation quest
- `POST /api/quests/:id/complete` – complete a quest and receive rewards
- `POST /api/quests/:id/fail` – mark failure and trigger penalty zone
- `POST /api/quests/emergency` – trigger an emergency quest
- `GET /api/inventory` – list inventory items
- `POST /api/shop/purchase` – purchase from the in-game shop
- `GET /api/analytics` – aggregate streak and reward analytics

## Frontend

The React dashboard lives in `apps/client` and contains:

- Responsive dashboard layout styled after the Solo Leveling UI aesthetic
- Authentication screen with login/register tabs
- Panels for stats, quest management, rewards, inventory, skill tree, shop, analytics, and achievements
- Hooks for JWT persistence and API calls

## Deployment

- Build the client (`npm run -w apps/client build`) and serve `dist` with your preferred static host.
- Configure the Express server (`npm run -w apps/server build`) and run `node apps/server/dist/index.js` with `DATABASE_URL` and `JWT_SECRET` environment variables set.

## Roadmap

- Integrate push notifications and cron-based quest refresh jobs
- Expand skill tree data via database seeding
- Add streak-based bonuses and advanced analytics charts

Level up in real life with the Real Life Solo Leveling System.
