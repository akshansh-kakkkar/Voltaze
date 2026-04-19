FROM oven/bun:1.3.6 AS deps
WORKDIR /app

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

COPY --from=deps /app /app

WORKDIR /app/apps/server
EXPOSE 3000
CMD ["bun", "run", "start"]
