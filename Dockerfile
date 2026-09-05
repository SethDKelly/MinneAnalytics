FROM node:24-alpine AS deps
WORKDIR /app
ENV DATABASE_URL=file:./build.db
COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ENV DATABASE_URL=file:./build.db
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma migrate deploy && npm run build && rm -f prisma/build.db

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DEPLOYMENT_MODE=aws
ENV DATA_DIR=/data
ENV UPLOAD_DIR=/data/uploads
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
RUN mkdir -p /data/prisma /data/uploads && chown -R nextjs:nodejs /data

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrations ./scripts/migrations
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
