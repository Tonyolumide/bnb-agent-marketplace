# BNB Financial Agent Marketplace

Hackathon starter repo for a BNB Chain financial-agent discovery, evidence, suitability, simulation, and scoped-execution marketplace.

## Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app works without credentials using an in-memory cache. To persist normalized agents and liveness observations, start Postgres, set `DATABASE_URL`, then run:

```bash
npm run db:migrate
```

8004scan anonymous access is supported. Set `SCAN8004_API_KEY` for a higher rate limit. Discovery is restricted to BSC testnet (`chainId=97`), refreshes on a five-minute cache, enriches financially relevant records with detailed metadata, and blocks liveness probes to private or loopback addresses.

## Verify

```bash
npm test
npm run typecheck
npm run build
```

## Read first

1. `SPEC.md`
2. `ARCHITECTURE.md`
3. `IMPLEMENTATION_PLAN.md`

The repo intentionally starts with adapters and mock data. Phase 1 replaces discovery mocks with live ERC-8004 data. Phase 2 replaces chain and permission mocks with `@bnbagent/sdk` and Altana.
