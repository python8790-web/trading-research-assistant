# Nexus Research — AI Trading Research Assistant (Prototype)

A small prototype that takes a natural-language trading research question
(e.g. *"Does buying NIFTY after a 1% fall work better during high-volatility
periods?"*) and turns it into a structured, testable experiment — asking for
clarification when something important is missing, rather than guessing.

This covers the four steps asked for in the assignment brief:

1. **Understand the question** — extract instrument, timeframe, entry, exit,
   holding period, filters, and the underlying research question.
2. **Structure it as an experiment** — a clean spec with a readiness state.
3. **Identify missing information** — the system asks, it doesn't assume.
4. **Show the final experiment** — a readable spec, plus (bonus) the JSON
   payload that would be handed to a real backtesting engine, and a
   simulated Step 3 result so the full loop is visible end to end.

---

## Live flow

```
Question (plain English)
   │
   ▼
POST /api/analyze  ──────────────►  Gemini extracts raw fields (JSON)
  │                                 (instrument, timeframe, entry, exit,
  │                                  holdingPeriod, filters, researchQuestion,
  │                                  assumptions)
lib/experiment.ts  ──────────────►  Deterministic rules engine decides what's
   │                                 missing and whether the experiment is
   │                                 "ready" — the LLM is never trusted with
   │                                 that judgement call.
   ▼
UI renders:
   Step 1 "What we understood"
   → clarification prompts for anything missing (quick-pick + free text)
   → Step 2 "Experiment specification" (+ backtest payload preview)
   → "Challenge this experiment" (research-integrity checklist)
   → Step 3 "Backtest results" (simulated, clearly labeled)
```

## Architecture

```
app/
  api/analyze/route.ts     API route: calls the LLM, validates its output,
    TickerTape.tsx          Decorative mock market ticker (clearly labeled demo).
    GlowBackground.tsx       Ambient background glow.
    UnderstoodCard.tsx        Step 1 — raw extraction.
    ClarificationPanel.tsx    Generic missing-field Q&A (chips + free text).
    ExperimentSpec.tsx        Step 2 — spec, metrics, backtest payload, run button.
  cp .env.example .env.local   # then add your GEMINI_API_KEY
    BacktestResults.tsx        Step 3 — simulated backtest output.
    HistoryPanel.tsx           Recent-questions sidebar (localStorage).
  | `GEMINI_API_KEY` | Yes      | Server-side only; never exposed to the client. |
  | `GEMINI_MODEL`   | No       | Defaults to `gemini-3.6-flash`.               |
    DataField.tsx               Small display primitive.

  3. Add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) under Project → Settings → Environment Variables.
lib/
  experiment.ts    Types + FIELD_PROMPTS + evaluateReadiness() + applyAnswer()
                    + toBacktestPayload(). The domain model — see below.
  mockBacktest.ts   Deterministic pseudo-backtest numbers for the Step 3 demo.
  history.ts        localStorage-backed history of past questions.
```

### Why extraction and "readiness" are two separate steps

The LLM is asked to do **one job only**: pull structured fields out of the
question. It is explicitly told *not* to decide what's missing or whether
the experiment is ready.

A plain TypeScript function (`evaluateReadiness` in `lib/experiment.ts`)
owns that decision instead: instrument, timeframe, and entry are always
required; exit *or* holding period satisfies "how does the trade end"
(one implies the other). If either extraction quality drifts across model
versions/providers or the LLM gets chatty about edge cases, the definition
of "ready" doesn't silently change with it. It's also unit-testable without
ever calling the model, and it's what actually renders the clarification UI
(each missing field carries its own question + quick-pick options + whether
free text is allowed) — so adding a new required field later is a one-line
change in `FIELD_PROMPTS`, not a prompt-engineering exercise.

This is the main "AI implementation" decision worth calling out: **the model
is used for the part only a model can do (turning fuzzy language into
structured facts) and nothing else.** Gap detection, the readiness gate, the
research-integrity checklist, and the demo backtest are all deterministic
code — cheaper, faster, and don't depend on the model behaving consistently
call to call.

### Handling ambiguity

- The extraction prompt explicitly forbids inventing a value for entry,
  exit, holding period, or instrument — if it isn't stated, it comes back
  `null`.
- Every missing field renders as its own clarification card: quick-pick
  chips for the common cases (e.g. holding period → 1/3/5/10/20 days) *and*
  a free-text fallback, so the user is never boxed in by the presets.
- Answering a field re-runs `evaluateReadiness` client-side — no round trip
  to the model needed to know the experiment just became ready.
- Non-blocking observations (e.g. "'edge' needs a metric", "no filter is
  applied") surface separately in the "Challenge this experiment" card so
  they don't stop the user, but aren't hidden either.

## Technologies used

- **Next.js 16 (App Router) + TypeScript** — API route + React UI in one deployable app.
- **Google Gemini API** (`gemini-3.6-flash` by default, via the Gemini REST API) for the extraction step.
- **Tailwind CSS v4** for styling — no component library, to keep the dark/glow theme fully custom.
- **Browser `localStorage`** for the "recent questions" panel — a placeholder for the "remember what it learned" capability described in the brief; a real version would persist per-user in a database.

No backend database was introduced for this scope — there's no durable
state to persist yet beyond "what did the user ask before," which
`localStorage` covers honestly for a prototype.

## Design decisions

- **Dark, glow-accented fintech look** rather than a green-on-black terminal
  pastiche — closer to how modern trading/fintech products (Bloomberg-style
  terminals aside) actually present themselves today: glassmorphic cards,
  soft violet/blue ambient glow, a monospace font reserved for *data*
  (prices, JSON, field values) while headings and body copy stay in a clean
  sans-serif. The mock ticker tape at the top is explicitly labeled as demo
  data in the header pill — it's decorative, not implying a live feed.
- **The "Run research experiment" step is intentionally fake and says so.**
  Building a real backtesting engine was explicitly out of scope for this
  assignment; pretending otherwise would misrepresent what was built. The
  bonus is demonstrated instead by exposing the exact JSON payload
  (`toBacktestPayload`) a real engine would consume.
- **Chip + free-text clarification, not a chat back-and-forth.** A chat
  interface would satisfy "ask for missing info" too, but a form-like
  clarification panel is faster to resolve, easier to validate, and keeps
  the structured spec visible the whole time — closer to what a researcher
  actually wants when iterating on an experiment definition.

## AI tools used (per submission instructions)

- **Claude** was used to review the existing half-built prototype (Next.js
  scaffold, initial `page.tsx`/`route.ts`), finish the remaining product
  requirements (deterministic missing-field detection, clarification UI,
  challenge/critique card, backtest payload preview, history panel), fix a
  broken model name in the original API call, and restyle the UI to the
  dark/glow fintech direction requested.
- **What was reviewed/modified rather than taken as-is:** the original API
  route mixed extraction and readiness-decision into a single LLM call and
  referenced a non-existent model string — this was split into the
  two-stage architecture described above and pointed at a current Gemini
  model (`gemini-3.6-flash`, configurable via `GEMINI_MODEL`). All
  generated code was read through, type-checked (`tsc --noEmit`) and linted
  (`eslint`) before being included here.
- **What to personally verify before submitting:** re-run the app against a
  handful of your own test questions (including ones missing multiple
  fields at once) and confirm the extraction quality meets your bar — model
  behavior is the one part of this that can't be fully guaranteed by
  type-checking.

## Running locally

```bash
npm install
# create .env.local and add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable          | Required | Purpose                                      |
|--------------------|----------|-----------------------------------------------|
| `GEMINI_API_KEY`   | Yes      | Server-side only; never exposed to the client. |
| `GEMINI_MODEL`     | No       | Defaults to `gemini-3.6-flash`.               |

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) under Project → Settings → Environment Variables.
4. Deploy — no other configuration needed.

## What I'd improve with more time

- **Real backtesting engine.** `toBacktestPayload()` already defines the
  contract; the natural next step is a small service that takes that
  payload, pulls historical OHLC data for the instrument, and actually
  simulates the entries/exits instead of returning seeded mock numbers.
- **Persist history server-side**, keyed by user, instead of `localStorage`
  — this is the real foundation for "remember what it learned" (e.g.
  surfacing "you asked something similar last month, here's what you found").
   That's memory of *questions*; a further step is memory of *results* —
  storing which experiments were actually run and what they showed, so a
  later question like "does this still hold?" can be answered against past
  findings rather than starting from zero.
- **Multi-turn clarification via conversation**, not just single-field
  answers — e.g. letting the user say "make it 2%, not 1%" and re-parsing
  the whole question rather than only patching one field at a time.
- **Confidence surfacing.** Right now a field is either present or missing;
  a richer version would flag fields the model is guessing at (e.g. "entry"
  inferred from vague phrasing) so the user can double check them even when
  the experiment is technically "ready."
- **Automated tests** for `evaluateReadiness`/`applyAnswer` — they're pure
  functions and were designed to be trivially unit-testable, but no test
  runner was wired into this scope.
