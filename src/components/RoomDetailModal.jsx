import { useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { fmt, shortAddr } from "../config/helpers";

export default function RoomDetailModal({ selected, onClose, navigateToDashboard, risk }) {
  const { wallet, connectWallet, rentalContract, usdcContract, showToast, setLoading, loadBalance, loading, usdcBalance } = useWallet();

  const depositAmountFmt = Number(fmt(selected.depositAmount));
  const hasEnoughBalance = Number(usdcBalance) >= depositAmountFmt;

  // 1. PAS estimation calculation
  // The only action a tenant physically executes upfront is acceptListing().
  // Which involves an approve() + acceptListing(). Let's roughly estimate 0.05 PAS / tx.
  const estimatedPasForLock = "0.10"; // Approx 2 transactions

  const acceptListing = async () => {
    if (!rentalContract || !usdcContract) return;
    try {
      setLoading(true);
      showToast("Step 1/2: Approving stablecoin...");
      const approveTx = await usdcContract.approve(
        rentalContract.target,
        selected.depositAmount.toString()
      );
      await approveTx.wait();

      showToast("Step 2/2: Locking deposit in escrow...");
      const tx = await rentalContract.acceptListing(selected.id);
      await tx.wait();

      // Wait 2 seconds for the network RPC to sync before fetching new balance
      await new Promise(r => setTimeout(r, 2000));
      await loadBalance(usdcContract, wallet);
      showToast("Deposit locked! Tenancy is now ACTIVE 🔒");

      if (navigateToDashboard) {
        navigateToDashboard();
      }

      onClose();
    } catch (e) {
      showToast(e.reason || "Failed to accept", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!selected) return null;

  const riskLabel = risk?.level || "Low";
  const riskScore = risk?.score ?? 0;
  const riskModel = risk?.model;
  const riskSource = risk?.source || "heuristic";
  const riskUi = riskLabel === "High"
    ? { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/20" }
    : riskLabel === "Medium"
      ? { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/20" }
      : { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-start justify-center">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl animate-fadeUp overflow-y-auto max-h-[calc(100vh-12rem)]">

        {/* Header Hero */}
        <div className="h-48 bg-gradient-to-br from-slate-900 via-sky-950/20 to-indigo-950/30 flex flex-col items-center justify-center text-7xl relative rounded-t-3xl border-b border-slate-800/80">
          <div className="animate-bounce">🏠</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white mb-1.5 leading-tight">{selected.roomTitle}</h2>
            <div className="text-sm text-slate-400 flex items-center gap-1.5">
              <span className="text-sky-400">📍</span> {selected.roomLocation}
            </div>
          </div>

          {/* AI Risk Block */}
          <div className={`rounded-2xl p-5 mb-6 border ${riskUi.bg} ${riskUi.border}`}>
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-300">
                AI Scam Risk & Listing Quality
              </div>
              <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border ${riskUi.bg} ${riskUi.text} ${riskUi.border}`}>
                {riskLabel.toUpperCase()} · {riskScore}/100
              </span>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed">
              {(risk?.reasons || []).slice(0, 4).map((r) => (
                <div key={r} className="flex gap-2">
                  <span className={riskLabel === "High" ? "text-red-300" : riskLabel === "Medium" ? "text-yellow-300" : "text-emerald-300"}>
                    •
                  </span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 mt-3">
              {riskSource === "claude"
                ? `Powered by Claude${riskModel ? ` (${riskModel})` : ""} using listing metadata.`
                : "Offline fallback score generated from listing metadata."}
            </div>
          </div>

          <div className="flex items-end gap-3 mb-2">
            <div className="font-mono text-4xl font-extrabold text-sky-400 tracking-tight">
              {fmt(selected.monthlyRent)}
            </div>
            <div className="text-sm text-slate-400 font-semibold mb-1">
              mUSDC <span className="text-slate-500">/ month</span>
            </div>
          </div>

          <div className="font-mono text-xs text-slate-400 mb-6 bg-slate-950/50 inline-block px-3 py-1.5 rounded-lg border border-slate-800/50">
            Deposit: <span className="text-sky-400 font-bold">{fmt(selected.depositAmount)} mUSDC</span> • {selected.durationMonths} months
          </div>

          {/* Education Block */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-5 mb-6 border border-slate-800/60 shadow-inner">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Why stablecoin deposit?
            </div>
            <div className="text-slate-300 text-sm leading-relaxed">
              Your <strong className="text-sky-400 font-mono">{fmt(selected.depositAmount)} mUSDC</strong> deposit is mathematically locked in a smart contract. In {selected.durationMonths} months, you receive <strong className="text-white">exactly {fmt(selected.depositAmount)} USDC</strong> back. Native tokens would fluctuate in value.
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              ["Landlord", shortAddr(selected.landlord)],
              ["Duration", `${selected.durationMonths} months`],
              ["Monthly Rent", `${fmt(selected.monthlyRent)} mUSDC`],
              ["Deposit", `${fmt(selected.depositAmount)} mUSDC`]
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">{k}</div>
                <div className="text-sm font-bold text-sky-400 font-mono">{v}</div>
              </div>
            ))}
          </div>

          {/* PAS Gas tracking info for Guest/Tenant pre-rent */}
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-xs text-slate-400 font-medium">Estimated Network Fee:</span>
            <span className="text-xs font-mono font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
              ~{estimatedPasForLock} PAS
            </span>
          </div>

          {wallet ? (
            <button
              onClick={acceptListing}
              disabled={loading || !hasEnoughBalance}
              className={`w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-sky-500/25 transition-all duration-300 flex flex-col items-center justify-center gap-1 group ${(loading || !hasEnoughBalance) ? "opacity-50 cursor-not-allowed grayscale" : "hover:from-sky-400 hover:to-indigo-400 hover:-translate-y-0.5"}`}
            >
              <div className="flex items-center gap-2 text-base">
                {!loading && <span className="group-hover:scale-110 transition-transform">{!hasEnoughBalance ? "⚠️" : "🔒"}</span>}
                {loading ? "Processing Transaction..." : !hasEnoughBalance ? "Insufficient mUSDC Balance" : "Lock Deposit & Start Tenancy"}
              </div>
              <div className="font-mono text-[10px] text-sky-100/70 uppercase tracking-widest">
                Requires {depositAmountFmt} mUSDC (You have {usdcBalance || "0"})
              </div>
            </button>
          ) : (
            <button
              onClick={() => { onClose(); connectWallet(); }}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-sky-400 p-4 rounded-xl font-bold transition-all duration-300 shadow-lg"
            >
              Connect Wallet to Rent
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
