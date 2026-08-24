import type { Agent, AgentCategory, AgentObservation } from "@/types/agent";
import type { AgentRepository } from "./repository";
import { normalize8004Agent } from "./normalize";
import { observeAgent } from "./liveness";

type ApiEnvelope = { success?: boolean; data?: unknown; meta?: unknown };

export class Scan8004DiscoveryAdapter {
  private refreshedAt = 0;
  constructor(
    private readonly repository: AgentRepository,
    private readonly fetcher: typeof fetch = fetch,
    private readonly baseUrl = process.env.SCAN8004_API_BASE ?? "https://8004scan.io/api/v1/public",
  ) {}

  async listAgents(filter?: { category?: AgentCategory }): Promise<Agent[]> {
    await this.refreshIfStale();
    const agents = await this.repository.list();
    return filter?.category ? agents.filter((agent) => agent.category === filter.category) : agents;
  }

  async getAgent(id: string): Promise<Agent | null> {
    await this.refreshIfStale();
    return this.repository.get(id);
  }

  async getObservations(): Promise<Record<string, AgentObservation>> {
    await this.refreshIfStale();
    return this.repository.observations();
  }

  private async refreshIfStale() {
    const ttl = Number(process.env.DISCOVERY_CACHE_SECONDS ?? 300) * 1000;
    if (Date.now() - this.refreshedAt < ttl && (await this.repository.list()).length) return;
    try {
      await this.refresh();
    } catch (error) {
      if (!(await this.repository.list()).length) throw error;
    }
  }

  private async refresh() {
    const headers: HeadersInit = { accept: "application/json" };
    if (process.env.SCAN8004_API_KEY) headers.authorization = `Bearer ${process.env.SCAN8004_API_KEY}`;
    const listResponse = await this.fetcher(`${this.baseUrl}/agents?chainId=97&limit=50`, { headers, next: { revalidate: 300 } });
    if (!listResponse.ok) throw new Error(`8004scan list failed (${listResponse.status})`);
    const envelope = await listResponse.json() as ApiEnvelope;
    const rows = Array.isArray(envelope.data) ? envelope.data : [];
    const relevant = rows.filter((row) => normalize8004Agent(row)).slice(0, Math.max(1, Number(process.env.SCAN8004_DETAIL_LIMIT ?? 8)));
    const detailed = await Promise.all(relevant.map(async (row) => {
      const summary = normalize8004Agent(row);
      if (!summary) return null;
      try {
        const response = await this.fetcher(`${this.baseUrl}/agents/${summary.chainId}/${summary.tokenId}`, { headers, next: { revalidate: 300 } });
        if (!response.ok) return summary;
        const detail = await response.json() as ApiEnvelope;
        return normalize8004Agent(detail.data) ?? summary;
      } catch { return summary; }
    }));
    const agents = detailed.filter((agent): agent is Agent => Boolean(agent));
    const observations = await Promise.all(agents.map((agent) => observeAgent(agent, this.fetcher)));
    await this.repository.save(agents, observations);
    this.refreshedAt = Date.now();
  }
}
