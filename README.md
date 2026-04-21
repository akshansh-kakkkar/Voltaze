# UniEvent

Event management platform monorepo built with TypeScript, Bun, and PostgreSQL.

## Architecture

```
.
├── apps/
│   ├── server/          # Express + Better Auth backend API
│   └── web/             # Next.js frontend (excluded from this scope)
├── packages/
│   ├── db/              # Prisma ORM + database schema
│   ├── env/             # Environment variable validation (@t3-oss/env)
│   ├── schema/          # Zod validation schemas shared across the monorepo
│   └── config/          # Shared TypeScript configuration
├── postman/             # API collection
├── docker-compose.yml   # Local development stack
└── package.json         # Workspace configuration
```

## Prerequisites

- [Bun](https://bun.sh/) 1.3.6+
- PostgreSQL 16+ (or use Docker)
- Node.js 20+ (for Prisma CLI compatibility)

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Environment setup

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database

**Option A: Docker (recommended)**

```bash
docker-compose up -d postgres
```

**Option B: Local PostgreSQL**

Ensure `DATABASE_URL` in `.env` points to your local instance.

### 4. Database schema

```bash
# Push schema (development)
bun run db:push

# Or use migrations (production)
bun run db:migrate

# Seed data
bun run db:seed
```

### 5. Start development

```bash
# Start server only
bun run dev:server

# Or start everything with Turbo
bun run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run dev:server` | Start server only |
| `bun run dev:web` | Start web app only |
| `bun run build` | Build all packages and apps |
| `bun run check-types` | Type-check all workspaces |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:migrate` | Run database migrations |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:seed` | Seed database with sample data |
| `bun run db:studio` | Open Prisma Studio |
| `bun run check` | Run Biome linting and formatting |

## Tech Stack

- **Runtime:** Bun
- **Backend:** Express 5, Better Auth, Zod
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Validation:** Zod
- **Payments:** Razorpay
- **Email:** Brevo
- **Monorepo:** Turborepo
- **Linting/Formatting:** Biome
- **Package Manager:** Bun workspaces

## Backend Modules

| Module | Description |
|--------|-------------|
| `auth` | Authentication (Better Auth + Bearer tokens) |
| `users` | User management and profiles |
| `events` | Event CRUD, ticket tiers, hosting |
| `attendees` | Event attendee registration |
| `orders` | Order placement and management |
| `tickets` | Issued ticket instances |
| `passes` | Entry passes with QR validation |
| `check-ins` | QR/manual event check-ins |
| `payments` | Razorpay integration + webhooks |
| `analytics` | Event analytics and revenue reports |
| `notifications` | In-app notification system |

## License

Private
