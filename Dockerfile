# platformatic/node-caged: Node.js built with V8 pointer compression (~50% heap savings).
# Pinned by digest; bump tag and digest together.
FROM platformatic/node-caged:26.12.1-slim@sha256:7e05b71d1249f733b465bc3abc6b3e5854f183d2837bdd264f40b94947b9e6fc

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --no-create-home nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
