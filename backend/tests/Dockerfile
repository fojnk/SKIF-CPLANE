FROM golang:1.23.7-alpine AS base

RUN apk add --no-cache make git

ENV GOPROXY=https://oneart.vkteam.ru/repository/golang/
ENV GOSUMDB="sum.golang.org https://oneart.vkteam.ru/repository/golang-sum/"
ENV GOPRIVATE=gitlab.corp.mail.ru

WORKDIR /go/src/streamflow-cplane

COPY ./go.mod ./go.sum /go/src/streamflow-cplane/

RUN --mount=type=secret,id=netrc,dst=/root/.netrc \
    go mod download -x
COPY ./cmd ./cmd
COPY ./internal ./internal

# Build stage to test & build binary of application.
FROM base AS build

ARG VERSION
RUN mkdir -p bin
RUN --mount=type=secret,id=netrc,dst=/root/.netrc \
    go build -ldflags="-X 'main.version=${VERSION}'" -o ./bin/streamflow-cplane ./cmd/

FROM ubuntu:22.04 AS bin

COPY --from=build /go/src/streamflow-cplane/bin/streamflow-cplane /streamflow-cplane
COPY ./tests/config.yaml ./config.yaml
COPY ./migrations ./migrations
COPY ./json ./json
ENTRYPOINT ["/streamflow-cplane", "${VERSION}"]
