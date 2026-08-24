import { notFound } from "next/navigation";
import { discovery } from "@/lib/agents/discovery";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await discovery.getAgent(id);
  if (!agent) notFound();

  const observation = (await discovery.getObservations())[agent.id];
  return (
    <main>
      <p className="muted">{agent.category.replaceAll("_", " ")}</p>
      <h1>{agent.name}</h1>
      <p>{agent.description}</p>
      <div className="grid" style={{ marginTop: 24 }}>
        <div className="card"><strong>Claimed protocols</strong><p>{agent.protocols.join(", ") || "None"}</p></div>
        <div className="card"><strong>Identity</strong><p>ERC-8004 #{agent.tokenId}</p></div>
        <div className="card"><strong>Observed endpoint</strong><p>{observation ? (observation.endpointReachable ? `Reachable · ${observation.endpointLatencyMs ?? "—"} ms` : "Unreachable") : "Not yet observed"}</p></div>
        <div className="card"><strong>Evidence labels</strong><p>Capabilities and protocols are claimed. Endpoint status is observed. No performance data is verified yet.</p></div>
      </div>
    </main>
  );
}
