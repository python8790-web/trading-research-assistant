import { NextResponse } from "next/server";
import { evaluateReadiness, type ExtractedExperiment } from "@/lib/experiment";

// Kept as an env var so the model can be swapped without a code change.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are the extraction stage of an AI trading research assistant.

Your only job is to read a natural-language trading research question and pull out
the structured facts that are ACTUALLY stated or clearly implied. You are not the
one who decides whether the experiment is "ready" — a separate rules engine does
that, so do not add a "ready" or "missingInformation" field yourself.

Extract:
- instrument: the market/index/stock being discussed (e.g. "NIFTY 50"). Null if not named.
- timeframe: the bar size the analysis should use (e.g. "Daily", "1-hour intraday"). Null if not stated.
- entry: the precise condition that triggers a trade (e.g. "NIFTY closes down 1% or more versus the previous close"). Null if not stated.
- exit: the precise rule that closes a trade (e.g. "Close at next day's open", "Stop-loss of 2%"). Null if not stated. Do NOT invent one.
- holdingPeriod: an explicit number of bars/days/weeks to hold, ONLY if the user stated one. Null otherwise.
- filters: an array of extra conditions/variables that narrow the analysis (e.g. "high volatility regime", "only Mondays", "only during earnings season"). Empty array if none.
- researchQuestion: a one-sentence restatement of what the user ultimately wants to know (e.g. "Does buying the dip have a statistically meaningful edge, and is that edge stronger in high-volatility regimes?").
- assumptions: an array of small, reasonable clarifying notes worth flagging even though they don't block the analysis (e.g. "Assuming 'fall' refers to a close-to-close percentage move unless stated otherwise"). Empty array if none needed.

Rules:
- NEVER invent a value for entry, exit, holdingPeriod, or instrument that the user did not state or strongly imply. If it's not there, use null.
- "Better" / "edge" / "works" are not metrics — do not fabricate a metric, just capture the plain question in researchQuestion.
- Return ONLY a JSON object with exactly these keys: instrument, timeframe, entry, exit, holdingPeriod, filters, researchQuestion, assumptions. No prose, no markdown fences.`;

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function coerceExtraction(raw: unknown): ExtractedExperiment {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Model did not return a JSON object.");
  }
  const r = raw as Record<string, unknown>;

  const nullableString = (v: unknown): string | null =>
    isString(v) && v.trim().length > 0 ? v.trim() : null;

  const stringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter(isString).map((s) => s.trim()).filter(Boolean) : [];

  return {
    instrument: nullableString(r.instrument),
    timeframe: nullableString(r.timeframe),
    entry: nullableString(r.entry),
    exit: nullableString(r.exit),
    holdingPeriod: nullableString(r.holdingPeriod),
    filters: stringArray(r.filters),
    researchQuestion: nullableString(r.researchQuestion) ?? "",
    assumptions: stringArray(r.assumptions),
  };
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "A research question is required." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured on the server. Add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: question.trim() }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini API request failed (${response.status}): ${details}`);
    }

    const completion = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = completion.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error("Gemini returned an empty response.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Gemini response was not valid JSON.");
      parsed = JSON.parse(match[0]);
    }

    const extracted = coerceExtraction(parsed);
    const experiment = evaluateReadiness(extracted);

    return NextResponse.json(experiment);
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze the research question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
