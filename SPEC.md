# BNB Financial Agent Marketplace - Engineering Spec

## Product thesis

Build the decision and trust layer for financial agents on BNB Chain. A user states a financial objective, the marketplace discovers operational agents, verifies observable behavior, ranks agents against the user's constraints, optionally simulates a strategy, hires an agent with scoped permissions, observes a real onchain action, and allows revocation.

## Reference demo

1. Connect wallet.
2. Enter: `I have 5,000 USDT. Find low-risk yield. Max drawdown 5%. No unaudited protocols.`
3. Discover live BSC agents.
4. Remove unreachable or unverifiable candidates.
5. Rank at least three agents using user-specific suitability.
6. Compare verified evidence, risk, protocol exposure, fees, and required permissions.
7. Simulate the reference yield agent.
8. Hire the agent through ERC-8183.
9. Grant a scoped Altana session with approved contracts, spend cap, and expiry.
10. Execute at least one real BSC testnet DeFi transaction.
11. Show job and transaction state in the dashboard.
12. Revoke the session.
13. Verify revocation.

## Mandatory category coverage

All four categories are first-class in discovery and comparison:

- Yield optimization: full end-to-end implementation.
- LP rebalancing: discovery, evidence, category metrics, comparison.
- Grid trading: discovery, evidence, category metrics, comparison.
- Health-factor monitoring: discovery, evidence, category metrics, comparison.

## MVP feature cut

### Must work

- Wallet connection.
- ERC-8004 agent discovery on BSC.
- Normalized local agent records.
- Endpoint liveness checks.
- Category-aware observed metrics.
- Natural-language intent to structured constraints.
- Deterministic hard filters.
- Deterministic Suitability Score with score components.
- Comparison UI.
- One reference yield agent owned by us.
- ERC-8183 job lifecycle.
- Altana scoped permission/session.
- Spend cap, allowlist, expiry, and revoke.
- At least one real BSC testnet DeFi transaction.
- Dashboard with transaction hash and job status.

### Differentiators

- Claimed vs observed vs verified evidence labels.
- Personalized suitability rather than generic reputation ranking.
- Historical simulation for reference yield strategy.
- Permission-risk analysis before hire.

### Explicitly out of scope

- Cross-chain support.
- Custom reputation protocol.
- Tokenomics or DAO.
- Universal arbitrary-agent backtesting.
- Mobile app.
- Full autonomous portfolio management.
- Own chain-wide ERC-8004 crawler.
- Dozens of DeFi integrations.

## Reference strategy

`YieldPilot` operates on a deliberately small allowlisted universe. Start with one protocol integration and add a second only after the complete job/session/execute/revoke path works.

Policy:

- stablecoin only for MVP;
- no leverage;
- no arbitrary transfers;
- approved protocols only;
- never exceed session caps;
- do not rebalance unless expected benefit clears switching cost and safety threshold.

## Definition of done

The product is demo-ready when a fresh user can complete the full reference demo without backend intervention, and every onchain claim in the UI can be verified by a transaction, contract state, or explicit evidence source.

