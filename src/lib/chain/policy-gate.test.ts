import { describe, expect, it, vi } from "vitest";
import { isPolicyWhitelisted, policyAddresses } from "./policy-gate";

const word = (value: number) => `0x${value.toString(16).padStart(64, "0")}`;

describe("ERC-8183 policy preflight", () => {
  it("accepts a whitelisted policy", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ result: word(1) }))) as unknown as typeof fetch;
    await expect(isPolicyWhitelisted({ rpcUrl: "https://rpc.example", fetcher })).resolves.toBe(true);
  });

  it("refuses an unwhitelisted policy without broadcasting", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ result: word(0) }))) as unknown as typeof fetch;
    await expect(isPolicyWhitelisted({ rpcUrl: "https://rpc.example", fetcher })).resolves.toBe(false);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("honors contract address overrides", () => {
    expect(policyAddresses({
      ERC8183_ROUTER_ADDRESS: "0x1111111111111111111111111111111111111111",
      ERC8183_POLICY_ADDRESS: "0x2222222222222222222222222222222222222222",
    })).toEqual({
      router: "0x1111111111111111111111111111111111111111",
      policy: "0x2222222222222222222222222222222222222222",
    });
  });
});
