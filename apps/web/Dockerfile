FROM oven/bun:1.3.6 AS deps
WORKDIR /app

ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SERVER_URLS
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_SERVER_URLS=${NEXT_PUBLIC_SERVER_URLS}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}

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

COPY --from=deps /app /app

WORKDIR /app/apps/web
EXPOSE 3001
CMD ["bun", "run", "start"]
