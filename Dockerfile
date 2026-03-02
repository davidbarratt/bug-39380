# syntax=docker/dockerfile:1

ARG NODE_VERSION="22"
ARG PLAYWRIGHT_VERSION="1.58.2"

FROM node:${NODE_VERSION}-alpine AS server

WORKDIR /app

COPY server.js ./

CMD ["node", "server.js", "0.0.0.0"]

FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble AS test

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY playwright.config.ts ./
COPY tests ./tests

ENTRYPOINT ["npx", "playwright"]
CMD ["test"]
