import type { Experiment } from "@/lib/experiment";
import { runMockBacktest } from "@/lib/mockBacktest";

function ResultCard({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-5">
      <p className="text-xs tracking-wider text-slate-500 uppercase">{label}</p>
      <p
        className={`font-mono-data mt-2 text-2xl font-semibold ${
          tone === "up" ? "text-emerald-400" : tone === "down" ? "text-rose-400" : "text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function BacktestResults({ experiment }: { experiment: Experiment }) {
  const result = runMockBacktest(experiment);

  return (
    <div className="animate-fade-in-up rounded-2xl border border-white/8 bg-white/[0.02] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-emerald-400 uppercase">Step 3</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Backtest results</h2>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          SIMULATED · DEMO DATA
        </span>
      </div>

      <p className="mb-6 text-sm text-slate-400">
        These numbers are generated locally to illustrate the output shape — no
        real market data or execution engine is behind them yet. Wire the{" "}
        <span className="font-mono-data text-slate-300">backtesting engine payload</span>{" "}
        from Step 2 into a real data provider to make this live.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard label="Trades" value={String(result.trades)} />
        <ResultCard label="Win rate" value={`${result.winRate}%`} />
        <ResultCard label="Average return" value={`+${result.averageReturn}%`} tone="up" />
        <ResultCard label="Max drawdown" value={`${result.maxDrawdown}%`} tone="down" />
      </div>

      {experiment.filters.length > 0 && (
        <div className="mt-6 rounded-xl border border-white/8 bg-black/20 p-5">
          <p className="text-sm font-semibold text-slate-200">Filtered vs. unfiltered comparison</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/8 p-5">
              <p className="text-sm text-slate-500">{experiment.filters[0]}</p>
              <p className="font-mono-data mt-2 text-2xl font-semibold text-emerald-400">
                +{result.filteredAverageReturn}%
              </p>
              <p className="mt-1 text-xs text-slate-500">Average return per trade</p>
            </div>
            <div className="rounded-xl border border-white/8 p-5">
              <p className="text-sm text-slate-500">Baseline (no filter)</p>
              <p className="font-mono-data mt-2 text-2xl font-semibold text-slate-200">
                +{result.baselineAverageReturn}%
              </p>
              <p className="mt-1 text-xs text-slate-500">Average return per trade</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
        <p className="text-sm font-semibold text-emerald-400">Research takeaway</p>
        <p className="mt-2 text-slate-300">{result.takeaway}</p>
      </div>
    </div>
  );
}
