FROM golang:1.22.5-alpine3.20 AS go-builder

WORKDIR /build
COPY go.* ./
RUN go mod download

ENV CGO_ENABLED=1
RUN apk add --no-cache gcc musl-dev

COPY . ./
RUN go build -o ./bin/server ./cmd/server
RUN go build -o ./bin/cli ./cmd/cli

FROM node:18-alpine AS node-base

FROM node-base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /build

COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile


FROM node-base AS node-builder
WORKDIR /build
COPY --from=deps /build/node_modules ./node_modules
COPY . .
RUN yarn build:maindesk

FROM nginx:stable-alpine3.17-slim
RUN apk add --no-cache supervisor
COPY ./etc/supervisord.conf /app/etc/supervisord.conf
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /app/bin
COPY --from=node-builder /build/dist/maindesk /usr/share/nginx/html
COPY --from=go-builder /build/bin/* /app/bin/
COPY --from=go-builder /build/.env /app/bin/.env

ENTRYPOINT ["supervisord"]
CMD ["-c", "/app/etc/supervisord.conf"]



