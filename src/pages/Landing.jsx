import { useEffect, useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";

function AnimatedNumber({ value, durationMs = 900 }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = n;
    const delta = target - from;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <>{n}</>;
}

export default function Landing({ navigateToBrowse }) {
  const { wallet, connectWallet } = useWallet();

  const stats = useMemo(() => ([
    { icon: "🔒", label: "Escrow first", val: 100, suffix: "%", sub: "Deposit protection by default" },
    { icon: "⚡", label: "Fast demo flow", val: 4, suffix: " steps", sub: "Connect → Mint → Lock → Pay" },
    { icon: "🧠", label: "AI signals", val: 4, suffix: "", sub: "Risk reasons are explainable" }
  ]), []);

  return (
    <div className="relative overflow-hidden">
      {/* Hero backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-sky-500/10 animate-pulseGlow" />
        <div className="absolute -bottom-32 -right-24 w-[520px] h-[520px] rounded-full bg-indigo-500/10 animate-pulseGlow" />
        <div className="absolute top-24 right-20 w-40 h-40 rounded-full bg-purple-500/10 animate-floatSlow" />
      </div>

      <div className="animate-spotlightIn max-w-[1100px] mx-auto px-6 py-12 md:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left copy */}
          <div>
            <div className="font-mono text-[11px] text-sky-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-sky-500/50"></span>
              Trustless Rentals · Polkadot Testnet EVM
            </div>

            <h1 className="text-[clamp(40px,5vw,72px)] font-extrabold leading-[1.02] tracking-tight mb-6 text-white drop-shadow-sm">
              Rent Smarter.
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                No Scams. Ever.
              </span>
            </h1>

            <p className="text-slate-400 text-lg max-w-xl leading-relaxed font-medium">
              Built for <span className="text-slate-200">Malaysian students</span>: escrow deposits, stablecoin rent,
              and an “AI risk score” that flags suspicious listings with clear reasons.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="button"
                onClick={navigateToBrowse}
                className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-sky-500/25 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Browse Rentals →
              </button>

              {!wallet ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-sky-300 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-3 rounded-xl text-sm font-bold">
                  Wallet connected
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              {[
                ["🔒", "Escrow Protected"],
                ["💵", "Stablecoin Peg"],
                ["🧠", "AI Risk Score"],
                ["🔍", "Transparent On-chain"]
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-slate-900/50 border border-slate-800/60 px-4 py-2 rounded-xl backdrop-blur-sm hover:border-slate-700 transition-colors"
                >
                  <span className="text-lg">{icon}</span>
                  <span className="font-mono text-xs text-slate-300 font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right “demo card” */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl rounded-[36px]" />
            <div className="relative bg-slate-900/70 border border-slate-800 rounded-[32px] p-7 md:p-8 shadow-2xl overflow-hidden">
              <div className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-sky-500/10 animate-floatSlow" />
              <div className="absolute -bottom-24 -left-28 w-80 h-80 rounded-full bg-indigo-500/10 animate-floatSlow" />

              <div className="relative">
                <div className="font-mono text-[11px] text-purple-300 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-purple-500/50"></span>
                  About PolkaRental
                </div>

                <div className="space-y-4">
                  {[
                    { t: "AI Scam Risk", d: "A risk score + reasons on each listing and modal." },
                    { t: "Stablecoin Escrow", d: "Deposit is locked on-chain — no middleman." },
                    { t: "Why Polkadot", d: "Low fees for monthly rent payments + EVM compatibility for fast shipping." }
                  ].map((x) => (
                    <div key={x.t} className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4 hover:bg-slate-800/40 transition-colors">
                      <div className="text-white font-bold">{x.t}</div>
                      <div className="text-slate-400 text-sm mt-1">{x.d}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="font-mono text-xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent tabular-nums">
                        <AnimatedNumber value={s.val} />
                        {s.suffix}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                      <div className="text-xs text-slate-400 mt-2">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Commitment (condensed, landing-friendly) */}
        <div className="mt-14 bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800/80 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[90px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[90px]" />

          <div className="relative">
            <h2 className="text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
              <span className="text-purple-400">🧭</span> Vision & Commitment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { phase: "Now", title: "Escrow rentals on-chain", desc: "Rent + deposit protection with transparent status." },
                { phase: "Next", title: "Reputation & verification", desc: "Reputation + optional verification for higher trust." },
                { phase: "Soon", title: "Dispute resolution flow", desc: "Evidence submission + structured resolutions." },
                { phase: "Future", title: "AI trust layer", desc: "Risk scoring, reminders, and contract explainers." }
              ].map((m) => (
                <div key={m.title} className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <div className="text-white font-bold text-sm">{m.title}</div>
                    <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-300 border-purple-500/20">
                      {m.phase}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 leading-relaxed">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

