import Link from "next/link";
import { discovery } from "@/lib/agents/discovery";

// Discovery depends on a live registry and must not make production builds
// fail when that upstream service is temporarily unavailable.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const agents = await discovery.listAgents();
  return (
    <main>
      <p className="eyebrow">BNB Chain financial agent marketplace</p>
      <h1>Find the right financial agent</h1>
      <p className="muted">Discovery, verified evidence, user-specific suitability, and scoped execution.</p>
      <div className="card" style={{ margin: "28px 0" }}>
        <p>Describe your objective, limits, and risk tolerance. We’ll check live ERC-8004 registrations.</p>
        <Link className="button" href="/recommend">Find agents</Link>
      </div>
      <h2>Four first-class categories</h2>
      <div className="category-links" aria-label="Agent categories">
        {["yield", "lp_rebalancing", "grid_trading", "health_factor"].map((category) => <Link key={category} href={`/api/agents?category=${category}`}>{category.replaceAll("_", " ")}</Link>)}
      </div>
      <div className="grid">
        {agents.map((agent) => (
          <Link className="card" key={agent.id} href={`/agents/${agent.id}`}>
            <small className="muted">{agent.category.replaceAll("_", " ")}</small>
            <h3>{agent.name}</h3>
            <p className="muted">{agent.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
