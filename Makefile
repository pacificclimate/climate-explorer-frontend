# These variables are set to make it convenient to run the docker image locally.
tag = $(shell git rev-parse --abbrev-ref HEAD)
port = 30504
public_url = http://localhost:${port}

image:
	@npm run build
	@PCEX_TAG=$(tag) PCEX_PORT=$(port) docker compose -f docker/docker-compose.yaml build

up:
	@PCEX_TAG=$(tag) PCEX_PORT=$(port) docker compose -f docker/docker-compose.yaml up --force-recreate
	@echo "Station Data Portal running on $(port)"
	@docker logs -f station-data-portal-frontend

down:
	@PCEX_TAG=$(tag) PCEX_PORT=$(port) docker compose -f docker/docker-compose.yaml down
