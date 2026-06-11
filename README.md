# JobHub — Job Worker

A NestJS message-driven microservice that consumes job enrichment requests from RabbitMQ, fetches detailed job data from external APIs (LinkedIn via RapidAPI), and pushes the enriched data back to the Job Hub service.

---

## Architecture

### Overview

```
RabbitMQ (exchange: jobs, key: job.enrich)
  ↓
JobEnrichmentsConsumer          [receives message]
  ↓
JobEnrichmentsConsumerService   [orchestrates the flow]
  ↓
EnrichmentUseCaseFactory        [selects strategy by platform]
  ↓
LinkedinUseCase                 [platform-specific use case]
  ↓
LinkedinProcessor               [calls RapidAPI w/ retry logic]
  ↓
linkedin.mapper                 [transforms response → JobDataProcessed]
  ↓
JobsApiClient                   [PATCH JOB_HUB_SERVICE_URL/jobs/:id/metadata]
```

### Layer Structure

```
src/
├── domain/           # Business contracts (interfaces, types)
├── infrastructure/   # External integrations (HTTP client, RabbitMQ)
├── modules/          # Feature logic (consumer, use cases, factory, processor)
└── shared/           # Cross-cutting concerns (enums)
```

### Key Components

| Component | File | Role |
|---|---|---|
| Message consumer | `modules/JobEnrichmentsConsumer/controller/` | Subscribes to RabbitMQ, delegates to service |
| Orchestrator | `modules/JobEnrichmentsConsumer/services/` | Gets the right use case, calls API client |
| Factory | `modules/JobEnrichmentsConsumer/factories/` | Maps platform string → use case instance |
| LinkedIn use case | `modules/JobEnrichmentsConsumer/use-cases/` | Delegates to processor via DI token |
| LinkedIn processor | `modules/JobEnrichmentsConsumer/repository/` | Parses job URL, calls RapidAPI, retries on 429 |
| Mapper | `modules/JobEnrichmentsConsumer/mappers/` | Transforms LinkedIn response → domain model |
| HTTP client | `infrastructure/http/` | PATCHes enriched data to Job Hub |
| RabbitMQ config | `infrastructure/messaging/` | Configures connection + `jobs` exchange |
| Domain contracts | `domain/port/` | Interfaces for processor and use case |

### Design Patterns

- **Port/Adapter** — `IJobEnrichmentProcessor` and `IEnrichmentUseCase` are ports; `LinkedinProcessor` and `LinkedinUseCase` are adapters
- **Factory** — `EnrichmentUseCaseFactory` selects the right strategy per platform (extensible for Indeed, company boards, etc.)
- **Strategy** — each platform gets its own use case + processor pair, swappable without touching the orchestrator
- **Retry with backoff** — `LinkedinProcessor` retries up to 3x on rate-limit (429) with exponential backoff (5s → 10s → 20s)

### External Dependencies

| Service | Purpose |
|---|---|
| RabbitMQ | Receives `job.enrich` messages (exchange: `jobs`, key: `job.enrich`) |
| RapidAPI (LinkedIn Jobs API) | Fetches job details by ID |
| Job Hub (`JOB_HUB_SERVICE_URL`) | Receives enriched data via `PATCH /jobs/:id/metadata` |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default: 3000) | HTTP server port |
| `RABBITMQ_URL` | No (default: `amqp://guest:guest@localhost:5672`) | RabbitMQ connection URI |
| `JOB_HUB_SERVICE_URL` | Yes | Base URL of the Job Hub service |
| `RAPIDAPI_KEY` | Yes | API key for RapidAPI LinkedIn endpoint |
| `RAPIDAPI_URL` | Yes | RapidAPI LinkedIn endpoint URL |

---

## Setup

```bash
npm install
```

## Running

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run start:prod
```

## Docker

```bash
docker compose up
```

## Tests

```bash
# unit tests
npm run test

# test coverage
npm run test:cov

# e2e tests
npm run test:e2e
```
