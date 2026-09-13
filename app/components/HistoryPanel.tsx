import type { HistoryEntry } from "@/lib/history";

export default function HistoryPanel({
  entries,
  onSelect,
  onClear,
}: {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
          Recent questions
        </p>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Clear
        </button>
      </div>
      <div className="thin-scroll max-h-72 space-y-2 overflow-auto pr-1">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="block w-full rounded-lg border border-white/8 bg-black/20 p-3 text-left text-sm text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/5"
          >
            <p className="line-clamp-2">{entry.question}</p>
            <p className="font-mono-data mt-1.5 text-xs text-slate-500">
              {entry.experiment.ready ? "✓ complete" : "○ incomplete"} ·{" "}
              {entry.experiment.instrument ?? "unknown instrument"}
            </p>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-600">
        Stored locally in your browser. A production version would persist
        this per-user in a database so the assistant can learn across
        sessions.
      </p>
    </div>
  );
}
