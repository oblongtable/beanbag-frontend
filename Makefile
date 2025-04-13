DEV_COMPOSE_FILE=docker-compose-dev.yml
# DEBUG_COMPOSE_FILE=docker-compose-debug.yml
# TEST_COMPOSE_FILE=docker-compose-test.yml

### DOCKER COMPOSE COMMANDS

.PHONY: compose-build
compose-build:
	sudo docker compose -f $(DEV_COMPOSE_FILE) build

.PHONY: compose-up
compose-up:
	sudo docker compose -f $(DEV_COMPOSE_FILE) up

.PHONY: compose-up-build
compose-up-build:
	sudo docker compose -f $(DEV_COMPOSE_FILE) up --build

# .PHONY: compose-up-debug-build
# compose-up-debug-build:
# 	docker compose -f $(DEV_COMPOSE_FILE) -f $(DEBUG_COMPOSE_FILE) up --build

.PHONY: compose-down
compose-down:
	sudo docker compose -f $(DEV_COMPOSE_FILE) down

###

DOCKERCONTEXT_DIR:=./
DOCKERFILE_DIR:=./

# .PHONY: run-tests
# run-tests:
# 	docker compose -f $(DEV_COMPOSE_FILE) -f $(TEST_COMPOSE_FILE) run --rm --build {target}
