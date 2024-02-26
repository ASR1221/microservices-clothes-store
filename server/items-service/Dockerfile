# syntax=docker/dockerfile:1

# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=18.18.1

FROM node:${NODE_VERSION}-alpine

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER root

WORKDIR /

COPY ./package.json .
COPY ./package-lock.json .
COPY ./tsconfig.json .

RUN npm i

COPY ./src/ /src/
COPY ./public/ /public/

RUN mkdir -p /build/

# Expose the port that the application listens on.
EXPOSE 3002

# Run the application.
RUN npm run build
CMD npm run start
