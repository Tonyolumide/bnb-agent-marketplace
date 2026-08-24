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
      <form className="card search" onSubmit={submit}>
        <label htmlFor="objective">Financial objective</label>
        <textarea id="objective" value={objective} onChange={(event) => setObjective(event.target.value)} rows={4} />
        <button disabled={status === "loading"}>{status === "loading" ? "Checking live agents…" : "Find suitable agents"}</button>
        {status === "error" && <p className="error" role="alert">Live discovery is unavailable. Check the server configuration and retry.</p>}
      </form>
      {result && (
        <section aria-live="polite">
          <p className="muted">Parsed as {result.intent.category.replaceAll("_", " ")} · {result.intent.capital.toLocaleString()} {result.intent.asset}</p>
          {result.matches.length === 0 ? <div className="card"><h2>No eligible live agents</h2><p className="muted">No discovered agent matched this category and evidence threshold.</p></div> : (
            <div className="grid">
              {result.matches.map((match) => (
                <Link className="card" href={`/agents/${match.agent.id}`} key={match.agent.id}>
                  <span className={match.rejectedBy ? "badge warning" : "badge"}>{match.rejectedBy ? "Filtered" : `${match.score}/100 suitability`}</span>
                  <h2>{match.agent.name}</h2>
                  <p>{match.reasons[0]}</p>
                  <p className="muted">Observed: endpoint status · Claimed: capabilities and protocols</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
