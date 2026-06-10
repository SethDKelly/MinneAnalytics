# Expects `npm run build` to have run on the host (GitHub Actions) before `docker build`.
FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --home-dir /app nextjs \
  && mkdir -p /data/prisma /data/uploads && chown -R nextjs:nodejs /data
WORKDIR /app
ENV HOME=/app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DEPLOYMENT_MODE=aws
ENV DATA_DIR=/data
ENV UPLOAD_DIR=/data/uploads
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY public ./public
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY lib ./lib
COPY prisma ./prisma
COPY node_modules/.prisma ./node_modules/.prisma
COPY node_modules/@prisma ./node_modules/@prisma
COPY node_modules/tsx ./node_modules/tsx
COPY node_modules/esbuild ./node_modules/esbuild
COPY package.json ./package.json
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && npm install --no-save prisma@6.9.0 \
  && test -f node_modules/tsx/dist/cli.mjs \
  && test -f prisma/seed.ts \
  && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
