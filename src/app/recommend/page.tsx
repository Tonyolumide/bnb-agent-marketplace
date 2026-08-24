import { RecommendationSearch } from "@/components/recommendation-search";

export default function RecommendPage() {
  return (
    <main>
      <p className="eyebrow">Live BSC testnet discovery</p>
      <h1>Match an agent to your constraints</h1>
      <p className="muted lead">Results separate published claims from endpoint observations and deterministic suitability.</p>
      <RecommendationSearch />
    </main>
  );
}
