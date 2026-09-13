import type { Experiment } from "@/lib/experiment";
import DataField from "./DataField";

export default function UnderstoodCard({ experiment }: { experiment: Experiment }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-sm">
      <p className="text-xs font-medium tracking-wider text-violet-400 uppercase">Step 1</p>
      <h2 className="mt-1 text-2xl font-semibold text-white">What we understood</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
