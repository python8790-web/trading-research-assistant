import type { Experiment } from "./experiment";

/**
 * Deterministic mock backtest.
 *
 * This is NOT a real backtest — there is no market data or execution model
 * behind it. It exists purely to demonstrate the shape of Step 3 of the
 * product (explain the result) once a real backtesting engine is wired up
 * behind `toBacktestPayload()`. Numbers are derived from a hash of the
 * experiment so the same question always reproduces the same "result"
 * instead of re-randomizing on every render.
 */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export interface MockBacktestResult {
  trades: number;
  winRate: number;
  averageReturn: number;
  maxDrawdown: number;
  filteredAverageReturn: number;
  baselineAverageReturn: number;
  takeaway: string;
}

export function runMockBacktest(experiment: Experiment): MockBacktestResult {
  const seed = hash(
    `${experiment.instrument}|${experiment.entry}|${experiment.exit}|${experiment.holdingPeriod}|${experiment.filters.join(",")}`
  );

  const trades = 60 + (seed % 180);
  const winRate = 46 + (seed % 22); // 46–67%
  const averageReturn = 0.2 + ((seed % 90) / 100); // 0.2–1.1%
  const maxDrawdown = -(3 + (seed % 12)); // -3 to -14%
  const hasFilter = experiment.filters.length > 0;

  const filteredAverageReturn = hasFilter
    ? Number((averageReturn * (1.25 + ((seed % 20) / 100))).toFixed(2))
    : averageReturn;
  const baselineAverageReturn = Number((averageReturn * 0.7).toFixed(2));

  const edgeDirection = filteredAverageReturn > baselineAverageReturn ? "better" : "worse";

  return {
    trades,
    winRate: Number(winRate.toFixed(1)),
    averageReturn: Number(averageReturn.toFixed(2)),
    maxDrawdown,
    filteredAverageReturn,
    baselineAverageReturn,
    takeaway: hasFilter
      ? `In this simulated sample, the strategy performed ${edgeDirection} when "${experiment.filters[0]}" was true compared to when it wasn't.`
      : `In this simulated sample, the setup produced a small positive average return, but with no filter applied there isn't much to compare it against yet.`,
  };
}
