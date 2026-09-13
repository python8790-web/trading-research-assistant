export default function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#05050a]" />
      <div className="grid-backdrop absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div
        className="glow-orb -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 bg-violet-600/25"
      />
      <div className="glow-orb top-40 -left-32 h-[360px] w-[360px] bg-blue-600/15" />
      <div className="glow-orb top-96 -right-32 h-[360px] w-[360px] bg-emerald-500/10" />
    </div>
  );
}
