// ---------------------------------------------------------------------------
// Core domain model for the trading research assistant.
//
// Design decision: the LLM's only job is EXTRACTION — turning a natural
// language question into structured fields. Deciding what is "missing" and
// whether the experiment is "ready" is done here, in plain deterministic
// TypeScript. This keeps that logic auditable, testable without hitting the
// model, and immune to the LLM changing its mind about readiness between
// calls. See README.md "Key decisions" for the reasoning.
// ---------------------------------------------------------------------------

export type FieldKey =
  | "instrument"
  | "timeframe"
  | "entry"
  | "exit"
  | "holdingPeriod";

/** Raw extraction the LLM is asked to produce from the user's question. */
export interface ExtractedExperiment {
  instrument: string | null;
  timeframe: string | null;
  entry: string | null;
  exit: string | null;
  holdingPeriod: string | null;
  filters: string[];
  researchQuestion: string;
  assumptions: string[];
}

/** What the extracted data looks like once we've reasoned about gaps. */
export interface Experiment extends ExtractedExperiment {
  missingFields: MissingField[];
  ready: boolean;
}

export interface MissingField {
  field: FieldKey;
  question: string;
  /** Quick-pick suggestions; empty array means free text only. */
  options: string[];
  /** True if a text input should also be offered alongside the options. */
  allowCustom: boolean;
}

const FIELD_PROMPTS: Record<
  FieldKey,
  { question: string; options: string[]; allowCustom: boolean }
> = {
  instrument: {
    question: "Which instrument or market is this research about?",
    options: ["NIFTY 50", "BANK NIFTY", "SENSEX", "Nifty Midcap 100"],
    allowCustom: true,
  },
  timeframe: {
    question: "What bar size / timeframe should the analysis use?",
    options: ["Daily", "Weekly", "1-hour intraday", "15-min intraday"],
    allowCustom: true,
  },
  entry: {
    question: "What exact condition should trigger a trade entry?",
    options: [],
    allowCustom: true,
  },
  exit: {
    question: "How should an open position be exited?",
    options: [
      "Fixed holding period",
      "Target return hit",
      "Stop-loss hit",
      "Opposite signal",
    ],
    allowCustom: true,
  },
  holdingPeriod: {
    question: "If using a fixed holding period, how long should positions be held?",
    options: ["1 day", "3 days", "5 days", "10 days", "20 days"],
    allowCustom: true,
  },
};

/**
 * A question is testable once we know: what instrument, what timeframe,
 * what triggers a trade, and how a trade ends (either an explicit exit rule
 * or a fixed holding period — one implies the other).
 */
export function evaluateReadiness(x: ExtractedExperiment): Experiment {
  const missingFields: MissingField[] = [];

  const need = (field: FieldKey, present: boolean) => {
    if (!present) {
      missingFields.push({ field, ...FIELD_PROMPTS[field] });
    }
  };

  need("instrument", !!x.instrument?.trim());
  need("timeframe", !!x.timeframe?.trim());
  need("entry", !!x.entry?.trim());

  const hasExitStrategy = !!x.exit?.trim() || !!x.holdingPeriod?.trim();
  if (!hasExitStrategy) {
    // Ask for both — the user can resolve either one.
    missingFields.push({ field: "exit", ...FIELD_PROMPTS.exit });
    missingFields.push({ field: "holdingPeriod", ...FIELD_PROMPTS.holdingPeriod });
  }

  return {
    ...x,
    missingFields,
    ready: missingFields.length === 0,
  };
}

/** Apply a user's clarification answer and re-run the readiness check. */
export function applyAnswer(
  experiment: Experiment,
  field: FieldKey,
  value: string
): Experiment {
  const updated: ExtractedExperiment = { ...experiment, [field]: value };
  return evaluateReadiness(updated);
}

/** Shape sent to a (future) backtesting engine. Bonus: see README. */
export function toBacktestPayload(experiment: Experiment) {
  return {
    instrument: experiment.instrument,
    timeframe: experiment.timeframe,
    rules: {
      entry: experiment.entry,
      exit: experiment.exit ?? null,
      holding_period: experiment.holdingPeriod ?? null,
    },
    filters: experiment.filters,
    metrics_requested: ["average_return", "win_rate", "max_drawdown", "sharpe_ratio"],
    research_question: experiment.researchQuestion,
    assumptions: experiment.assumptions,
  };
}
