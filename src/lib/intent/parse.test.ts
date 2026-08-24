import { describe, expect, it } from "vitest";
import { parseFinancialIntent } from "./parse";

describe("parseFinancialIntent", () => {
  it("extracts the reference-demo constraints deterministically", () => {
    expect(parseFinancialIntent("I have 5,000 USDT. Find low-risk yield. Max drawdown 5%. No unaudited protocols.")).toMatchObject({
      category: "yield", capital: 5000, asset: "USDT", maxDrawdown: 0.05, riskTolerance: "low", prohibitedProtocols: ["unaudited"],
    });
  });

  it("does not erase parsed values with undefined request fields", () => {
    expect(parseFinancialIntent("5,000 USDT yield", { capital: undefined, asset: undefined })).toMatchObject({ capital: 5000, asset: "USDT" });
  });

  it.each([
    ["monitor my liquidation health factor", "health_factor"],
    ["rebalance my LP range", "lp_rebalancing"],
    ["run a grid trading strategy", "grid_trading"],
  ] as const)("maps %s to %s", (objective, category) => {
    expect(parseFinancialIntent(objective).category).toBe(category);
  });
});
