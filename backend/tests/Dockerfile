FROM golang:1.24.2-alpine AS base

RUN apk add --no-cache make git ca-certificates

ENV GOPROXY=https://proxy.golang.org,direct
ENV GOSUMDB=sum.golang.org

WORKDIR /go/src/streamflow-cplane

COPY ./go.mod ./go.sum /go/src/streamflow-cplane/
COPY ./local/libs/models /go/src/streamflow-cplane/local/libs/models

RUN go mod download -x
COPY ./cmd ./cmd
COPY ./internal ./internal

# Build stage to test & build binary of application.
FROM base AS build

ARG VERSION
RUN mkdir -p bin
RUN go build -ldflags="-X 'main.version=${VERSION}'" -o ./bin/streamflow-cplane ./cmd/

FROM ubuntu:22.04 AS bin

COPY --from=build /go/src/streamflow-cplane/bin/streamflow-cplane /streamflow-cplane
COPY ./tests/config.yaml ./config.yaml
COPY ./migrations ./migrations
COPY ./templates ./templates
COPY ./json ./json
ENTRYPOINT ["/streamflow-cplane", "${VERSION}"]
