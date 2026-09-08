import { notFound } from "next/navigation";
import { discovery } from "@/lib/agents/discovery";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await discovery.getAgent(id);
  if (!agent) notFound();

  const observation = (await discovery.getObservations())[agent.id];
  return (
    <main>
      <section className="dossier-head"><p className="eyebrow">Agent dossier · {agent.category.replaceAll("_", " ")}</p><h1>{agent.name}</h1><p className="lead">{agent.description}</p></section>
      <div className="dossier-grid"><section className="card dossier-card"><small>Claimed</small><h2>Protocols</h2><p>{agent.protocols.join(", ") || "None published"}</p></section><section className="card dossier-card"><small>Observed</small><h2>ERC-8004 identity</h2><p>Registration #{agent.tokenId}</p></section><section className="card dossier-card"><small>Observed</small><h2>Endpoint status</h2><p>{observation ? (observation.endpointReachable ? `Reachable · ${observation.endpointLatencyMs ?? "—"} ms` : "Unreachable") : "Not yet observed"}</p></section><section className="card dossier-card"><small>Evidence boundary</small><h2>What YieldGPT knows</h2><p>Capabilities and protocols are claimed. Endpoint status is observed. Performance data is not yet verified.</p></section></div>
    </main>
  );
}
