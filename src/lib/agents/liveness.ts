import type { Agent, AgentObservation } from "@/types/agent";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateAddress(address: string) {
  if (address === "::1" || address.startsWith("::ffff:") || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  if (!isIP(address)) return true;
  const parts = address.split(".").map(Number);
  return isIP(address) === 4 && (parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168));
}

export async function isSafeProbeUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hostname === "localhost") return false;
    const addresses = await lookup(url.hostname, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch { return false; }
}

export async function observeAgent(agent: Agent, fetcher: typeof fetch = fetch): Promise<AgentObservation> {
  const started = Date.now();
  let reachable = false;
  let lastSuccessfulProbe: string | null = null;

  for (const service of agent.services.slice(0, 2)) {
    if (!(await isSafeProbeUrl(service.url))) continue;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    try {
      const response = await fetcher(service.url, { method: "HEAD", redirect: "follow", signal: controller.signal });
      if (response.status > 0 && response.status < 500 && response.status !== 404) {
        reachable = true;
        lastSuccessfulProbe = new Date().toISOString();
        break;
      }
    } catch {
      // A failed endpoint is observation data, not a discovery failure.
    } finally {
      clearTimeout(timeout);
    }
  }

  const calculatedAt = new Date().toISOString();
  return {
    agentId: agent.id,
    endpointReachable: reachable,
    endpointLatencyMs: agent.services.length ? Date.now() - started : null,
    lastSuccessfulProbe,
    recentTxCount: 0,
    recentJobCount: 0,
    successfulJobCount: 0,
    failedJobCount: 0,
    observedProtocols: [],
    observedAssets: [],
    lastOnchainActivity: null,
    calculatedAt,
  };
}
