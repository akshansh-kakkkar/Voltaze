FROM oven/bun:1.3.6 AS deps
WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lock turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN bun install --frozen-lockfile

WORKDIR /app/apps/server
RUN bun run build

FROM oven/bun:1.3.6 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from deps
COPY --from=deps /app/package.json /app/bun.lock /app/
COPY --from=deps /app/apps/server/dist /app/apps/server/dist
COPY --from=deps /app/apps/server/package.json /app/apps/server/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/db /app/packages/db

WORKDIR /app/apps/server
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["bun", "dist/index.mjs"]
