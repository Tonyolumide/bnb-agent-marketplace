# Implementation Plan

## Phase 1 - foundation

- [ ] Initialize dependencies and run the starter app.
- [ ] Add wallet provider and BSC testnet chain configuration.
- [ ] Replace `MockDiscoveryAdapter` with an 8004scan adapter.
- [ ] Normalize ERC-8004 `services` and legacy `endpoints`.
- [ ] Persist agents to Postgres.
- [ ] Add endpoint liveness probes and observed-state persistence.
- [ ] Replace recommendation demo page with live `/api/recommend` results.
- [ ] Add filters for all four mandatory categories.

Exit condition: live BSC agents appear in the UI and at least one user intent produces a deterministic ranked result.

## Phase 2 - real execution path

- [ ] Register/reference YieldPilot on ERC-8004.
- [ ] Implement `AgentCommerceAdapter` with `@bnbagent/sdk` ERC-8183 client.
- [ ] Implement Altana `PermissionAdapter`.
- [ ] Define an allowlisted protocol contract and function set.
- [ ] Create job -> fund -> provider detects job -> execute approved DeFi action -> submit result -> settle.
- [ ] Persist transaction hashes and job transitions.
- [ ] Build dashboard status view.
- [ ] Build revoke flow and verify revoked session cannot execute.

Exit condition: the complete job/session/execute/revoke flow succeeds on BSC testnet from the web app.

## Phase 3 - intelligence

- [ ] Category-specific evidence metrics.
- [ ] Intent parser with structured JSON output.
- [ ] Hard-constraint engine.
- [ ] Suitability scoring by category.
- [ ] Deterministic explanations.
- [ ] Comparison UI.

## Phase 4 - simulation

- [ ] Historical protocol-rate source.
- [ ] Strategy replay for YieldPilot.
- [ ] Return, drawdown, gas, and allocation outputs.
- [ ] Explicit labels for observed vs simulated vs projected data.

## Codex first prompt

Read `SPEC.md`, `ARCHITECTURE.md`, and `IMPLEMENTATION_PLAN.md` before editing. Preserve the adapter boundaries. Implement Phase 1 only. Do not introduce new infrastructure unless required. Make the app compile and run after each change. Use BSC testnet. Replace mocked discovery with real ERC-8004/8004scan data, persist normalized agents, add liveness observations, and wire the recommendation page to deterministic ranking. Do not start ERC-8183 execution until Phase 1 exit conditions pass.

