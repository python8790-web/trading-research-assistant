export default function DataField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs tracking-wider text-slate-500 uppercase">{label}</p>
      <p
        className={`font-mono-data mt-2 text-sm leading-6 ${
          value ? "text-slate-100" : "text-amber-400/80"
        }`}
      >
        {value || "— not specified —"}
      </p>
    </div>
  );
}
