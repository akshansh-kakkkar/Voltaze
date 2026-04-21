# UniEvent Server

Express-based API server for the UniEvent platform.

## Setup

```bash
# Copy environment variables
cp .env.example .env

# Install dependencies (from monorepo root)
bun install

# Generate Prisma client
bun run db:generate

# Start development server
bun run dev
```

## Environment Variables

See `.env.example` for required variables.

## API Structure

- `POST /api/auth/custom/*` - Custom auth endpoints (Better Auth)
- `GET|POST|PATCH|DELETE /api/users` - User management
- `GET|POST|PATCH|DELETE /api/events` - Events + ticket tiers
- `GET|POST|PATCH|DELETE /api/attendees` - Attendee management
- `GET|POST|PATCH|DELETE /api/orders` - Orders
- `GET|POST|PATCH|DELETE /api/tickets` - Tickets
- `GET|POST|PATCH|DELETE /api/passes` - Passes + validation
- `GET|POST|DELETE /api/check-ins` - Check-ins
- `GET|POST|PATCH|DELETE /api/payments` - Payments + Razorpay webhooks
- `GET /api/analytics/*` - Analytics dashboards
- `GET|POST|PATCH|DELETE /api/notifications` - Notifications

## Middleware Stack

1. Security headers (Helmet)
2. Rate limiting
3. CORS
4. Request ID
5. Request logging
6. JSON parser (with rawBody for webhooks)
7. Auth module (`/api/auth`)
8. Feature modules
9. 404 handler
10. Global error handler

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Development with hot reload |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run check-types` | TypeScript type checking |
| `bun run compile` | Compile to standalone binary |
