# Calculation Pipeline

A distributed system built to explore RabbitMQ messaging patterns, with a focus on simulating and handling **duplicate and delayed (out-of-order) events** — ensuring the system remains resilient and consistent despite chaos introduced intentionally in the message flow.

## Motivation

The core idea was to build a simple pipeline that executes mathematical operations step by step. Each step is dispatched to a dedicated calculation service via RabbitMQ. The twist: **every message passes through a "randomizer" service** that may delay it, duplicate it, or send it multiple times with varying intervals — simulating real-world network instability.

The system must detect and ignore duplicate events, handle out-of-order delivery, and keep the pipeline state consistent throughout.

A secondary goal is to implement the **exact same backend in three languages** — Node.js (done), Go (planned), and Rust (planned) — to have a meaningful, real-world baseline for comparing performance, ergonomics, and ecosystem across runtimes.

## How It Works

### Run Lifecycle

1. A client creates a **Run** via the REST API, referencing a **Pipeline** (a sequence of operation steps).
2. The API publishes a `run.created` event to RabbitMQ.
3. The **Processor** picks it up and starts orchestrating each step in sequence.
4. Each step is dispatched to the appropriate **Calculation Service** (sum, subtract, multiply, divide).
5. The result is sent back to the Processor, which advances the run to the next step.
6. When all steps finish, the run is marked as completed or failed.

### The Randomizer

Every outbound message — before reaching its intended consumer — is routed through the **Randomizer** service first (via dedicated `*.randomize` exchanges). The Randomizer then re-publishes the message to the actual destination exchange with one or more of these chaos effects applied:

- **Duplication**: 70% chance of 1 copy, 20% chance of 2 copies, 10% chance of 3 copies.
- **Pre-execution delay**: 50% chance of a 500–3000ms delay before publishing.
- **Inter-message delay**: When duplicating, 40% chance of a 500–5000ms gap between copies.

This forces every consumer to be idempotent and order-aware.

### Realtime (SSE)

The **Realtime Service** subscribes to `api.events` and `processor.events` exchanges. It exposes a `/events` endpoint using **Server-Sent Events (SSE)**, broadcasting pipeline state changes to connected frontend clients in real time.

Only messages with the `realtime: true` header are forwarded to SSE clients, so internal control messages are filtered out automatically.

## Services

| Service | Description |
|---|---|
| **api** | REST API. Manages pipelines, runs, and publishes control events. Runs on port `3000`. |
| **processor** | Orchestrates run execution. Consumes run events, dispatches steps to calculation services, and tracks run state. |
| **randomizer** | Chaos middleware. Intercepts all routed messages and re-publishes them with random delays and duplications. |
| **sum-service** | Executes addition steps. |
| **subtract-service** | Executes subtraction steps. |
| **multiply-service** | Executes multiplication steps. |
| **divide-service** | Executes division steps. |
| **realtime-service** | SSE server. Forwards filtered RabbitMQ events to connected browser clients. Runs on port `3500`. |

## Message Flow

```
Client
  │
  ▼
[api] ──► api.randomize exchange
               │
               ▼
          [randomizer] ── chaos ──► api.events exchange
                                         │
                                         ├──► [processor] (run.created, pause-requested, etc.)
                                         └──► [realtime-service] (SSE broadcast)

[processor] ──► processor.randomize exchange
                        │
                        ▼
                   [randomizer] ── chaos ──► processor.events exchange
                                                    │
                                                    ├──► [api] (run.started, run.completed, run.failed)
                                                    ├──► [sum-service]
                                                    ├──► [subtract-service]
                                                    ├──► [multiply-service]
                                                    ├──► [divide-service]
                                                    └──► [realtime-service] (SSE broadcast)

[sum|subtract|multiply|divide] ──► {service}.randomize exchange
                                          │
                                          ▼
                                     [randomizer] ── chaos ──► {service}.events exchange
                                                                      │
                                                                      └──► [processor] (step.finished)
```

## Tech Stack

- **Runtime**: Node.js with TypeScript (`tsx`)
- **Message broker**: RabbitMQ (topic exchanges)
- **Database**: PostgreSQL (API only)
- **Realtime**: Server-Sent Events (SSE)
- **Frontend**: React + TanStack Router + TailwindCSS

## Running Locally

### Requirements

- Docker & Docker Compose
- Node.js 20+
- pnpm

### Infrastructure

```bash
docker compose up -d
```

This starts:
- RabbitMQ on ports `5672` (AMQP) and `15672` (Management UI)
- PostgreSQL on port `6543`

### Starting Services

All services can be started at once using the `Makefile` in the `backend/` directory:

```bash
# Install all dependencies
cd backend && make install

# Start all services in the background (logs written to backend/logs/)
cd backend && make dev

# Stop all services
cd backend && make stop
```

Alternatively, comment out any service in `backend/Makefile` to exclude it, or run a single service manually:

```bash
cd backend/node/<service-name> && pnpm dev
```

Services and their default ports:
- `api` → `http://localhost:3000`
- `realtime-service` → `http://localhost:3500/events`

### RabbitMQ Management

Access the RabbitMQ dashboard at [http://localhost:15672](http://localhost:15672) with credentials `guest / guest` to inspect exchanges, queues, and message flow in real time.

## Frontend

The frontend connects to the API and the SSE stream, rendering the pipeline canvas and reflecting state changes live as events arrive — including step executions, delays, and duplicates being silently discarded.

### Architecture

The frontend uses a **Command System architecture** for all application actions. This provides:

- **Centralized command handling**: All actions are dispatched through a single `actions` object with nested domains
- **Strong typing**: Commands are fully typed with payloads and return values
- **Observability**: Built-in transition tracking for loading states
- **Instance scoping**: Support for domain-specific instances (editors, modals, etc.)
- **Framework-agnostic**: Commands can be invoked from anywhere (React components, stores, modules)

Commands are defined in `src/lib/command/global.ts` and registered using the `command.handle()` method. Components dispatch actions via the `actions` proxy or `command.dispatch()`.

### Styling System

The project uses a **token-based, context-driven styling system** with:

- **Tailwind CSS v4** as the utility engine
- **CSS variables** as design tokens
- **Theme classes** (`.theme-dark`, `.theme-light`) for global theming
- **Context classes**:
  - `base-*` → neutral tokens for surfaces
  - `tone` → enables tone-related tokens
  - `palette-*` → injects color into tone tokens

This system allows for consistent theming and flexible component variants.

### Running the Frontend

```bash
cd frontend
pnpm dev
```

Runs at `http://localhost:5173` (Vite default).
