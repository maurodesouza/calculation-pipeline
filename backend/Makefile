.PHONY: help install dev stop dev-foreground

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies for all services"
	@echo "  make dev          - Start all services in background"
	@echo "  make dev-foreground - Start all services in foreground (requires multiple terminals)"
	@echo "  make stop         - Stop all background services"

install:
	@echo "Installing dependencies for api..."
	@cd node/api && pnpm install
	@echo "Installing dependencies for divide-service..."
	@cd node/divide-service && pnpm install
	@echo "Installing dependencies for multiply-service..."
	@cd node/multiply-service && pnpm install
	@echo "Installing dependencies for processor..."
	@cd node/processor && pnpm install
	@echo "Installing dependencies for randomizer..."
	@cd node/randomizer && pnpm install
	@echo "Installing dependencies for subtract-service..."
	@cd node/subtract-service && pnpm install
	@echo "Installing dependencies for sum-service..."
	@cd node/sum-service && pnpm install
	@echo "Installing dependencies for realtime-service..."
	@cd node/realtime-service && pnpm install
	@echo "All dependencies installed successfully!"

dev:
	@echo "Starting all services in background..."
	@mkdir -p logs
	@cd node/api && nohup pnpm dev > ../../logs/api.log 2>&1 &
	@cd node/divide-service && nohup pnpm dev > ../../logs/divide-service.log 2>&1 &
	@cd node/multiply-service && nohup pnpm dev > ../../logs/multiply-service.log 2>&1 &
	@cd node/processor && nohup pnpm dev > ../../logs/processor.log 2>&1 &
	@cd node/randomizer && nohup pnpm dev > ../../logs/randomizer.log 2>&1 &
	@cd node/subtract-service && nohup pnpm dev > ../../logs/subtract-service.log 2>&1 &
	@cd node/sum-service && nohup pnpm dev > ../../logs/sum-service.log 2>&1 &
	@cd node/realtime-service && nohup pnpm dev > ../../logs/realtime-service.log 2>&1 &
	@echo "All services started in background!"
	@echo "Check logs with: tail -f backend/logs/<service>.log"
	@echo "Stop services with: pkill -f 'tsx'"

dev-foreground:
	@echo "To start services in foreground, run in separate terminals:"
	@echo "  cd backend/node/api && pnpm dev"
	@echo "  cd backend/node/divide-service && pnpm dev"
	@echo "  cd backend/node/multiply-service && pnpm dev"
	@echo "  cd backend/node/processor && pnpm dev"
	@echo "  cd backend/node/randomizer && pnpm dev"
	@echo "  cd backend/node/subtract-service && pnpm dev"
	@echo "  cd backend/node/sum-service && pnpm dev"
	@echo "  cd backend/node/realtime-service && pnpm dev"

stop:
	@echo "Stopping all services..."
	@pkill -f 'tsx'
	@echo "All services stopped!"
