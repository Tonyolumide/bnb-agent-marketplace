import { encodeFunctionData, getAddress, type Address } from "viem";

const DEFAULT_ROUTER = "0xd7d36d66d2f1b608a0f943f722d27e3744f66f25";
const DEFAULT_POLICY = "0x4f4678d4439fec812ac7674bb3efb4c8f5fb78a6";

const policyWhitelistAbi = [{
  type: "function",
  name: "policyWhitelist",
  stateMutability: "view",
  inputs: [{ name: "policy", type: "address" }],
  outputs: [{ name: "", type: "bool" }],
}] as const;

type RpcEnvelope = { result?: string; error?: { code?: number; message?: string } };

export async function isPolicyWhitelisted(options: {
  rpcUrl: string;
  routerAddress?: string;
  policyAddress?: string;
  fetcher?: typeof fetch;
}) {
  const fetcher = options.fetcher ?? fetch;
  const router = getAddress(options.routerAddress ?? DEFAULT_ROUTER);
  const policy = getAddress(options.policyAddress ?? DEFAULT_POLICY);
  const data = encodeFunctionData({ abi: policyWhitelistAbi, functionName: "policyWhitelist", args: [policy] });
  const response = await fetcher(options.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: router, data }, "latest"] }),
  });
  if (!response.ok) throw new Error(`Policy preflight RPC failed (${response.status})`);
  const payload = await response.json() as RpcEnvelope;
  if (payload.error) throw new Error(`Policy preflight RPC error: ${payload.error.message ?? payload.error.code ?? "unknown"}`);
  if (!/^0x[0-9a-fA-F]{64}$/.test(payload.result ?? "")) throw new Error("Policy preflight returned an invalid result");
  return BigInt(payload.result as `0x${string}`) === 1n;
}

export function policyAddresses(env: Record<string, string | undefined> = process.env): { router: Address; policy: Address } {
  return {
    router: getAddress(env.ERC8183_ROUTER_ADDRESS ?? DEFAULT_ROUTER),
    policy: getAddress(env.ERC8183_POLICY_ADDRESS ?? DEFAULT_POLICY),
  };
}
