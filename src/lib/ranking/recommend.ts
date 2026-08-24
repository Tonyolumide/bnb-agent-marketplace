import type { Agent, AgentObservation } from "@/types/agent";
import type { FinancialIntent } from "@/types/intent";
import type { Recommendation } from "@/types/recommendation";
import { rankYieldAgent } from "./suitability";

const unavailableObservation = (agentId: string): AgentObservation => ({
  agentId, endpointReachable: false, endpointLatencyMs: null, lastSuccessfulProbe: null,
  recentTxCount: 0, recentJobCount: 0, successfulJobCount: 0, failedJobCount: 0,
  observedProtocols: [], observedAssets: [], lastOnchainActivity: null,
  calculatedAt: new Date().toISOString(),
});

export function recommendAgents(agents: Agent[], intent: FinancialIntent, observations: Record<string, AgentObservation>): Recommendation[] {
  return agents
    .filter((agent) => agent.category === intent.category)
    .map((agent) => {
      const observation = observations[agent.id] ?? unavailableObservation(agent.id);
      const recommendation = rankYieldAgent(agent, intent, {
        observation,
        protocolQuality: agent.protocols.length ? 65 : 40,
        permissionRisk: agent.agentWallet ? 45 : 60,
      });
      return {
        ...recommendation,
        reasons: [
          ...recommendation.reasons,
          "Category inferred from published ERC-8004 metadata",
        ],
        tradeoffs: [
          ...recommendation.tradeoffs,
          "Performance history is not yet independently verified",
        ],
      };
    })
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name));
}
