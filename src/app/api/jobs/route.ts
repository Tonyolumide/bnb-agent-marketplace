import { z } from "zod";
import { commerce } from "@/lib/chain/bnb-agent";
import { jobRepository } from "@/lib/jobs/repository";
import { isJobRequestAuthorized } from "@/lib/jobs/authorization";

export const runtime = "nodejs";

const bodySchema = z.object({
  providerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  budget: z.string().regex(/^\d+$/, "Budget must use payment-token raw units"),
  expiresAt: z.string().datetime(),
  metadataUri: z.string().url().optional(),
});

const fundSchema = z.object({ localJobId: z.string().uuid(), budget: z.string().regex(/^\d+$/) });

export async function POST(request: Request) {
  if (!isJobRequestAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = bodySchema.parse(await request.json());
  const job = await commerce.createJob({
    providerAddress: input.providerAddress as `0x${string}`,
    budget: input.budget,
    expiresAt: new Date(input.expiresAt),
    metadataUri: input.metadataUri,
  });
  const localJobId = crypto.randomUUID();
  await jobRepository.saveCreated({ id: localJobId, userAddress: job.clientAddress, agentId: input.providerAddress, erc8183JobId: job.jobId, status: "open", budget: input.budget, expiresAt: new Date(input.expiresAt) }, job.txHash);
  return Response.json({ job: { ...job, localJobId } }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isJobRequestAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = fundSchema.parse(await request.json());
  const stored = await jobRepository.get(input.localJobId);
  if (!stored) return Response.json({ error: "Job not found" }, { status: 404 });
  if (stored.budget !== input.budget) return Response.json({ error: "Budget does not match the created job" }, { status: 409 });
  const funding = await commerce.fundJob(stored.erc8183JobId, input.budget);
  await jobRepository.markFunded(stored.id);
  return Response.json({ job: { ...stored, status: "funded" }, funding });
}
