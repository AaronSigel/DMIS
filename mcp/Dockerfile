ARG NODE_IMAGE=node:20-alpine
ARG RUNTIME_BASE_IMAGE=base

FROM ${NODE_IMAGE} AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM ${RUNTIME_BASE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY src ./src
EXPOSE 8090
CMD ["node", "src/server.mjs"]
