import { describe, expect, it, vi } from "vitest";
import { ERC8183AgentCommerceAdapter, MockAgentCommerceAdapter, createCommerceAdapter } from "./bnb-agent";
import { MemoryJobRepository } from "../jobs/repository";

const hash = (digit: string) => `0x${digit.repeat(64)}` as `0x${string}`;

function fakeClient(overrides: { budget?: bigint; policy?: `0x${string}` } = {}) {
  return {
    address: "0x1111111111111111111111111111111111111111" as `0x${string}`,
    createJob: vi.fn(async () => ({ jobId: 42n, transactionHash: hash("1") })),
    getJob: vi.fn(async () => ({ budget: overrides.budget ?? 0n, status: 0 })),
    registerJob: vi.fn(async () => ({ transactionHash: hash("2") })),
    setBudget: vi.fn(async () => ({ transactionHash: hash("3") })),
    fund: vi.fn(async () => ({ transactionHash: hash("4") })),
    router: { jobPolicy: vi.fn(async () => overrides.policy ?? "0x0000000000000000000000000000000000000000" as `0x${string}`) },
  };
}

describe("ERC-8183 commerce adapter", () => {
  it("creates a job and returns its on-chain ID and transaction hash", async () => {
    const client = fakeClient();
    const adapter = new ERC8183AgentCommerceAdapter(async () => client, new MemoryJobRepository());
    await expect(adapter.createJob({ providerAddress: "0x2222222222222222222222222222222222222222", budget: "1000000", expiresAt: new Date("2030-01-01T00:00:00Z") })).resolves.toMatchObject({ jobId: "42", txHash: hash("1") });
    expect(client.createJob).toHaveBeenCalledWith(expect.objectContaining({ provider: "0x2222222222222222222222222222222222222222", expiredAt: 1893456000n }));
  });

  it("registers, sets an exact budget, funds, and journals every hash", async () => {
    const client = fakeClient();
    const jobs = new MemoryJobRepository();
    const adapter = new ERC8183AgentCommerceAdapter(async () => client, jobs);
    const result = await adapter.fundJob("42", "1000000");
    expect(result).toEqual({ fundTxHash: hash("4"), transactionHashes: [hash("2"), hash("3"), hash("4")] });
    expect(client.fund).toHaveBeenCalledWith(42n, 1000000n, { approveFloor: 0n });
    expect(jobs.transactions.map(({ kind }) => kind)).toEqual(["register", "set_budget", "fund"]);
  });

  it("resumes setup safely and refuses a conflicting budget", async () => {
    const configured = fakeClient({ budget: 1000000n, policy: "0x3333333333333333333333333333333333333333" });
    const adapter = new ERC8183AgentCommerceAdapter(async () => configured, new MemoryJobRepository());
    await adapter.fundJob("42", "1000000");
    expect(configured.registerJob).not.toHaveBeenCalled();
    expect(configured.setBudget).not.toHaveBeenCalled();
    await expect(adapter.fundJob("42", "2")).rejects.toThrow(/different budget/);
  });

  it("uses mock mode by default and rejects unknown modes", () => {
    expect(createCommerceAdapter({})).toBeInstanceOf(MockAgentCommerceAdapter);
    expect(() => createCommerceAdapter({ AGENT_COMMERCE_ADAPTER: "unknown" })).toThrow(/Unknown/);
  });
});
