FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/planning-rules/package.json packages/planning-rules/package.json

RUN npm ci --include=dev

COPY . .
RUN npm run build:shared \
  && npm run build -w @jashn/api \
  && npm prune --omit=dev

FROM node:24-slim

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/packages/planning-rules/package.json ./packages/planning-rules/package.json
COPY --from=build /app/packages/planning-rules/dist ./packages/planning-rules/dist

EXPOSE 3000
CMD ["node", "apps/api/dist/server.mjs"]
