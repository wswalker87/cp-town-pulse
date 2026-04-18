# cp-town-pulse Makefile

.PHONY: help up down build stop migrate superuser shell logs db-check \
        backend frontend dev clean-start freeze-local freeze-docker

help: ## Show this help message
	@echo "Town Pulse Development CLI"
	@echo "--------------------------"
	@usage

# Define the documentation here
define usage
	@printf "\033[36mdev\033[0m          Run DB in Docker + Django/Vite locally\n"
	@printf "\033[36mclean-start\033[0m  Kill zombie ports and reset Docker\n"
	@printf "\033[36mstop\033[0m         Full shutdown (saves AWS/API costs)\n"
	@printf "\033[36mmigrate\033[0m      Sync Django database schema\n"
	@printf "\033[36mbuild\033[0m        Rebuild Docker containers\n"
endef


# ── OS Detection ──────────────────────────────────────────────────────────────
# Windows users: run make targets inside WSL or Git Bash.
# The `dev` target uses bash job-control (&) and requires a Unix-like shell.
UNAME_S := $(shell uname -s 2>/dev/null || echo Windows)

ifeq ($(UNAME_S),Darwin)
    KILL_8000    := lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    KILL_5173    := lsof -ti :5173 | xargs kill -9 2>/dev/null || true
    VENV_PYTHON  := backend/venv/bin/python
    VENV_ACTIVATE := . backend/venv/bin/activate
else ifeq ($(UNAME_S),Windows)
    $(warning Windows detected — run this Makefile inside WSL or Git Bash for full support.)
    KILL_8000    := echo "Use WSL or Git Bash to kill port 8000 automatically"
    KILL_5173    := echo "Use WSL or Git Bash to kill port 5173 automatically"
    VENV_PYTHON  := backend/venv/Scripts/python
    VENV_ACTIVATE := . backend/venv/Scripts/activate
else
    # Linux / WSL
    KILL_8000    := fuser -k 8000/tcp 2>/dev/null || true
    KILL_5173    := fuser -k 5173/tcp 2>/dev/null || true
    VENV_PYTHON  := backend/venv/bin/python
    VENV_ACTIVATE := . backend/venv/bin/activate
endif

# ── Docker Compose ────────────────────────────────────────────────────────────
# Prefer Compose V2 plugin (`docker compose`); fall back to standalone V1.
DOCKER_COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

# ── Stack management ──────────────────────────────────────────────────────────
up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

build:
	$(DOCKER_COMPOSE) up -d --build

stop:
	@echo "Stopping everything........."
	-$(KILL_8000)
	-$(KILL_5173)
	$(DOCKER_COMPOSE) down
	@echo "Everything is off. No crazy API calls or AWS bills."

clean-start:
	-$(KILL_8000)
	-$(KILL_5173)
	$(DOCKER_COMPOSE) down

# ── Django ────────────────────────────────────────────────────────────────────
migrate:
	cd backend && $(VENV_ACTIVATE) && python manage.py makemigrations
	cd backend && $(VENV_ACTIVATE) && python manage.py migrate

superuser:
	$(DOCKER_COMPOSE) exec backend python manage.py createsuperuser

shell:
	$(DOCKER_COMPOSE) exec backend python manage.py shell

# ── Local dev servers ─────────────────────────────────────────────────────────
backend:
	$(DOCKER_COMPOSE) up -d db
	cd backend && $(VENV_ACTIVATE) && python manage.py runserver

frontend:
	cd frontend && npm run dev

# Runs DB in Docker; Django + Vite run locally in parallel.
# Requires a Unix-like shell (bash/zsh/WSL) for job-control (&).
dev:
	$(DOCKER_COMPOSE) up -d db
	(cd backend && $(VENV_ACTIVATE) && python manage.py runserver &)
	cd frontend && npm run dev

# ── Utilities ─────────────────────────────────────────────────────────────────
logs:
	$(DOCKER_COMPOSE) logs -f

db-check:
	$(DOCKER_COMPOSE) exec db pg_isready -U admin -d townpulse_db

# Freeze from local venv (use after `pip install` in the venv)
freeze-local:
	$(VENV_PYTHON) -m pip freeze > backend/requirements.txt

# Freeze from the running backend container
freeze-docker:
	$(DOCKER_COMPOSE) exec backend pip freeze > backend/requirements.txt
