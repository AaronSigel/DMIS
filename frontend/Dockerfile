ARG NODE_IMAGE=node:20-alpine
ARG BUILD_BASE_IMAGE=base

FROM ${NODE_IMAGE} AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM ${BUILD_BASE_IMAGE} AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
