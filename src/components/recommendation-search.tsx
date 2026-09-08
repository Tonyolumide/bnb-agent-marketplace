"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { FinancialIntent } from "@/types/intent";
import type { Recommendation } from "@/types/recommendation";

type Result = { intent: FinancialIntent; matches: Recommendation[] };

export function RecommendationSearch() {
  const [objective, setObjective] = useState("I have 5,000 USDT. Find low-risk yield. Max drawdown 5%. No unaudited protocols.");
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/recommend", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ objective }) });
      if (!response.ok) throw new Error("Recommendation request failed");
      setResult(await response.json() as Result);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <form className="workspace search" onSubmit={submit}>
        <label htmlFor="objective">What should an agent accomplish—and never do?</label>
        <textarea id="objective" value={objective} onChange={(event) => setObjective(event.target.value)} rows={4} />
        <div className="search-actions"><span className="hint">Live ERC-8004 discovery · deterministic scoring</span><button className="primary" disabled={status === "loading"}>{status === "loading" ? "Inspecting live agents…" : "Inspect agents →"}</button></div>
        {status === "error" && <p className="error" role="alert">Live discovery is unavailable. Check the server configuration and retry.</p>}
      </form>
      {result && (
        <section aria-live="polite">
          <p className="parsed">Parsed mandate · {result.intent.category.replaceAll("_", " ")} · {result.intent.capital.toLocaleString()} {result.intent.asset}</p>
          {result.matches.length === 0 ? <div className="card empty-state"><h2>No eligible live agents</h2><p className="muted">No discovered agent matched this category and evidence threshold. Keep your safeguards or adjust one constraint.</p></div> : (
            <div className="agent-list">
              {result.matches.map((match) => (
                <Link className="agent-row result-row" href={`/agents/${match.agent.id}`} key={match.agent.id}>
                  <span className="score">{match.score}</span>
                  <span><span className="category">{match.agent.category.replaceAll("_", " ")}</span><h3>{match.agent.name}</h3><span className={match.rejectedBy ? "badge warning" : "badge"}>{match.rejectedBy ? "Filtered" : "Suitable"}</span></span>
                  <span className="agent-copy">{match.reasons[0]}<br /><span className="muted">Observed: endpoint · Claimed: capabilities and protocols</span></span>
                  <span className="arrow">›</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
