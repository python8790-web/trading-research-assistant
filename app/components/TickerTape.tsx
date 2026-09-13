const MOCK_TICKERS = [
  { symbol: "NIFTY 50", value: "24,812.35", change: "+0.42%", up: true },
  { symbol: "BANK NIFTY", value: "51,904.10", change: "-0.18%", up: false },
  { symbol: "SENSEX", value: "81,455.20", change: "+0.37%", up: true },
  { symbol: "INDIA VIX", value: "13.82", change: "+2.10%", up: true },
  { symbol: "USD/INR", value: "83.41", change: "-0.05%", up: false },
  { symbol: "GOLD", value: "2,382.60", change: "+0.61%", up: true },
];

function TickerItem({
  symbol,
  value,
  change,
  up,
}: (typeof MOCK_TICKERS)[number]) {
  return (
    <div className="flex items-center gap-2 px-6 py-2 text-xs whitespace-nowrap">
      <span className="font-mono-data text-slate-400">{symbol}</span>
      <span className="font-mono-data text-slate-200">{value}</span>
      <span
        className={`font-mono-data ${up ? "text-emerald-400" : "text-rose-400"}`}
      >
        {up ? "▲" : "▼"} {change}
      </span>
    </div>
  );
}

export default function TickerTape() {
  const items = [...MOCK_TICKERS, ...MOCK_TICKERS];

  return (
    <div className="w-full overflow-hidden border-b border-white/5 bg-black/40">
      <div className="ticker-track">
        {items.map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
