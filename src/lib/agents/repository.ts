import { Pool } from "pg";
import type { Agent, AgentObservation } from "@/types/agent";

export interface AgentRepository {
  list(): Promise<Agent[]>;
  get(id: string): Promise<Agent | null>;
  observations(): Promise<Record<string, AgentObservation>>;
  save(agents: Agent[], observations: AgentObservation[]): Promise<void>;
}

export class MemoryAgentRepository implements AgentRepository {
  private agents = new Map<string, Agent>();
  private observed = new Map<string, AgentObservation>();
  async list() { return [...this.agents.values()]; }
  async get(id: string) { return this.agents.get(id) ?? null; }
  async observations() { return Object.fromEntries(this.observed); }
  async save(agents: Agent[], observations: AgentObservation[]) {
    agents.forEach((agent) => this.agents.set(agent.id, agent));
    observations.forEach((observation) => this.observed.set(observation.agentId, observation));
  }
}

export class PostgresAgentRepository implements AgentRepository {
  constructor(private readonly pool: Pool) {}

  async list() {
    const result = await this.pool.query(`SELECT a.*, COALESCE(json_agg(json_build_object('name', s.name, 'url', s.url)) FILTER (WHERE s.id IS NOT NULL), '[]') services FROM agents a LEFT JOIN agent_services s ON s.agent_id = a.id GROUP BY a.id ORDER BY a.indexed_at DESC`);
    return result.rows.map(rowToAgent);
  }

  async get(id: string) {
    const result = await this.pool.query(`SELECT a.*, COALESCE(json_agg(json_build_object('name', s.name, 'url', s.url)) FILTER (WHERE s.id IS NOT NULL), '[]') services FROM agents a LEFT JOIN agent_services s ON s.agent_id = a.id WHERE a.id = $1 GROUP BY a.id`, [id]);
    return result.rows[0] ? rowToAgent(result.rows[0]) : null;
  }

  async observations() {
    const result = await this.pool.query(`SELECT DISTINCT ON (agent_id) * FROM agent_observations ORDER BY agent_id, calculated_at DESC`);
    return Object.fromEntries(result.rows.map((row) => [row.agent_id, rowToObservation(row)]));
  }

  async save(agents: Agent[], observations: AgentObservation[]) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const agent of agents) {
        await client.query(`INSERT INTO agents (id, chain_id, token_id, name, description, owner_address, agent_wallet, category, skills, protocols, active_claimed, x402_support, created_at, indexed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, agent_wallet=EXCLUDED.agent_wallet, category=EXCLUDED.category, skills=EXCLUDED.skills, protocols=EXCLUDED.protocols, active_claimed=EXCLUDED.active_claimed, x402_support=EXCLUDED.x402_support, created_at=EXCLUDED.created_at, indexed_at=EXCLUDED.indexed_at`, [agent.id, agent.chainId, agent.tokenId, agent.name, agent.description, agent.ownerAddress, agent.agentWallet, agent.category, JSON.stringify(agent.skills), JSON.stringify(agent.protocols), agent.activeClaimed, agent.x402Support, agent.createdAt, agent.indexedAt]);
        await client.query("DELETE FROM agent_services WHERE agent_id = $1", [agent.id]);
        for (const [index, service] of agent.services.entries()) {
          await client.query("INSERT INTO agent_services (id, agent_id, name, url) VALUES ($1,$2,$3,$4)", [`${agent.id}:${index}`, agent.id, service.name, service.url]);
        }
      }
      for (const observation of observations) {
        await client.query(`INSERT INTO agent_observations (id, agent_id, endpoint_reachable, endpoint_latency_ms, recent_tx_count, successful_job_count, failed_job_count, observed_protocols, calculated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [`${observation.agentId}:${observation.calculatedAt}`, observation.agentId, observation.endpointReachable, observation.endpointLatencyMs, observation.recentTxCount, observation.successfulJobCount, observation.failedJobCount, JSON.stringify(observation.observedProtocols), observation.calculatedAt]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

function rowToAgent(row: Record<string, unknown>): Agent {
  const date = (value: unknown) => value instanceof Date ? value.toISOString() : String(value);
  return { id: String(row.id), chainId: Number(row.chain_id), tokenId: String(row.token_id), name: String(row.name), description: row.description ? String(row.description) : null, ownerAddress: String(row.owner_address) as `0x${string}`, agentWallet: row.agent_wallet ? String(row.agent_wallet) as `0x${string}` : null, category: row.category as Agent["category"], services: row.services as Agent["services"], skills: row.skills as string[], protocols: row.protocols as string[], activeClaimed: row.active_claimed as boolean | null, x402Support: Boolean(row.x402_support), createdAt: date(row.created_at), indexedAt: date(row.indexed_at) };
}

function rowToObservation(row: Record<string, unknown>): AgentObservation {
  const calculatedAt = row.calculated_at instanceof Date ? row.calculated_at.toISOString() : String(row.calculated_at);
  return { agentId: String(row.agent_id), endpointReachable: Boolean(row.endpoint_reachable), endpointLatencyMs: row.endpoint_latency_ms === null ? null : Number(row.endpoint_latency_ms), lastSuccessfulProbe: Boolean(row.endpoint_reachable) ? calculatedAt : null, recentTxCount: Number(row.recent_tx_count), recentJobCount: Number(row.successful_job_count) + Number(row.failed_job_count), successfulJobCount: Number(row.successful_job_count), failedJobCount: Number(row.failed_job_count), observedProtocols: row.observed_protocols as string[], observedAssets: [], lastOnchainActivity: null, calculatedAt };
}
