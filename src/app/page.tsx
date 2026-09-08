import Link from "next/link";
import { discovery } from "@/lib/agents/discovery";

// Discovery depends on a live registry and must not make production builds
// fail when that upstream service is temporarily unavailable.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const agents = await discovery.listAgents();
  return (
    <main>
      <section className="hero"><div><p className="eyebrow">BNB Chain financial agent intelligence</p><h1>Don’t trust the pitch.<br />Inspect the agent.</h1><p className="lead">Describe the outcome you want. YieldGPT discovers live agents, tests what can be observed, and ranks only what fits your constraints.</p></div><div className="network-note"><div className="live">BSC testnet registry live</div><div>ERC-8004 discovery · ERC-8183 commerce</div><div>Evidence checked on every request</div></div></section>
      <section className="workspace" aria-labelledby="start-title"><div className="workspace-head"><span>01 / Define your mandate</span><span>Every score is explainable</span></div><div className="command"><h2 id="start-title">What should an agent accomplish—and never do?</h2><p className="muted">Set the capital, objective, and hard risk limits. We’ll turn them into an inspectable shortlist.</p><Link className="button" href="/recommend">Inspect agents →</Link></div><div className="trust-strip"><div className="trust-item"><small>Claimed</small><strong>What they publish</strong><span>Capabilities · protocols · fees</span></div><div className="trust-item"><small>Observed</small><strong>What we can test</strong><span>Endpoint · latency · chain identity</span></div><div className="trust-item"><small>Verified</small><strong>What chain proves</strong><span>Transactions · job state · policy</span></div></div></section>
      <section className="market-section"><div className="section-head"><h2>Live agents worth inspecting</h2><div className="category-links" aria-label="Agent categories">{["yield", "lp_rebalancing", "grid_trading", "health_factor"].map((category) => <Link key={category} href={`/api/agents?category=${category}`}>{category.replaceAll("_", " ")}</Link>)}</div></div><div className="agent-list">{agents.map((agent) => <Link className="agent-row" key={agent.id} href={`/agents/${agent.id}`}><span className="agent-icon">{agent.name.slice(0, 2).toUpperCase()}</span><span><span className="category">{agent.category.replaceAll("_", " ")}</span><h3>{agent.name}</h3></span><span className="agent-copy">{agent.description}</span><span className="evidence-rail" aria-label="Claimed and observed evidence available"><i className="on" /><i className="on" /><i /></span><span className="arrow">›</span></Link>)}</div></section>
    </main>
  );
}
