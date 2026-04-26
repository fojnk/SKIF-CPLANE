ifeq ($(VERSION),)
    VERSION = $(shell date +%s)
endif

TIMESTAMP = $(shell TZ=Europe/Moscow date +%Y%m%d%H%M%S)

# Docker Compose V2 (`docker compose`); override with `DOCKER_COMPOSE=docker-compose` if you use the legacy binary.
DOCKER_COMPOSE ?= docker compose

sqlgen:
	$(shell go env GOPATH)/bin/sqlc generate -f internal/db/sqlc.yaml
	mockgen -source=internal/db/db.go -destination=internal/mocks/db/db.go -package=dbmock
build-amd:
	mkdir -p bin
	env GOOS=linux GOARCH=amd64 go build -ldflags="-X 'main.version=$(VERSION)'" -o ./bin/streamflow-cplane ./cmd/
build:
	mkdir -p bin
	go build -ldflags="-X 'main.version=$(VERSION)'" -o ./bin/streamflow-cplane ./cmd/
swagger: swagger-private
swagger-private:
	swag init -g internal/app/app.go -o internal/docs/private_docs/ 
swagger-client: swagger-private-client

swagger-private-client:
	rm -rf tests/private/client
	rm -rf tests/private/models
	swagger generate client --target=./tests/private --spec=./internal/docs/private_docs/swagger.json

docker-build:
	docker build -t cplane:$(VERSION) -f ./tests/Dockerfile .
docker-build-test:
	docker build -t cplane:current_test -f ./tests/Dockerfile .
	cd tests/testenv && docker build -t testenv:current_test .
test-end2end: docker-build-test test-end2end-private test-end2end-public

test-end2end-private: docker-build-test
	cd tests && $(DOCKER_COMPOSE) up -d
	./tests/waiter.sh
	-go test -count=1 -v ./tests/private
	docker exec -it tests-cplane-1 cat log.log > ./tests/private_log.log
	cd tests && $(DOCKER_COMPOSE) down -v
	rm -r ./tests/pgdata


new_migrate:
	touch "./migrations/up/$(TIMESTAMP)_$(NAME).up.sql"
	touch "./migrations/down/$(TIMESTAMP)_$(NAME).down.sql"

test-all: swagger swagger-client test-end2end
	go test -count=1 -v ./internal/...

setup:
	go install go.uber.org/mock/mockgen@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	go get -tool github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
	go install github.com/go-swagger/go-swagger/cmd/swagger@latest

env:
	export PATH=$(go env GOPATH)/bin:$PATH

generate-jsonchema:
	protoc \
      --plugin=${HOME}/go/bin/protoc-gen-jsonschema \
      --jsonschema_opt=disallow_bigints_as_strings \
      --jsonschema_out=/Users/vladimir.petrov/Desktop/job/streamflow/cplane/json \
      --proto_path=/Users/vladimir.petrov/Desktop/job/streamflow/cplane/proto /Users/vladimir.petrov/Desktop/job/streamflow/cplane/proto/pipline.proto

.PHONY: ci-test
ci-test: 
	LOG_LEVEL=FATAL go test ./internal/... -benchmem -bench . -coverprofile=coverage.txt -covermode count
	gocover-cobertura < coverage.txt > coverage.xml
	go tool cover -func=coverage.txt

.PHONY: ci-prepare
ci-prepare:
	go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.7.2
	go install github.com/boumenot/gocover-cobertura@v1.2.0

.PHONY: lint
lint:
	golangci-lint run ./...
