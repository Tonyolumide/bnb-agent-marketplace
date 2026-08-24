import { z } from "zod";
import { discovery } from "@/lib/agents/discovery";
import { parseFinancialIntent } from "@/lib/intent/parse";
import { recommendAgents } from "@/lib/ranking/recommend";

export const runtime = "nodejs";

const bodySchema = z.object({
  objective: z.string().trim().min(3).default("I want low-risk yield on 5,000 USDT"),
  capital: z.number().positive().optional(),
  asset: z.string().optional(),
  targetReturn: z.number().optional(),
  maxDrawdown: z.number().optional(),
});

export async function POST(request: Request) {
  const input = bodySchema.parse(await request.json());
  const intent = parseFinancialIntent(input.objective, {
    capital: input.capital,
    asset: input.asset,
    targetReturn: input.targetReturn,
    maxDrawdown: input.maxDrawdown,
  });
  const [candidates, observations] = await Promise.all([
    discovery.listAgents({ category: intent.category }),
    discovery.getObservations(),
  ]);
  const matches = recommendAgents(candidates, intent, observations);

  return Response.json({ intent, matches });
}
