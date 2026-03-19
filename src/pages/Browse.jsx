import { useMemo, useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { DEMO_LISTINGS } from "../config/contracts";
import { STATUS, fmt, shortAddr, formatAgreement } from "../config/helpers";
import { buildRiskContext, scoreListingRisk } from "../config/aiRisk";
import { fetchClaudeRiskScores } from "../config/aiRiskService";
import RoomDetailModal from "../components/RoomDetailModal";

export default function Browse({ navigateToDashboard }) {
  const { rentalContract } = useWallet();
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [selected, setSelected] = useState(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [aiRiskById, setAiRiskById] = useState(new Map());
  const [aiRiskStatus, setAiRiskStatus] = useState("idle"); // idle | loading | ready | error

  // Load listings from chain
  useEffect(() => {
    const loadListings = async () => {
      if (!rentalContract) return;
      try {
        setLoadingListings(true);
        const ids = await rentalContract.getPendingListings();
        const items = await Promise.all(ids.map(async id => {
          const a = await rentalContract.getAgreement(id);
          return formatAgreement(id, a);
        }));
        if (items.length > 0) setListings(items);
      } catch {
        console.error("Could not load from chain, using demo data.");
      } finally {
        setLoadingListings(false);
      }
    };
    loadListings();
  }, [rentalContract]);

  const riskById = useMemo(() => {
    const ctx = buildRiskContext(listings);
    const m = new Map();
    for (const l of listings) {
      const fromClaude = aiRiskById.get(l.id);
      m.set(l.id, fromClaude || scoreListingRisk(l, ctx));
    }
    return m;
  }, [listings, aiRiskById]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setAiRiskStatus("loading");
        const payload = listings.map((l) => ({
          id: l.id,
          roomTitle: l.roomTitle,
          roomLocation: l.roomLocation,
          monthlyRent: l.monthlyRent,
          depositAmount: l.depositAmount,
          durationMonths: l.durationMonths,
          landlord: l.landlord
        }));
        const out = await fetchClaudeRiskScores(payload);
        if (cancelled) return;

        const m = new Map();
        for (const r of out?.results || []) {
          if (r?.id === undefined || r?.id === null) continue;
          m.set(Number(r.id), {
            score: Number(r.score) || 0,
            level: r.level || "Low",
            reasons: Array.isArray(r.reasons) ? r.reasons : [],
            source: r.source || "claude",
            model: r.model
          });
        }
        setAiRiskById(m);
        setAiRiskStatus("ready");
      } catch {
        if (!cancelled) setAiRiskStatus("error");
      }
    };

    // Only run when we have listings to score.
    if (listings.length > 0) run();
    return () => { cancelled = true; };
  }, [listings]);

  return (
    <div className="animate-fadeUp max-w-[1100px] mx-auto px-6 py-10">
      <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Browse Rentals</h2>
          <p className="text-slate-400 text-sm font-medium">
            Explore available rooms. Each listing includes an “AI risk score” with explainable reasons.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
          <span className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            Network: <span className="text-slate-300">Polkadot Testnet</span>
          </span>
          <span className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            AI Risk Score:{" "}
            <span className="text-slate-300">
              {aiRiskStatus === "loading" ? "Claude analyzing…" : aiRiskStatus === "ready" ? "Claude" : "Offline fallback"}
            </span>
          </span>
        </div>
      </div>

      {/* Listings Grid */}
      {loadingListings ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-slate-950" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-800 rounded" />
                <div className="h-8 w-full bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="text-6xl mb-4">🕵️‍♂️</div>
          <div className="text-lg font-bold text-white mb-2">No listings found</div>
          <div className="text-sm text-slate-400 font-medium">Try again in a moment, or switch back to demo data.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item, i) => {
          const isAvailable = item.status === 0 || item.status === "0" || item.status === "PENDING";
          const risk = riskById.get(item.id);
          const riskLabel = risk?.level || "Low";
          const riskScore = risk?.score ?? 0;
          const riskUi = riskLabel === "High"
            ? { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" }
            : riskLabel === "Medium"
              ? { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" }
              : { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };

          return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              type="button"
              className="text-left group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:ring-offset-2 focus:ring-offset-slate-950"
              style={{ animationDelay: `${i * 0.05}s` }}
              aria-label={`Open listing ${item.roomTitle}. AI risk ${riskLabel} ${riskScore} out of 100.`}
            >
              {/* Card Image Placeholder */}
              <div className="h-40 relative flex items-center justify-center text-5xl bg-slate-950 overflow-hidden">
                {/* Dynamic Gradient Background */}
                <div
                  className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
                  style={{ background: `linear-gradient(135deg, #0f172a 0%, #0c4a6e ${30 + (i * 15)}%, #1e1b4b 100%)` }}
                />
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">🏠</span>

                <div className="absolute top-3 right-3 z-20">
                  <span className={`font-mono text-[10px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg ${isAvailable
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                    {isAvailable ? "AVAILABLE" : STATUS[item.status] || "ACTIVE"}
                  </span>
                </div>

                <div className="absolute top-3 left-3 z-20">
                  <span
                    className={`font-mono text-[10px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg ${riskUi.bg} ${riskUi.text} ${riskUi.border}`}
                    title={(risk?.reasons || []).join(" ")}
                  >
                    AI RISK: {riskLabel.toUpperCase()} · {riskScore}
                  </span>
                </div>
              </div>

              <div className="p-6 relative">
                {/* Magical glow effect on hover */}
                <div className="absolute -inset-x-6 -bottom-6 h-12 bg-gradient-to-t from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                <div className="text-lg font-bold text-white mb-2 leading-snug line-clamp-1 relative z-10">
                  {item.roomTitle}
                </div>
                <div className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 relative z-10">
                  <span className="text-sky-500/70 text-xs">📍</span> {item.roomLocation}
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <div className="font-mono text-2xl font-extrabold text-sky-400 tabular-nums tracking-tight">
                      {fmt(item.monthlyRent)}
                      <span className="text-xs text-sky-400/50 ml-1 font-sans font-medium">mUSDC/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Deposit: {fmt(item.depositAmount)} mUSDC
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded inline-block mb-1">
                      {item.durationMonths} months
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono block">
                      {shortAddr(item.landlord)}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        </div>
      )}

      {/* Render Modal */}
      {selected && (
        <RoomDetailModal
          selected={selected}
          onClose={() => setSelected(null)}
          navigateToDashboard={navigateToDashboard}
          risk={riskById.get(selected.id)}
        />
      )}
    </div>
  );
}
