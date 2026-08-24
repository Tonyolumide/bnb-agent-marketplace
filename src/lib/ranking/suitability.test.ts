import { describe, expect, it } from "vitest";
import type { Agent, AgentObservation } from "@/types/agent";
import type { FinancialIntent } from "@/types/intent";
import { rankYieldAgent } from "./suitability";

const agent: Agent = {
  id: "yield-1", chainId: 97, tokenId: "1", name: "Yield One", description: "Yield agent",
  ownerAddress: "0x1111111111111111111111111111111111111111", agentWallet: null,
  category: "yield", services: [], skills: [], protocols: ["Venus"], activeClaimed: true,
  x402Support: false, createdAt: "2026-01-01T00:00:00.000Z", indexedAt: "2026-01-01T00:00:00.000Z",
};
const observation: AgentObservation = {
  agentId: agent.id, endpointReachable: true, endpointLatencyMs: 50, lastSuccessfulProbe: "2026-01-01T00:00:00.000Z",
  recentTxCount: 10, recentJobCount: 10, successfulJobCount: 9, failedJobCount: 1,
  observedProtocols: ["Venus"], observedAssets: ["USDT"], lastOnchainActivity: null,
  calculatedAt: "2026-01-01T00:00:00.000Z",
};
const intent: FinancialIntent = { category: "yield", capital: 5000, asset: "USDT", riskTolerance: "low", maxDrawdown: 0.05, targetReturn: 0.1 };

describe("suitability hard constraints", () => {
  it("rejects unreachable agents, excessive drawdown, and prohibited protocols", () => {
    const result = rankYieldAgent(agent, { ...intent, prohibitedProtocols: ["venus"] }, {
      observation: { ...observation, endpointReachable: false }, realizedApy: 0.08,
      maxDrawdown: 0.06, protocolQuality: 80, liquidityHours: 2, permissionRisk: 10,
    });
    expect(result.score).toBe(0);
    expect(result.rejectedBy).toEqual([
      "Agent endpoint is unreachable",
      "Observed drawdown exceeds the user's maximum",
      "Agent uses a prohibited protocol",
    ]);
  });
});

describe("suitability score calculation", () => {
  it("calculates and exposes deterministic weighted components", () => {
    const result = rankYieldAgent(agent, intent, {
      observation, realizedApy: 0.08, maxDrawdown: 0.025,
      protocolQuality: 80, liquidityHours: 2, permissionRisk: 10,
    });
    expect(result.components).toEqual({ risk: 50, performance: 80, reliability: 90, protocolQuality: 80, liquidity: 92, permission: 90 });
    expect(result.score).toBe(77);
    expect(result.rejectedBy).toBeUndefined();
  });
});
