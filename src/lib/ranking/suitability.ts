import type { Agent, AgentObservation } from "@/types/agent";
import type { FinancialIntent } from "@/types/intent";
import type { Recommendation, ScoreComponents } from "@/types/recommendation";

export type Evidence = {
  observation: AgentObservation;
  realizedApy?: number;
  maxDrawdown?: number;
  liquidityHours?: number;
  protocolQuality?: number;
  permissionRisk?: number;
};

const weights = {
  risk: 0.25,
  performance: 0.2,
  reliability: 0.2,
  protocolQuality: 0.15,
  liquidity: 0.1,
  permission: 0.1,
} as const;

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function rankYieldAgent(
  agent: Agent,
  intent: FinancialIntent,
  evidence: Evidence,
): Recommendation {
  const rejectedBy: string[] = [];
  const { observation } = evidence;

  if (!observation.endpointReachable) rejectedBy.push("Agent endpoint is unreachable");
  if (
    intent.maxDrawdown !== undefined &&
    evidence.maxDrawdown !== undefined &&
    evidence.maxDrawdown > intent.maxDrawdown
  ) {
    rejectedBy.push("Observed drawdown exceeds the user's maximum");
  }
  if (
    intent.prohibitedProtocols?.some((p) =>
      observation.observedProtocols.map((x) => x.toLowerCase()).includes(p.toLowerCase()),
    )
  ) {
    rejectedBy.push("Agent uses a prohibited protocol");
  }

  const reliabilityDenominator = observation.successfulJobCount + observation.failedJobCount;
  const reliability = reliabilityDenominator
    ? (observation.successfulJobCount / reliabilityDenominator) * 100
    : 50;

  const risk = evidence.maxDrawdown === undefined
    ? 50
    : intent.maxDrawdown === undefined
      ? clamp(100 - evidence.maxDrawdown * 500)
      : clamp(100 * (1 - evidence.maxDrawdown / Math.max(intent.maxDrawdown, 0.0001)));

  const performance = evidence.realizedApy === undefined
    ? 50
    : intent.targetReturn === undefined
      ? clamp(evidence.realizedApy * 800)
      : clamp((evidence.realizedApy / Math.max(intent.targetReturn, 0.0001)) * 100);

  const components: ScoreComponents = {
    risk,
    performance,
    reliability: clamp(reliability),
    protocolQuality: clamp(evidence.protocolQuality ?? 50),
    liquidity: clamp(evidence.liquidityHours === undefined ? 50 : 100 - evidence.liquidityHours * 4),
    permission: clamp(100 - (evidence.permissionRisk ?? 50)),
  };

  const score = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + components[key as keyof ScoreComponents] * weight;
  }, 0);

  const reasons = [
    observation.endpointReachable ? "Endpoint is currently reachable" : "Endpoint is not reachable",
    `Execution reliability score: ${components.reliability.toFixed(0)}/100`,
    `Protocol-quality score: ${components.protocolQuality.toFixed(0)}/100`,
  ];

  const tradeoffs = evidence.realizedApy === undefined
    ? ["Insufficient verified return history"]
    : [];

  return {
    agent,
    score: rejectedBy.length ? 0 : Math.round(score),
    components,
    reasons,
    tradeoffs,
    rejectedBy: rejectedBy.length ? rejectedBy : undefined,
  };
}

