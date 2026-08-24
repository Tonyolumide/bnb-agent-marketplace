import { discovery } from "@/lib/agents/discovery";
import type { AgentCategory } from "@/types/agent";

export const runtime = "nodejs";

const categories = new Set<AgentCategory>(["yield", "lp_rebalancing", "grid_trading", "health_factor"]);

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("category") as AgentCategory | null;
  if (value && !categories.has(value)) return Response.json({ error: "Unknown category" }, { status: 400 });
  const [agents, observations] = await Promise.all([
    discovery.listAgents(value ? { category: value } : undefined),
    discovery.getObservations(),
  ]);
  return Response.json({ agents, observations });
}
