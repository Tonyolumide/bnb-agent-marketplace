import type { Agent } from "./agent";

export type ScoreComponents = {
  risk: number;
  performance: number;
  reliability: number;
  protocolQuality: number;
  liquidity: number;
  permission: number;
};

export type Recommendation = {
  agent: Agent;
  score: number;
  components: ScoreComponents;
  reasons: string[];
  tradeoffs: string[];
  rejectedBy?: string[];
};

