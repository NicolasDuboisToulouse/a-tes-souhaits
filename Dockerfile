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
COPY app app/
COPY next.config.js postcss.config.js tailwind.config.js tsconfig.json .eslintrc.json LICENSE package*.json ./
COPY .env.production .env.production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

COPY database/update_database.ts database/
COPY database/schemas database/schemas/
RUN npx tsc --esModuleInterop database/update_database.ts


FROM base AS runner
WORKDIR /a-tes-souhaits
ENV NEXT_TELEMETRY_DISABLED 1

ARG APP_GID=1001
ARG APP_UID=1001
RUN addgroup --system --gid ${APP_GID} nodejs
RUN adduser --system --uid ${APP_UID} -G nodejs nodejs
USER nodejs

COPY --from=builder /a-tes-souhaits/.next/standalone ./
COPY --from=builder /a-tes-souhaits/.next/static ./.next/static/

# Note: update_database.js dependencies are already present in next, we needn't to install them
COPY --from=builder /a-tes-souhaits/database/schemas database/schemas/
COPY --from=builder /a-tes-souhaits/database/update_database.js database/

COPY docker-entrypoint.sh ./

VOLUME /a-tes-souhaits/database/data

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

ENTRYPOINT ["./docker-entrypoint.sh"]


