# Architecture

## System boundaries

```text
USER
  |
  v
NEXT.JS APP
  |-- intent search
  |-- marketplace
  |-- agent profile
  |-- compare
  |-- simulation
  |-- hire
  `-- dashboard
  |
  v
APPLICATION SERVICES
  |-- discovery/indexing
  |-- evidence collection
  |-- ranking
  |-- simulation
  `-- job/permission lifecycle
  |                 \
  v                  v
POSTGRES          BNB CHAIN
  |                  |-- ERC-8004
  |                  |-- ERC-8183
  |                  |-- Altana sessions
  |                  `-- DeFi protocols
  |
  `--> INTELLIGENCE LAYER
       |-- hard constraints
       |-- category metrics
       |-- suitability
       `-- explanations
```

## Architectural rule

Keep three concerns separate:

1. Discovery: what agents exist?
2. Evidence: what can we observe or verify?
3. Suitability: which agent fits this user's objective?

The UI must never present developer-declared values as verified observations.

## Integrations

### Discovery

Use 8004scan or direct ERC-8004 reads through a `DiscoveryAdapter`. Normalize `services` and legacy `endpoints` into one local schema.

### Agent commerce

Use `@bnbagent/sdk` for ERC-8183. Keep SDK calls inside `src/lib/chain/bnb-agent.ts` so application code depends on an internal interface rather than SDK details.

### Scoped authority

Use Altana sessions through `src/lib/chain/permissions.ts`. The application should reason about an internal `PermissionGrant` model: allowed contracts/functions, per-transaction cap, total cap, expiry, and status.

### Execution

Implement one `YieldExecutionAdapter` first. The adapter accepts an approved action and returns a transaction hash. Do not embed private keys or protocol-specific calldata construction in UI code.

## Runtime

Single TypeScript runtime for MVP:

- Next.js App Router
- Node.js runtime for server-only chain and DB operations
- Route handlers for application APIs
- client components only where wallet interaction or browser state is required

## Data model

Core tables:

- agents
- agent_services
- agent_protocols
- agent_observations
- agent_metrics
- financial_intents
- recommendations
- recommendation_scores
- simulations
- jobs
- job_transactions
- permissions
- permission_contracts

Scores must persist components, not only the total score.

## Security rules

- Never expose provider/agent private keys to the browser.
- Never accept arbitrary contract calls from natural-language output.
- Intent parsing returns constraints, never calldata.
- Contract addresses and allowed functions are application-controlled allowlists.
- Simulate or preflight all execution where SDK support exists.
- Verify chain ID before signing.
- Cap testnet funds and use mainnet only after testnet path is proven.

