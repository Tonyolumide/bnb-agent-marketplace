import { writeFile } from "node:fs/promises";
import { loadEnv } from "@bnbagent/sdk";
import { getAddress } from "viem";
import { isPolicyWhitelisted, policyAddresses } from "../src/lib/chain/policy-gate";

loadEnv();

async function main() {
const rpcUrl = process.env.RPC_URL;
const apiKey = process.env.JOB_API_KEY;
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const providerAddress = process.env.SMOKE_PROVIDER_ADDRESS;
const budget = process.env.SMOKE_BUDGET_RAW ?? "1";

if (process.env.AGENT_COMMERCE_ADAPTER !== "erc8183") throw new Error("AGENT_COMMERCE_ADAPTER must be erc8183");
if (!rpcUrl) throw new Error("RPC_URL is required");
if (!apiKey) throw new Error("JOB_API_KEY is required");
if (!providerAddress) throw new Error("SMOKE_PROVIDER_ADDRESS is required");
if (!/^\d+$/.test(budget)) throw new Error("SMOKE_BUDGET_RAW must be an integer");

const provider = getAddress(providerAddress);
const addresses = policyAddresses();
const whitelisted = await isPolicyWhitelisted({ rpcUrl, routerAddress: addresses.router, policyAddress: addresses.policy });
if (!whitelisted) {
  throw new Error(`ERC-8183 policy ${addresses.policy} is not whitelisted by router ${addresses.router}; no transaction was sent`);
}

const headers = { "content-type": "application/json", "x-job-api-key": apiKey };
const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
const createResponse = await fetch(new URL("/api/jobs", baseUrl), {
  method: "POST",
  headers,
  body: JSON.stringify({ providerAddress: provider, budget, expiresAt, metadataUri: "https://github.com/Tonyolumide/bnb-agent-marketplace" }),
});
if (!createResponse.ok) throw new Error(`createJob failed (${createResponse.status}): ${await createResponse.text()}`);
const created = await createResponse.json() as { job: { localJobId: string; jobId: string; txHash?: string } };

const fundResponse = await fetch(new URL("/api/jobs", baseUrl), {
  method: "PATCH",
  headers,
  body: JSON.stringify({ localJobId: created.job.localJobId, budget }),
});
if (!fundResponse.ok) throw new Error(`fundJob failed (${fundResponse.status}): ${await fundResponse.text()}`);
const funded = await fundResponse.json() as { job: { status: string }; funding: { fundTxHash: string; transactionHashes: string[] } };
const evidence = {
  observedAt: new Date().toISOString(),
  chainId: 97,
  providerAddress: provider,
  localJobId: created.job.localJobId,
  chainJobId: created.job.jobId,
  createTxHash: created.job.txHash,
  status: funded.job.status,
  fundTxHash: funded.funding.fundTxHash,
  transactionHashes: funded.funding.transactionHashes,
};
await writeFile(".erc8183-smoke.json", `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(JSON.stringify(evidence, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "ERC-8183 smoke test failed");
  process.exitCode = 1;
});
