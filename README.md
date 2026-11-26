<div align="center">

# The Metiendole — MeteleNomas Community Platform

**Full-stack interactive community hub for the MeteleNomas streaming channel**, featuring user authentication, gamified XP/levels & daily streaks, live giveaways with an OBS-ready roulette overlay, community polls, clips, and an admin control panel.

[![Live Demo](https://img.shields.io/badge/Live_Demo-the--metiendole.vercel.app-38B2AC?style=for-the-badge&logo=vercel&logoColor=white)](https://the-metiendole.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Key Features

- **Authentication & Role-Based Profiles** — Powered by **NextAuth v5** + Prisma Adapter with role tiers (`ADMIN`, `MODERATOR`, `VIP`, `MEMBER`), customizable nicknames, banners, Discord tags, and YouTube handles.
- **Gamification & Economy Engine** — Points & XP ledger (`PointTransaction`), level progression, daily check-in streaks (`/api/user/claim-daily`), achievements, and reward redemptions.
- **Giveaways & Live OBS Roulette** — Entry management with point/level eligibility checks, QR code support, and a dedicated transparent **OBS Browser Source roulette overlay** (`/obs/ruleta`) for live stream draws.
- **Interactive Community Polls & Feed** — Real-time community voting (`/api/polls/vote`, `/api/votar`), posts, comments, reactions, and stream clip submissions.
- **Admin Dashboard** — Centralized moderation and event management at `/admin`.
- **Containerized Workflows** — Dedicated `Dockerfile.dev`, `Dockerfile.prod`, and `docker-compose.yml` for reproducible local and production deployments.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & UI** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Sonner |
| **State & Auth** | Zustand, NextAuth v5 (`@auth/prisma-adapter`) |
| **Database & ORM** | Prisma ORM (SQLite / portable relational schema) |
| **DevOps & Deploy** | Docker, Docker Compose, Vercel |

---

## Architecture Overview

```text
├── prisma/
│   ├── schema.prisma       # Users, roles, XP ledger, giveaways, polls, clips, achievements
│   └── seed.js             # Initial seed data
├── src/
│   └── app/
│       ├── admin/          # Moderation & giveaways control panel
│       ├── obs/ruleta/     # Live OBS browser-source giveaway roulette
│       ├── sorteo/         # Public giveaway participation flow
│       └── api/            # REST endpoints (auth, giveaways, polls, daily XP, sync)
├── Dockerfile.dev
├── Dockerfile.prod
└── docker-compose.yml
```

---

## Getting Started

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/fizsmx/the_metiendole.git
cd the_metiendole

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
# DATABASE_URL="file:./dev.db"
# AUTH_SECRET="your-secret"

# 4. Initialize the database
npx prisma migrate dev
node prisma/seed.js

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
docker compose up --build
```

---

<div align="center">
  Built by <a href="https://github.com/fizsmx"><strong>Fisbert Chavez (@fizsmx)</strong></a>
</div>
