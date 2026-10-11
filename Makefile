.PHONY: all install dev build lint test docker-up docker-down db-migrate db-deploy db-seed db-studio clean

all: dev

install:
	bun install

dev:
	bun dev

build:
	bun run build

lint:
	bun run lint

test:
	bun run test

docker-up:
	docker compose up -d postgres

docker-down:
	docker compose down

db-migrate:
	cd apps/api && bunx prisma migrate dev

db-deploy:
	cd apps/api && bunx prisma migrate deploy

db-seed:
	cd apps/api && bunx prisma db seed

db-studio:
	cd apps/api && bunx prisma studio

clean:
	rm -rf .turbo apps/web/.next apps/api/dist apps/web/tsconfig.tsbuildinfo
