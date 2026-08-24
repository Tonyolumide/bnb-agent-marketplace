import { Pool } from "pg";

export type StoredJob = {
  id: string;
  userAddress: `0x${string}`;
  agentId: string;
  erc8183JobId: string;
  status: "open" | "funded";
  budget: string;
  expiresAt: Date;
};

export interface JobRepository {
  saveCreated(job: StoredJob, txHash?: `0x${string}`): Promise<void>;
  get(id: string): Promise<StoredJob | null>;
  markFunded(id: string): Promise<void>;
  recordTransactionByChainJobId(chainJobId: string, kind: string, txHash: `0x${string}`): Promise<void>;
}

export class MemoryJobRepository implements JobRepository {
  readonly jobs = new Map<string, StoredJob>();
  readonly transactions: Array<{ chainJobId: string; kind: string; txHash: `0x${string}` }> = [];
  async saveCreated(job: StoredJob, txHash?: `0x${string}`) {
    this.jobs.set(job.id, job);
    if (txHash) this.transactions.push({ chainJobId: job.erc8183JobId, kind: "create", txHash });
  }
  async get(id: string) { return this.jobs.get(id) ?? null; }
  async markFunded(id: string) {
    const job = this.jobs.get(id);
    if (job) this.jobs.set(id, { ...job, status: "funded" });
  }
  async recordTransactionByChainJobId(chainJobId: string, kind: string, txHash: `0x${string}`) {
    if (!this.transactions.some((item) => item.txHash === txHash)) this.transactions.push({ chainJobId, kind, txHash });
  }
}

export class PostgresJobRepository implements JobRepository {
  constructor(private readonly pool: Pool) {}
  async saveCreated(job: StoredJob, txHash?: `0x${string}`) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`INSERT INTO jobs (id,user_address,agent_id,erc8183_job_id,status,budget,expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO UPDATE SET erc8183_job_id=EXCLUDED.erc8183_job_id,status=EXCLUDED.status,budget=EXCLUDED.budget`, [job.id, job.userAddress, job.agentId, job.erc8183JobId, job.status, job.budget, job.expiresAt]);
      if (txHash) await client.query(`INSERT INTO job_transactions (id,job_id,kind,tx_hash) VALUES ($1,$2,'create',$3) ON CONFLICT (tx_hash) DO NOTHING`, [crypto.randomUUID(), job.id, txHash]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  async get(id: string) {
    const result = await this.pool.query("SELECT * FROM jobs WHERE id=$1", [id]);
    const row = result.rows[0];
    if (!row?.erc8183_job_id) return null;
    return { id: row.id, userAddress: row.user_address, agentId: row.agent_id, erc8183JobId: row.erc8183_job_id, status: row.status, budget: String(row.budget), expiresAt: row.expires_at } as StoredJob;
  }
  async markFunded(id: string) { await this.pool.query("UPDATE jobs SET status='funded' WHERE id=$1", [id]); }
  async recordTransactionByChainJobId(chainJobId: string, kind: string, txHash: `0x${string}`) {
    await this.pool.query(`INSERT INTO job_transactions (id,job_id,kind,tx_hash) SELECT $1,id,$2,$3 FROM jobs WHERE erc8183_job_id=$4 ON CONFLICT (tx_hash) DO NOTHING`, [crypto.randomUUID(), kind, txHash, chainJobId]);
  }
}

export const jobRepository: JobRepository = process.env.DATABASE_URL
  ? new PostgresJobRepository(new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }))
  : new MemoryJobRepository();
