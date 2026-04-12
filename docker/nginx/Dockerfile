FROM node:20-alpine AS frontend-build

WORKDIR /frontend

RUN apk add --no-cache python3 make g++

COPY frontend/package*.json ./
# ECONNRESET / flaky registry: retry downloads with longer backoff (npm default is light).
RUN npm config set fetch-retries 10 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm ci

COPY frontend/ ./

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=2048
ENV DISABLE_BUILD_CHECKS=true
ENV LIGHTWEIGHT_BUILD=true
ENV DISABLE_LEGACY_BUILD=true
ENV CP_API_URL=/frontend-cplane
ENV CP_SWAGGER_URL=/frontend-cplane/api/v1/swagger/doc.json

RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html
