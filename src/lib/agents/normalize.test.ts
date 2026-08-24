import { describe, expect, it } from "vitest";
import { normalize8004Agent, normalizeServices } from "./normalize";

const base = { id: "uuid", chain_id: 97, token_id: "42", owner_address: "0x1111111111111111111111111111111111111111", name: "Stable Yield Agent", description: "Low-risk stablecoin APY" };

describe("8004 normalization", () => {
  it("normalizes modern and legacy endpoints without duplicates", () => {
    expect(normalizeServices({ services: [{ name: "A2A", endpoint: "https://agent.example/a2a" }], endpoints: ["https://legacy.example/api", "https://agent.example/a2a"] })).toEqual([
      { name: "A2A", url: "https://agent.example/a2a" },
      { name: "service-2", url: "https://legacy.example/api" },
    ]);
  });

  it("keeps only financially relevant BSC agents", () => {
    expect(normalize8004Agent(base)?.category).toBe("yield");
    expect(normalize8004Agent({ ...base, chain_id: 1, description: "general assistant" })).toBeNull();
  });

  it("rejects malformed ownership and honors a configured chain", () => {
    expect(normalize8004Agent({ ...base, owner_address: "not-an-address" })).toBeNull();
    expect(normalize8004Agent({ ...base, chain_id: 56 }, undefined, 56)?.chainId).toBe(56);
  });
});
