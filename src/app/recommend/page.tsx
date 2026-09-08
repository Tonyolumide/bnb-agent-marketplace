import { RecommendationSearch } from "@/components/recommendation-search";

export default function RecommendPage() {
  return (
    <main>
      <p className="eyebrow">02 / Match your mandate</p>
      <h1>Find the agent that<br />fits your limits.</h1>
      <p className="lead">YieldGPT separates published claims from endpoint observations and deterministic suitability. Nothing is presented as verified unless the evidence supports it.</p>
      <RecommendationSearch />
    </main>
  );
}
