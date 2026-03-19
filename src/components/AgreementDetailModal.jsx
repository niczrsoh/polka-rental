import React, { useState } from "react";
import { STATUS, STATUS_COLOR, fmt, shortAddr, getExplorerUrl } from "../config/helpers";
import { CONFIG } from "../config/contracts";
import { useWallet } from "../context/WalletContext";

export default function AgreementDetailModal({
  agreement,
  onClose,
  isLandlord,
  payRent,
  endTenancy,
  raiseDispute,
  respondToDispute,
  resolveDispute,
  rejectDispute
}) {
  const { loading, usdcBalance } = useWallet();
  const [disputeReasonLocal, setDisputeReasonLocal] = useState("");
  const [landlordResponse, setLandlordResponse] = useState("");
  const [monthsToPay, setMonthsToPay] = useState(1);

  if (!agreement) return null;

  const maxMonthsToPay = Number(agreement.durationMonths) - Number(agreement.rentPaidCount);

  const statusLabel = STATUS[agreement.status] || "Unknown";
  const statusColor = STATUS_COLOR[statusLabel] || "#64748b";

  // Calculate rent due day
  let rentDueDayText = "Not Started";
  if (agreement.startTimestamp && Number(agreement.startTimestamp) > 0) {
    const startObj = new Date(Number(agreement.startTimestamp) * 1000);
    rentDueDayText = `Day ${startObj.getDate()} of each month`;
  }

  // Estimation constant
  const ESTIMATED_PAS_PER_RENT = 0.05;
  const ESTIMATED_PAS_ACCEPT = 0.10;

  let estimatedPas = 0;
  if (agreement.status >= 1) { // ACTIVE or greater
    estimatedPas += ESTIMATED_PAS_ACCEPT; // Accepted listing
    estimatedPas += (Number(agreement.rentPaidCount) * ESTIMATED_PAS_PER_RENT); // Rent paid txs
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-start justify-center px-4 pt-24 pb-2">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl animate-fadeUp overflow-y-auto max-h-[calc(100vh-12rem)]">

        {/* Header Hero */}
        <div className="h-40 bg-gradient-to-br from-slate-900 via-sky-950/30 to-indigo-950/30 flex flex-col items-center justify-center text-6xl relative rounded-t-3xl border-b border-slate-800/80">
          <div className="animate-bounce mt-4">📋</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1.5 leading-tight">{agreement.roomTitle}</h2>
              <div className="text-sm text-slate-400 flex items-center gap-1.5 mb-2">
                <span className="text-sky-400">📍</span> {agreement.roomLocation}
              </div>
              <a
                href={getExplorerUrl(CONFIG.RENTAL_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/30 px-3 py-1 rounded-lg border border-indigo-900/50 transition-colors"
              >
                <span>🔍</span> View Contract on Blockscout
              </a>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full font-mono tracking-widest border"
                style={{
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                  borderColor: `${statusColor}30`
                }}
              >
                {statusLabel}
              </span>
              <span className="bg-slate-800 text-slate-400 text-[11px] font-bold px-3 py-1.5 rounded-full font-mono tracking-widest border border-slate-700">
                {isLandlord ? "YOU ARE LANDLORD" : "YOU ARE TENANT"}
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <div className="font-mono text-4xl font-extrabold text-sky-400 tracking-tight">
              {fmt(agreement.monthlyRent)}
            </div>
            <div className="text-sm text-slate-400 font-semibold mb-1">
              USDC <span className="text-slate-500">/ month</span>
            </div>
          </div>

          {/* New Rent Due Day Info */}
          <div className="bg-gradient-to-r from-sky-950/30 to-indigo-950/30 p-4 rounded-xl border border-sky-900/30 mb-6 flex items-center gap-3">
            <div className="text-2xl">📅</div>
            <div>
              <div className="text-xs text-sky-400 font-mono font-bold uppercase tracking-widest mb-0.5">Rent Schedule</div>
              <div className="text-sm text-slate-200">Rent is due on: <strong className="text-white">{rentDueDayText}</strong></div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[
              ["Landlord", shortAddr(agreement.landlord)],
              ["Tenant", agreement.tenant && agreement.tenant !== "0x0000000000000000000000000000000000000000" ? shortAddr(agreement.tenant) : "Pending"],
              ["Deposit", `${fmt(agreement.depositAmount)} USDC`],
              ["Duration", `${agreement.durationMonths} months`],
              ["Paid Months", `${agreement.rentPaidCount}/${agreement.durationMonths}`],
              ["Remaining", `${agreement.remaining || 0} mo`],
              ["Total Est. Network Fee ✨", `~${estimatedPas.toFixed(2)} PAS`]
            ].map(([k, v], idx) => (
              <div key={k} className={`bg-slate-950/60 rounded-xl p-3 border ${idx === 6 ? 'border-sky-900/30 col-span-2 md:col-span-3' : 'border-slate-800/40'}`}>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">{k}</div>
                <div className={`text-sm md:text-base font-bold font-mono ${idx === 6 ? 'text-green-400 text-center' : 'text-sky-400'}`}>{v}</div>
              </div>
            ))}
          </div>

          {/* Demo happy-path cue */}
          {/* {tenantPending && isLandlord && (
            <div className="bg-amber-950/25 border border-amber-900/40 rounded-xl p-4 mb-6">
              <div className="text-xs text-amber-300 font-mono font-bold uppercase tracking-widest mb-1">
                Demo tip (2 wallets)
              </div>
              <div className="text-sm text-slate-200 leading-relaxed">
                This agreement is <span className="font-bold text-white">waiting for a tenant</span>. For an end-to-end demo:
                switch to a second wallet → go to Browse → open the listing → click <span className="font-bold">“Lock Deposit & Start Tenancy”</span>.
              </div>
              {navigateToBrowse && (
                <button
                  type="button"
                  onClick={() => { onClose(); navigateToBrowse(); }}
                  className="mt-3 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-800/40 text-amber-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Go to Browse →
                </button>
              )}
            </div>
          )} */}

          {/* Action Buttons */}
          {statusLabel === "Active" && (
            <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-slate-800/50">

              {!isLandlord && maxMonthsToPay > 0 && (
                <div className="flex flex-col gap-2 w-full mb-2 bg-sky-950/20 p-4 rounded-xl border border-sky-900/30">
                  <div className="text-xs text-sky-400/80 font-mono mb-1 uppercase tracking-wider">Pay Rent</div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="1"
                        max={maxMonthsToPay}
                        value={monthsToPay}
                        onChange={e => setMonthsToPay(Number(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                      <div className="text-xs text-slate-400 mt-1 text-center font-mono">
                        {monthsToPay} month{monthsToPay > 1 ? 's' : ''}
                      </div>
                    </div>
                    {(() => {
                      const totalRentBI = BigInt(agreement.monthlyRent) * BigInt(monthsToPay);
                      const totalRentFmt = Number(fmt(totalRentBI.toString()));
                      const hasEnoughBalance = Number(usdcBalance) >= totalRentFmt;

                      return (
                        <button
                          onClick={() => payRent(agreement.id, totalRentBI.toString(), monthsToPay)}
                          disabled={loading || !hasEnoughBalance}
                          className={`sm:flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 transition-all whitespace-nowrap text-center ${(loading || !hasEnoughBalance) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-sky-400 hover:to-indigo-400 hover:-translate-y-0.5'}`}
                        >
                          {loading ? "⏳ Processing..." : !hasEnoughBalance ? `⚠️ Insufficient Balance (Need ${totalRentFmt})` : `💸 Pay (${totalRentFmt} mUSDC)`}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => endTenancy(agreement.id)}
                  disabled={loading}
                  className={`flex-1 min-w-[200px] bg-slate-900 border border-slate-700 text-slate-300 px-5 py-3 rounded-xl text-sm font-bold transition-all text-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600 hover:text-white'}`}
                >
                  {loading ? "Processing..." : "🚪 Request End Tenancy"}
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-2 bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                <div className="text-xs text-red-400/80 font-mono mb-1 uppercase tracking-wider">Raise a dispute</div>
                <div className="flex gap-2">
                  <input
                    value={disputeReasonLocal}
                    onChange={e => setDisputeReasonLocal(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-sans"
                  />
                  <button
                    onClick={() => {
                      raiseDispute(agreement.id, disputeReasonLocal);
                      setDisputeReasonLocal("");
                    }}
                    disabled={loading}
                    className={`bg-red-900/40 border border-red-900/50 text-red-300 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900/80 hover:text-red-100'}`}
                  >
                    {loading ? "Processing..." : "⚠️ Submit Dispute"}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2 bg-red-950/20 p-4 rounded-xl border border-red-900/30"></div>
            </div>
          )}

          {statusLabel === "Disputed" && (
            <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 mt-6 mb-20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="text-sm text-red-300 font-medium pl-2">
                ⚠️ Dispute raised by <span className="font-mono bg-red-950 px-2 py-0.5 rounded">{shortAddr(agreement.disputeRaisedBy)}</span> — awaiting arbitrator resolution
                <div className="mt-3 bg-red-950/50 p-3 rounded text-red-400 italic font-serif">"{agreement.disputeReason}"</div>
              </div>

              {/* Landlord Response Section */}
              {isLandlord && (
                <div className="mt-6 pt-6 border-t border-red-900/30">
                  <div className="text-xs text-red-400 font-mono font-bold uppercase tracking-widest mb-3">Landlord Response</div>
                  <textarea
                    value={landlordResponse}
                    onChange={(e) => setLandlordResponse(e.target.value)}
                    placeholder="Describe your response or proposed resolution..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-sans min-h-[100px] mb-4"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        respondToDispute(agreement.id, landlordResponse);
                        setLandlordResponse("");
                      }}
                      disabled={loading || !landlordResponse.trim()}
                      className={`flex-1 bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${loading || !landlordResponse.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 hover:border-slate-600'}`}
                    >
                      {loading ? "Processing..." : "💬 Submit Response"}
                    </button>
                    <button
                      onClick={() => resolveDispute(agreement.id)}
                      disabled={loading}
                      className={`flex-1 bg-emerald-900/40 border border-emerald-900/50 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-900/60 hover:text-emerald-100'}`}
                    >
                      {loading ? "Processing..." : "✓ Resolve & Release Deposit"}
                    </button>
                    <button
                      onClick={() => rejectDispute(agreement.id)}
                      disabled={loading}
                      className={`flex-1 bg-red-900/40 border border-red-900/50 text-red-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900/60 hover:text-red-100'}`}
                    >
                      {loading ? "Processing..." : "✗ Reject Dispute"}
                    </button>
                  </div>
                </div>
              )}
              <div >

              </div>
            </div>
          )}

          {(statusLabel === "Ended" || statusLabel === "Resolved") && (
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 mt-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div className="text-sm text-emerald-300 font-medium pl-2 flex items-center gap-2">
                ✅ Tenancy completed — deposit automatically processed by smart contract.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
