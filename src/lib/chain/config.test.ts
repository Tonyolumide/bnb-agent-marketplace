import { describe, expect, it } from "vitest";
import { getBnbChainId, getBnbNetwork } from "./config";

describe("BNB chain configuration", () => {
  it("defaults to BSC testnet and accepts configured BNB chain IDs", () => {
    expect(getBnbChainId({})).toBe(97);
    expect(getBnbNetwork({ BNB_CHAIN_ID: "56" })).toBe("bsc-mainnet");
  });

  it("fails closed for malformed or unsupported values", () => {
    expect(() => getBnbChainId({ BNB_CHAIN_ID: "97x" })).toThrow();
    expect(() => getBnbNetwork({ BNB_CHAIN_ID: "1" })).toThrow(/not supported/);
  });
});
