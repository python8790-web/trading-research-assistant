import type { Experiment } from "@/lib/experiment";

function getChallenges(experiment: Experiment): string[] {
  const challenges: string[] = [];

  if (/better|edge|works|profitable/i.test(experiment.researchQuestion)) {
    challenges.push(
      "\u201CEdge\u201D needs a metric to mean anything \u2014 pin down whether you care about average return, win rate, or drawdown before judging the result."
    );
  }

  if (experiment.filters.some((f) => /volatil/i.test(f))) {
    challenges.push(
      "Define exactly how \u201Chigh volatility\u201D is measured (e.g. VIX level, realized volatility percentile) and what threshold separates \u201Chigh\u201D from \u201Cnormal.\u201D"
    );
  }

  if (!experiment.filters.length) {
    challenges.push(
      "No filters are applied \u2014 the result reflects all history equally, which may hide regime-dependent behavior."
    );
  }

  challenges.push(
    "Sample size matters: check how many trades this rule actually produced historically before trusting the win rate."
  );
  challenges.push(
    "Transaction costs, slippage, and taxes aren't modeled here \u2014 a real edge needs to survive them."
  );

  return challenges;
}

export default function ChallengeCard({ experiment }: { experiment: Experiment }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-6">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h3 className="font-semibold text-blue-300">Challenge this experiment</h3>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Before trusting any result, a careful researcher would push back on:
      </p>
      <ul className="mt-4 space-y-2.5">
        {getChallenges(experiment).map((c, i) => (
          <li
            key={i}
            className="rounded-lg border border-white/8 bg-black/20 p-3 text-sm text-slate-300"
          >
            <span className="mr-2 text-blue-400">•</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
