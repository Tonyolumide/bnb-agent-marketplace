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
});
