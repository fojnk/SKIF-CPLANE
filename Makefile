.PHONY: help pull build rebuild up up-prep down restart logs ps clean frontend-rebuild

COMPOSE ?= docker compose
SERVICES ?=
FRONTEND_DIR ?= cplane/frontend
FRONTEND_NODE_OPTIONS ?= --max-old-space-size=6144

# Каталог на хосте для JSON-файлов супервизора (монтируется в java-supervisor по тому же пути; нужен docker.sock).
SUPERVISOR_HOST_WORKDIR ?= /tmp/supervisor-work
export SUPERVISOR_HOST_WORKDIR

help:
	@echo "Usage: make <target> [SERVICES='service1 service2']"
	@echo ""
	@echo "Targets:"
	@echo "  pull     - Pull latest images for all/services"
	@echo "  build    - Build images with base image updates (--pull)"
	@echo "  rebuild  - Pull + build (--no-cache) + recreate containers"
	@echo "  up       - Start full stack (build + recreate): postgres, rabbitmq, backend, java-supervisor, nginx"
	@echo "  down     - Stop and remove containers"
	@echo "  restart  - Quick restart with image and build updates"
	@echo "  logs     - Follow container logs"
	@echo "  ps       - Show container status"
	@echo "  clean    - Down + remove volumes and local images"
	@echo "  frontend-rebuild - Rebuild frontend bundle"

pull:
	$(COMPOSE) pull $(SERVICES)

build:
	$(COMPOSE) build --pull $(SERVICES)

rebuild: pull up-prep
	$(COMPOSE) build --pull --no-cache $(SERVICES)
	$(COMPOSE) up -d --force-recreate --remove-orphans $(SERVICES)

up-prep:
	mkdir -p "$(SUPERVISOR_HOST_WORKDIR)"

up: up-prep
	$(COMPOSE) up -d --build --force-recreate --remove-orphans $(SERVICES)

down:
	$(COMPOSE) down

restart: pull build up-prep
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
