import { Pool } from "pg";
import type { Agent, AgentCategory, AgentObservation } from "@/types/agent";
import { MemoryAgentRepository, PostgresAgentRepository } from "./repository";
import { Scan8004DiscoveryAdapter } from "./scan8004";

export interface DiscoveryAdapter {
  listAgents(filter?: { category?: AgentCategory }): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  getObservations(): Promise<Record<string, AgentObservation>>;
}

/**
 * Phase 1 default. Replace with 8004scan or direct ERC-8004 adapter.
 * Keeping this adapter boundary lets us swap discovery sources without touching UI code.
 */
const repository = process.env.DATABASE_URL
  ? new PostgresAgentRepository(new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }))
  : new MemoryAgentRepository();

export const discovery: DiscoveryAdapter = new Scan8004DiscoveryAdapter(repository);
