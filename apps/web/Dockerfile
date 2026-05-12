FROM oven/bun:1.3.6 AS deps
WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URLS
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SERVER_URLS
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_URLS=${NEXT_PUBLIC_API_URLS}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_SERVER_URLS=${NEXT_PUBLIC_SERVER_URLS}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lock turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN bun install --frozen-lockfile

WORKDIR /app/apps/web
RUN bun run build

FROM oven/bun:1.3.6 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Copy standalone build and static assets
COPY --from=deps /app/apps/web/.next/standalone ./
COPY --from=deps /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=deps /app/apps/web/public ./apps/web/public

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3001').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# The standalone server is located at apps/web/server.js
CMD ["bun", "apps/web/server.js"]
