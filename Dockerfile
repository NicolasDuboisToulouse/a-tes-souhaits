FROM node:18-alpine AS base

FROM base AS dependencies
# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# RUN apk add --no-cache libc6-compat
WORKDIR /a-tes-souhaits
COPY package.json package-lock.json ./
RUN npm ci


FROM base AS builder
WORKDIR /a-tes-souhaits
COPY --from=dependencies /a-tes-souhaits/node_modules ./node_modules/
COPY lib lib/
COPY components components/
COPY app app/
COPY pages pages/
COPY next.config.js postcss.config.js tailwind.config.js tsconfig.json .eslintrc.json LICENSE package*.json ./
COPY .env.production .env.production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build


# TODO: database


FROM base AS runner
WORKDIR /a-tes-souhaits
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=builder /a-tes-souhaits/.next/standalone ./
COPY --from=builder /a-tes-souhaits/.next/static ./.next/static/

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 127.0.0.1

CMD ["node", "server.js"]


