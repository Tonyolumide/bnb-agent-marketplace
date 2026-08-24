import type { AgentCategory } from "@/types/agent";
import type { FinancialIntent } from "@/types/intent";

export function parseFinancialIntent(objective: string, overrides: Partial<FinancialIntent> = {}): FinancialIntent {
  const normalized = objective.toLowerCase();
  const amount = objective.match(/(?:\$|£|€)?\s*([\d,.]+)\s*(?:usdt|usdc|dai|usd|bnb)?/i);
  const drawdown = objective.match(/(?:max(?:imum)?\s+)?drawdown\s*(?:of|is|:)?\s*(\d+(?:\.\d+)?)\s*%/i);
  const asset = objective.match(/\b(USDT|USDC|DAI|BNB)\b/i)?.[1]?.toUpperCase() ?? "USDT";
  const category: AgentCategory = /health.?factor|liquidation/.test(normalized)
    ? "health_factor"
    : /liquidity.?pool|\blp\b|range.?rebalanc/.test(normalized)
      ? "lp_rebalancing"
      : /grid.?trad/.test(normalized)
        ? "grid_trading"
        : "yield";
  const prohibitedProtocols = /no unaudited/.test(normalized) ? ["unaudited"] : undefined;

  const definedOverrides = Object.fromEntries(Object.entries(overrides).filter(([, value]) => value !== undefined)) as Partial<FinancialIntent>;
  return {
    category,
    capital: amount ? Number(amount[1].replaceAll(",", "")) : 5_000,
    asset,
    maxDrawdown: drawdown ? Number(drawdown[1]) / 100 : undefined,
    riskTolerance: /high.?risk/.test(normalized) ? "high" : /medium|moderate/.test(normalized) ? "medium" : "low",
    prohibitedProtocols,
    ...definedOverrides,
  };
}
