"use client";

import { useState } from "react";
import type { MissingField, FieldKey } from "@/lib/experiment";

export default function ClarificationPanel({
  missingFields,
  onAnswer,
}: {
  missingFields: MissingField[];
  onAnswer: (field: FieldKey, value: string) => void;
}) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
      <p className="text-xs font-medium tracking-wider text-amber-400 uppercase">
        Needs clarification
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-white">
        Before we test this…
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        The system won&apos;t guess these — they materially change the
        result, so it&apos;s asking instead of assuming.
      </p>

      <div className="mt-6 space-y-5">
        {missingFields.map((field) => (
          <ClarificationRow
            key={field.field}
            field={field}
            onAnswer={onAnswer}
          />
        ))}
      </div>
    </div>
  );
}

function ClarificationRow({
  field,
  onAnswer,
}: {
  field: MissingField;
  onAnswer: (field: FieldKey, value: string) => void;
}) {
  const [custom, setCustom] = useState("");

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-sm font-medium text-slate-200">
        {field.question}
      </p>

      {field.options.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {field.options.map((option) => (
            <button
              key={option}
              onClick={() => onAnswer(field.field, option)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-300"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {field.allowCustom && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) onAnswer(field.field, custom.trim());
          }}
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={
              field.options.length > 0 ? "Or type your own…" : "Type your answer…"
            }
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/60"
          />
          <button
            type="submit"
            disabled={!custom.trim()}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}
