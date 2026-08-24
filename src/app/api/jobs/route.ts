import { z } from "zod";
import { commerce } from "@/lib/chain/bnb-agent";

export const runtime = "nodejs";

const bodySchema = z.object({
  providerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  budget: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export async function POST(request: Request) {
  const input = bodySchema.parse(await request.json());
  const job = await commerce.createJob({
    providerAddress: input.providerAddress as `0x${string}`,
    budget: input.budget,
    expiresAt: new Date(input.expiresAt),
  });
  return Response.json({ job }, { status: 201 });
}

