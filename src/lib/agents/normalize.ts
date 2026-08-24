import type { Agent, AgentCategory, AgentService } from "@/types/agent";
import { getBnbChainId } from "../chain/config";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function address(value: unknown): `0x${string}` | null {
  const valueText = text(value);
  return valueText && /^0x[a-fA-F0-9]{40}$/.test(valueText) ? valueText as `0x${string}` : null;
}

export function inferCategory(source: unknown): AgentCategory | null {
  const haystack = JSON.stringify(source).toLowerCase();
  if (/health.?factor|liquidation|lending.?risk/.test(haystack)) return "health_factor";
  if (/liquidity.?pool|lp.?rebalanc|range.?rebalanc|concentrated.?liquidity/.test(haystack)) return "lp_rebalancing";
  if (/grid.?trad|grid.?bot/.test(haystack)) return "grid_trading";
  if (/yield|apy|stablecoin|lending|vault/.test(haystack)) return "yield";
  return null;
}

export function normalizeServices(source: unknown): AgentService[] {
  const root = record(source);
  const rawMetadata = record(root.raw_metadata ?? root.rawMetadata);
  const offchain = record(rawMetadata.offchain_content ?? rawMetadata.offchainContent);
  const candidates = [root.services, offchain.services, root.endpoints, offchain.endpoints]
    .filter(Array.isArray)
    .flat() as unknown[];

  const seen = new Set<string>();
  return candidates.flatMap((candidate, index) => {
    if (typeof candidate === "string") {
      if (!/^https?:\/\//i.test(candidate) || seen.has(candidate)) return [];
      seen.add(candidate);
      return [{ name: `service-${index + 1}`, url: candidate }];
    }
    const item = record(candidate);
    const url = text(item.endpoint ?? item.url ?? item.uri);
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) return [];
    seen.add(url);
    return [{ name: text(item.name ?? item.type) ?? `service-${index + 1}`, url }];
  });
}

export function normalize8004Agent(source: unknown, indexedAt = new Date().toISOString(), expectedChainId = getBnbChainId()): Agent | null {
  const root = record(source);
  const chainId = Number(root.chain_id ?? root.chainId);
  const tokenId = text(root.token_id ?? root.tokenId);
  const ownerAddress = address(root.owner_address ?? root.ownerAddress);
  const category = inferCategory(root);
  if (chainId !== expectedChainId || !tokenId || !ownerAddress || !category) return null;

  const rawMetadata = record(root.raw_metadata ?? root.rawMetadata);
  const offchain = record(rawMetadata.offchain_content ?? rawMetadata.offchainContent);
  const protocolsValue = root.protocols ?? offchain.protocols;
  const protocols = Array.isArray(protocolsValue) ? protocolsValue.filter((item): item is string => typeof item === "string") : [];
  const capabilities = offchain.capabilities ?? root.capabilities ?? root.tags;
  const id = text(root.id) ?? `${chainId}:${tokenId}`;

  return {
    id,
    chainId,
    tokenId,
    name: text(root.name ?? offchain.name) ?? `Agent #${tokenId}`,
    description: text(root.description ?? offchain.description) ?? null,
    ownerAddress,
    agentWallet: address(root.agent_wallet ?? root.agentWallet ?? offchain.agentWallet),
    category,
    services: normalizeServices(root),
    skills: Array.isArray(capabilities) ? capabilities.filter((item): item is string => typeof item === "string") : [],
    protocols,
    activeClaimed: typeof (root.is_active ?? root.active ?? offchain.active) === "boolean" ? Boolean(root.is_active ?? root.active ?? offchain.active) : null,
    x402Support: Boolean(root.x402_supported ?? root.x402Support ?? offchain.x402Support),
    createdAt: text(root.created_at ?? root.createdAt) ?? indexedAt,
    indexedAt,
  };
}
