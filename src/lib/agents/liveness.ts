import type { Agent, AgentObservation } from "@/types/agent";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type Resolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;
const resolveAll: Resolver = (hostname) => lookup(hostname, { all: true });

function isPrivateAddress(address: string) {
  if (address === "::1" || address.startsWith("::ffff:") || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  if (!isIP(address)) return true;
  const parts = address.split(".").map(Number);
  return isIP(address) === 4 && (parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168));
}

export async function isSafeProbeUrl(value: string, resolver: Resolver = resolveAll) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hostname === "localhost") return false;
    const addresses = await resolver(url.hostname);
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch { return false; }
}

export async function probeEndpoint(
  value: string,
  fetcher: typeof fetch = fetch,
  resolver: Resolver = resolveAll,
  maxRedirects = 3,
) {
  let current = value;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    if (!(await isSafeProbeUrl(current, resolver))) return false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    try {
      const response = await fetcher(current, { method: "HEAD", redirect: "manual", signal: controller.signal });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || redirectCount === maxRedirects) return false;
        current = new URL(location, current).toString();
        continue;
      }
      return response.status > 0 && response.status < 500 && response.status !== 404;
    } catch { return false; }
    finally { clearTimeout(timeout); }
  }
  return false;
}

export async function observeAgent(agent: Agent, fetcher: typeof fetch = fetch): Promise<AgentObservation> {
  const started = Date.now();
  let reachable = false;
  let lastSuccessfulProbe: string | null = null;

  for (const service of agent.services.slice(0, 2)) {
    if (await probeEndpoint(service.url, fetcher)) {
      reachable = true;
      lastSuccessfulProbe = new Date().toISOString();
      break;
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
