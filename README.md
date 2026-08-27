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

For local PostgreSQL with Docker Desktop running:

```bash
docker compose up -d
npm run db:migrate
```

8004scan anonymous access is supported. Set `SCAN8004_API_KEY` for a higher rate limit. Discovery uses `BNB_CHAIN_ID` (default `97`), refreshes on a five-minute cache, enriches financially relevant records with detailed metadata, and manually validates every redirect hop before an endpoint probe can continue.

## ERC-8183 create and fund

Commerce defaults to `AGENT_COMMERCE_ADAPTER=mock`. To select the real adapter, use `AGENT_COMMERCE_ADAPTER=erc8183`, `BNB_CHAIN_ID=97`, a testnet wallet configuration, and a strong `JOB_API_KEY`. Real-mode calls to `/api/jobs` must send that key in `x-job-api-key`.

Set `RPC_URL=https://bsc-testnet-dataseed.bnbchain.org` (or another trusted BSC testnet RPC). Job expiry must exceed the active policy dispute window; allow at least 48 hours for test jobs.

- `POST /api/jobs` creates an ERC-8183 job and persists its chain job ID and create transaction hash.
- `PATCH /api/jobs` accepts `{ "localJobId": "...", "budget": "..." }`, reconciles policy registration and budget setup, funds with an exact allowance, and persists every transaction hash.
- Budget strings are payment-token raw units, not decimal display amounts.
- Settlement, Altana permissions, and DeFi execution remain intentionally unimplemented.

With the app running and `SMOKE_PROVIDER_ADDRESS` configured, `npm run smoke:erc8183` first checks the live router policy whitelist. It sends no transaction while the policy is disabled; once enabled, it exercises create and fund and writes non-secret evidence to the ignored `.erc8183-smoke.json` file.

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
