.PHONY: help pull build rebuild up down restart logs ps clean frontend-rebuild dev-front

COMPOSE ?= docker compose
SERVICES ?=
FRONTEND_DIR ?= cplane/frontend
FRONTEND_NODE_OPTIONS ?= --max-old-space-size=6144

help:
	@echo "Usage: make <target> [SERVICES='service1 service2']"
	@echo ""
	@echo "Targets:"
	@echo "  pull     - Pull latest images for all/services"
	@echo "  build    - Build images with base image updates (--pull)"
	@echo "  rebuild  - Pull + build (--no-cache) + recreate containers"
	@echo "  up       - Start/recreate containers in background"
	@echo "  down     - Stop and remove containers"
	@echo "  restart  - Quick restart with image and build updates"
	@echo "  logs     - Follow container logs"
	@echo "  ps       - Show container status"
	@echo "  clean    - Down + remove volumes and local images"
	@echo "  frontend-rebuild - Rebuild frontend bundle"
	@echo "  dev-front      - Run frontend locally with HMR, proxying to backend in Docker"

pull:
	$(COMPOSE) pull $(SERVICES)

build:
	$(COMPOSE) build --pull $(SERVICES)

rebuild: pull
	$(COMPOSE) build --pull --no-cache $(SERVICES)
	$(COMPOSE) up -d --force-recreate --remove-orphans $(SERVICES)

up:
	$(COMPOSE) up -d --force-recreate --remove-orphans $(SERVICES)

down:
	$(COMPOSE) down

restart: pull build
	$(COMPOSE) up -d --force-recreate --remove-orphans $(SERVICES)

logs:
	$(COMPOSE) logs -f --tail=200 $(SERVICES)

ps:
	$(COMPOSE) ps

clean:
	$(COMPOSE) down --volumes --rmi local --remove-orphans

frontend-rebuild:
	rm -rf $(FRONTEND_DIR)/dist
	cd $(FRONTEND_DIR) && NODE_OPTIONS="$(FRONTEND_NODE_OPTIONS)" npm run build

# Run frontend dev server locally with HMR, proxying API to backend in Docker.
# Starts postgres+backend+nginx if needed, then Vite on http://localhost:8081
dev-front:
	$(COMPOSE) up -d postgres backend nginx
	cd front && npm run dev:docker
