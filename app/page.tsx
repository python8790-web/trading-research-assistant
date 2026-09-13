"use client";

import { useEffect, useState } from "react";
import type { Experiment, FieldKey } from "@/lib/experiment";
import { applyAnswer } from "@/lib/experiment";
import { loadHistory, saveToHistory, clearHistory, type HistoryEntry } from "@/lib/history";

import GlowBackground from "./components/GlowBackground";
import TickerTape from "./components/TickerTape";
import UnderstoodCard from "./components/UnderstoodCard";
import ClarificationPanel from "./components/ClarificationPanel";
import ExperimentSpec from "./components/ExperimentSpec";
import ChallengeCard from "./components/ChallengeCard";
import BacktestResults from "./components/BacktestResults";
import HistoryPanel from "./components/HistoryPanel";

const EXAMPLE_QUESTION =
  "Does buying NIFTY after a 1% fall work better during high-volatility periods?";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Reading localStorage must happen after mount (it isn't available during
    // SSR), so this is exactly the "sync from an external system" case the
    // effect is for — not derivable from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
  }, []);

  async function analyzeQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setExperiment(null);
    setHasRun(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setExperiment(data);
      setHistory(saveToHistory(question, data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(field: FieldKey, value: string) {
    if (!experiment) return;
    const updated = applyAnswer(experiment, field, value);
    setExperiment(updated);
  }

  function selectHistoryEntry(entry: HistoryEntry) {
    setQuestion(entry.question);
    setExperiment(entry.experiment);
    setHasRun(false);
    setError("");
  }

  return (
    <main className="min-h-screen text-white">
      <GlowBackground />
      <TickerTape />

      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium tracking-wide text-slate-300">
              Nexus Research
            </span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            Prototype — demo ticker &amp; backtest data
          </span>
        </div>

        {/* HERO */}
        <div className="mb-12 pt-8 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
            AI-native trading research
          </div>
          <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">
            Turn market questions into
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              {" "}testable experiments.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Ask a trading research question in plain English. The assistant
            structures it, tells you what&apos;s missing, and defines a
            testable experiment before anything gets backtested.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            {/* INPUT */}
            <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
              <label className="mb-3 block text-sm font-medium text-slate-300">
                Your research question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`e.g. ${EXAMPLE_QUESTION}`}
                className="min-h-32 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setQuestion(EXAMPLE_QUESTION)}
                  className="text-left text-sm text-violet-400 hover:text-violet-300"
                >
                  Try an example →
                </button>
                <button
                  onClick={analyzeQuestion}
                  disabled={loading || !question.trim()}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Analyzing…" : "Analyze experiment"}
                </button>
              </div>
            </section>

            {error && (
              <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                {error}
              </div>
            )}

            {experiment && (
              <section className="mt-8 space-y-6">
                <UnderstoodCard experiment={experiment} />

                {experiment.missingFields.length > 0 && (
                  <ClarificationPanel
                    missingFields={experiment.missingFields}
                    onAnswer={handleAnswer}
                  />
                )}

                <ExperimentSpec
                  experiment={experiment}
                  onRun={() => setHasRun(true)}
                  hasRun={hasRun}
                />

                {experiment.ready && <ChallengeCard experiment={experiment} />}

                {hasRun && experiment.ready && (
                  <BacktestResults experiment={experiment} />
                )}
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <HistoryPanel
              entries={history}
              onSelect={selectHistoryEntry}
              onClear={() => {
                clearHistory();
                setHistory([]);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
