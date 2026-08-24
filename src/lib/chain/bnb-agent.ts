import { ERC8183Client, EVMWalletProvider } from "@bnbagent/sdk";
import { getBnbChainId, getBnbNetwork } from "./config";
import { jobRepository, type JobRepository } from "../jobs/repository";

export type CreateJobInput = { providerAddress: `0x${string}`; budget: string; expiresAt: Date; metadataUri?: string };
export type ChainJob = { jobId: string; clientAddress: `0x${string}`; txHash?: `0x${string}` };
export type ChainFunding = { fundTxHash: `0x${string}`; transactionHashes: `0x${string}`[] };

export interface AgentCommerceAdapter {
  createJob(input: CreateJobInput): Promise<ChainJob>;
  fundJob(jobId: string, budget: string): Promise<ChainFunding>;
}

type TxResult = { transactionHash: `0x${string}` };
type SdkClient = {
  address: `0x${string}` | null;
  createJob(input: { provider: string; expiredAt: bigint; description?: string }): Promise<TxResult & { jobId: bigint | null }>;
  getJob(jobId: bigint): Promise<{ budget: bigint; status: number }>;
  registerJob(jobId: bigint): Promise<TxResult>;
  setBudget(jobId: bigint, budget: bigint): Promise<TxResult>;
  fund(jobId: bigint, budget: bigint, options: { approveFloor: bigint }): Promise<TxResult>;
  router: { jobPolicy(jobId: bigint): Promise<`0x${string}`> };
};
type ClientFactory = () => Promise<SdkClient>;

const ZERO_ADDRESS = `0x${"0".repeat(40)}` as `0x${string}`;

function rawUnits(value: string) {
  if (!/^\d+$/.test(value)) throw new Error("Budget must be an integer in payment-token raw units");
  return BigInt(value);
}

function unixSeconds(value: Date) {
  if (Number.isNaN(value.getTime())) throw new Error("Invalid job expiry");
  return BigInt(Math.floor(value.getTime() / 1000));
}

export class MockAgentCommerceAdapter implements AgentCommerceAdapter {
  async createJob(): Promise<ChainJob> {
    return { jobId: `demo-${crypto.randomUUID()}`, clientAddress: ZERO_ADDRESS };
  }
  async fundJob(): Promise<ChainFunding> {
    const fundTxHash = `0x${"0".repeat(64)}` as `0x${string}`;
    return { fundTxHash, transactionHashes: [fundTxHash] };
  }
}

export class ERC8183AgentCommerceAdapter implements AgentCommerceAdapter {
  private clientPromise?: Promise<SdkClient>;
  constructor(private readonly clientFactory: ClientFactory = createSdkClient, private readonly jobs: JobRepository = jobRepository) {}
  private client() { return this.clientPromise ??= this.clientFactory(); }

  async createJob(input: CreateJobInput): Promise<ChainJob> {
    rawUnits(input.budget);
    const client = await this.client();
    if (!client.address) throw new Error("ERC-8183 client wallet is unavailable");
    const result = await client.createJob({ provider: input.providerAddress, expiredAt: unixSeconds(input.expiresAt), description: input.metadataUri ?? "BNB Financial Agent Marketplace job" });
    if (result.jobId === null) throw new Error(`ERC-8183 create transaction ${result.transactionHash} did not emit a job ID`);
    return { jobId: result.jobId.toString(), clientAddress: client.address, txHash: result.transactionHash };
  }

  async fundJob(jobIdValue: string, budgetValue: string): Promise<ChainFunding> {
    if (!/^\d+$/.test(jobIdValue)) throw new Error("ERC-8183 job ID must be an integer");
    const jobId = BigInt(jobIdValue);
    const budget = rawUnits(budgetValue);
    const client = await this.client();
    const job = await client.getJob(jobId);
    if (job.status !== 0) throw new Error(`ERC-8183 job ${jobId} is not open`);
    if (job.budget !== 0n && job.budget !== budget) throw new Error(`ERC-8183 job ${jobId} already has a different budget`);

    const transactionHashes: `0x${string}`[] = [];
    if ((await client.router.jobPolicy(jobId)).toLowerCase() === ZERO_ADDRESS) {
      const registered = await client.registerJob(jobId);
      transactionHashes.push(registered.transactionHash);
      await this.jobs.recordTransactionByChainJobId(jobIdValue, "register", registered.transactionHash);
    }
    if (job.budget === 0n) {
      const budgeted = await client.setBudget(jobId, budget);
      transactionHashes.push(budgeted.transactionHash);
      await this.jobs.recordTransactionByChainJobId(jobIdValue, "set_budget", budgeted.transactionHash);
    }
    const funded = await client.fund(jobId, budget, { approveFloor: 0n });
    transactionHashes.push(funded.transactionHash);
    await this.jobs.recordTransactionByChainJobId(jobIdValue, "fund", funded.transactionHash);
    return { fundTxHash: funded.transactionHash, transactionHashes };
  }
}

async function createSdkClient(): Promise<SdkClient> {
  if (getBnbChainId() !== 97) throw new Error("ERC-8183 writes are restricted to BNB testnet (BNB_CHAIN_ID=97)");
  const password = process.env.WALLET_PASSWORD;
  if (!password) throw new Error("WALLET_PASSWORD is required for the ERC-8183 adapter");
  const wallet = new EVMWalletProvider({ password, privateKey: process.env.PRIVATE_KEY, address: process.env.WALLET_ADDRESS });
  return ERC8183Client.create({ walletProvider: wallet, network: getBnbNetwork() }) as Promise<SdkClient>;
}

export function createCommerceAdapter(env: Record<string, string | undefined> = process.env) {
  const mode = env.AGENT_COMMERCE_ADAPTER ?? "mock";
  if (mode === "mock") return new MockAgentCommerceAdapter();
  if (mode === "erc8183") return new ERC8183AgentCommerceAdapter();
  throw new Error(`Unknown AGENT_COMMERCE_ADAPTER: ${mode}`);
}

export const commerce = createCommerceAdapter();
