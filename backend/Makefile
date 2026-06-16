.PHONY: help install install-go dev dev-go stop dev-foreground

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies for all Node.js services"
	@echo "  make install-go   - Install dependencies for all Go services"
	@echo "  make dev          - Start all Node.js services in background"
	@echo "  make dev-go       - Start all Go services in background"
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
	@echo "All Node.js dependencies installed successfully!"

install-go:
	@echo "Installing dependencies for go divide-service..."
	@cd go/divide-service && go mod tidy
	@echo "Installing dependencies for go multiply-service..."
	@cd go/multiply-service && go mod tidy
	@echo "Installing dependencies for go subtract-service..."
	@cd go/subtract-service && go mod tidy
	@echo "Installing dependencies for go sum-service..."
	@cd go/sum-service && go mod tidy
	@echo "All Go dependencies installed successfully!"

dev:
	@echo "Starting all Node.js services in background..."
	@mkdir -p logs
	@cd node/api && nohup pnpm dev > ../../logs/api.log 2>&1 &
	@cd node/divide-service && nohup pnpm dev > ../../logs/divide-service.log 2>&1 &
	@cd node/multiply-service && nohup pnpm dev > ../../logs/multiply-service.log 2>&1 &
	@cd node/processor && nohup pnpm dev > ../../logs/processor.log 2>&1 &
	@cd node/randomizer && nohup pnpm dev > ../../logs/randomizer.log 2>&1 &
	@cd node/subtract-service && nohup pnpm dev > ../../logs/subtract-service.log 2>&1 &
	@cd node/sum-service && nohup pnpm dev > ../../logs/sum-service.log 2>&1 &
	@cd node/realtime-service && nohup pnpm dev > ../../logs/realtime-service.log 2>&1 &
	@echo "All Node.js services started in background!"
	@echo "Check logs with: tail -f backend/logs/<service>.log"
	@echo "Stop services with: pkill -f 'tsx'"

dev-go:
	@echo "Starting all Go services in background..."
	@mkdir -p logs
	@cd go/divide-service && nohup go run . > ../../logs/go-divide-service.log 2>&1 &
	@cd go/multiply-service && nohup go run . > ../../logs/go-multiply-service.log 2>&1 &
	@cd go/subtract-service && nohup go run . > ../../logs/go-subtract-service.log 2>&1 &
	@cd go/sum-service && nohup go run . > ../../logs/go-sum-service.log 2>&1 &
	@echo "All Go services started in background!"
	@echo "Check logs with: tail -f backend/logs/<service>.log"
	@echo "Stop services with: pkill -f 'go run'"

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
	@echo "  cd backend/go/divide-service && go run ."
	@echo "  cd backend/go/multiply-service && go run ."
	@echo "  cd backend/go/subtract-service && go run ."
	@echo "  cd backend/go/sum-service && go run ."

stop:
	@echo "Stopping all services..."
	@pkill -f 'tsx'
	@pkill -f 'go run'
	@echo "All services stopped!"
