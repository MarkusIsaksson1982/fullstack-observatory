.PHONY: up down restart logs build shell prod health

up:
	docker compose up -d

down:
	docker compose down -v

restart:
	docker compose restart

logs:
	docker compose logs -f

build:
	docker compose build

shell:
	docker compose exec web sh

prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

health:
	@curl -sf http://localhost:3000/health && echo "OK" || echo "UNHEALTHY"
