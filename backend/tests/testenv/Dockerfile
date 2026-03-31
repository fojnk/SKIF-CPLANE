FROM golang:1.24.2-alpine AS base

RUN apk add --no-cache make ca-certificates

ENV GOPROXY=https://proxy.golang.org,direct
ENV GOSUMDB=sum.golang.org

WORKDIR /go/src/streamflow-testenv

COPY ./go.mod /go/src/streamflow-testenv/
RUN go mod download -x
COPY . .

# Build stage to test & build binary of application.
FROM base AS build

ARG VERSION
RUN mkdir -p bin
RUN go build -ldflags="-X 'main.version=${VERSION}'" -o ./bin/streamflow-testenv .

FROM scratch AS bin

COPY --from=build /go/src/streamflow-testenv/bin/streamflow-testenv /streamflow-testenv
ENTRYPOINT ["/streamflow-testenv"]
