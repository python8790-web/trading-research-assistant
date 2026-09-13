"use client";

import { useState } from "react";
import type { Experiment } from "@/lib/experiment";
import { toBacktestPayload } from "@/lib/experiment";
import DataField from "./DataField";

export default function ExperimentSpec({
  experiment,
  onRun,
  hasRun,
}: {
  experiment: Experiment;
  onRun: () => void;
  hasRun: boolean;
}) {
  const [showPayload, setShowPayload] = useState(false);
  const payload = toBacktestPayload(experiment);

  return (
    <div className="animate-fade-in-up rounded-2xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-violet-400 uppercase">
            Step 2
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Experiment specification
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            experiment.ready
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {experiment.ready ? "● Ready to test" : "○ Needs input"}
        </span>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/20 p-5">
        <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
          Research question
        </p>
        <p className="mt-2 text-lg leading-7 text-slate-100">
          {experiment.researchQuestion}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DataField label="Instrument" value={experiment.instrument} />
        <DataField label="Timeframe" value={experiment.timeframe} />
        <DataField label="Entry" value={experiment.entry} />
        <DataField label="Exit" value={experiment.exit} />
        <DataField label="Holding period" value={experiment.holdingPeriod} />
        <DataField
          label="Filters / variables"
          value={experiment.filters.length ? experiment.filters.join(", ") : null}
        />
      </div>

      <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
        <p className="text-sm font-semibold text-blue-300">Suggested evaluation metrics</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Average return", "Win rate", "Max drawdown", "Sharpe ratio"].map((m) => (
            <span
              key={m}
              className="font-mono-data rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {experiment.assumptions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-300">Assumptions made</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
            {experiment.assumptions.map((a, i) => (
              <li key={i}>· {a}</li>
            ))}
          </ul>
        </div>
      )}

      {experiment.ready && (
        <>
          <div className="mt-6">
            <button
              onClick={() => setShowPayload((v) => !v)}
              className="text-sm text-slate-400 underline decoration-dotted underline-offset-4 hover:text-slate-200"
            >
              {showPayload ? "Hide" : "Show"} backtesting engine payload
            </button>

            {showPayload && (
              <pre className="font-mono-data thin-scroll mt-3 max-h-64 overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-emerald-300/90">
{JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>

          <button
            onClick={onRun}
            disabled={hasRun}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasRun ? "Experiment run ✓" : "Run research experiment →"}
          </button>
        </>
      )}
    </div>
  );
}
