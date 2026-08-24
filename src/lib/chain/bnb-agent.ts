export type CreateJobInput = {
  providerAddress: `0x${string}`;
  budget: string;
  expiresAt: Date;
  metadataUri?: string;
};

export type ChainJob = {
  jobId: string;
  txHash?: `0x${string}`;
};

export interface AgentCommerceAdapter {
  createJob(input: CreateJobInput): Promise<ChainJob>;
  fundJob(jobId: string, budget: string): Promise<`0x${string}`>;
  settleJob(jobId: string): Promise<`0x${string}`>;
}

/**
 * Replace with @bnbagent/sdk ERC8183Client in Phase 2.
 * Server-only module. Never import this into a browser component.
 */
export class MockAgentCommerceAdapter implements AgentCommerceAdapter {
  async createJob(_input: CreateJobInput): Promise<ChainJob> {
    return { jobId: `demo-${crypto.randomUUID()}` };
  }

  async fundJob(): Promise<`0x${string}`> {
    return `0x${"0".repeat(64)}`;
  }

  async settleJob(): Promise<`0x${string}`> {
    return `0x${"0".repeat(64)}`;
  }
}

export const commerce = new MockAgentCommerceAdapter();
