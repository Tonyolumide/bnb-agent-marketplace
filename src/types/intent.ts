import type { AgentCategory } from "./agent";

export type RiskTolerance = "low" | "medium" | "high";

export type FinancialIntent = {
  category: AgentCategory;
  capital: number;
  asset: string;
  targetReturn?: number;
  maxDrawdown?: number;
  liquidityRequirement?: "instant" | "same_day" | "flexible";
  riskTolerance: RiskTolerance;
  approvedProtocols?: string[];
  prohibitedProtocols?: string[];
  maxPermissionAmount?: number;
};

