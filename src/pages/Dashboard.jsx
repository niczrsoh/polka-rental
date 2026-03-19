import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { STATUS, STATUS_COLOR, fmt, formatAgreement } from "../config/helpers";
import AgreementDetailModal from "../components/AgreementDetailModal";

export default function Dashboard({ navigateToBrowse }) {
  const { wallet, rentalContract, usdcContract, showToast, setLoading, loadBalance } = useWallet();
  const [myAgreements, setMyAgs] = useState([]);
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  const loadMyAgreements = async () => {
    if (!rentalContract || !wallet) return;
    try {
      const landlordIds = await rentalContract.getLandlordAgreements(wallet);
      const tenantIds = await rentalContract.getTenantAgreements(wallet);
      const allIds = [...new Set([...landlordIds, ...tenantIds].map(Number))];

      const items = await Promise.all(allIds.map(async id => {
        const a = await rentalContract.getAgreement(id);
        const due = await rentalContract.isRentDue(id).catch(() => false);
        const late = await rentalContract.isRentOverdue(id).catch(() => false);
        const rem = await rentalContract.monthsRemaining(id).catch(() => 0);
        return {
          ...formatAgreement(id, a),
          isDue: due,
          isLate: late,
          remaining: Number(rem)
        };
      }));
      setMyAgs(items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (wallet) loadMyAgreements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  // Actions
  const payRent = async (agreementId, totalRentAmount, monthsToPay) => {
    if (!rentalContract || !usdcContract) return;
    try {
      setLoading(true);
      showToast("Step 1/2: Approving rent amount...", "info");
      const approveTx = await usdcContract.approve(rentalContract.target, totalRentAmount.toString());
      await approveTx.wait();

      showToast("Step 2/2: Paying rent...", "info");
      const tx = await rentalContract.payRent(agreementId, monthsToPay);
      await tx.wait();

      // Wait 2 seconds for the network RPC to sync before fetching new balance and state
      await new Promise(r => setTimeout(r, 2000));
      showToast("Rent paid! Landlord received payment ✅");
      await loadBalance(usdcContract, wallet);
      await loadMyAgreements();
      setSelectedAgreement(null);
    } catch (e) {
      showToast(e.reason || "Rent payment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const endTenancy = async (agreementId) => {
    if (!rentalContract) return;
    try {
      setLoading(true);
      const tx = await rentalContract.requestEndTenancy(agreementId);
      await tx.wait();
      showToast("End tenancy request submitted. Waiting for other party.");
      await loadMyAgreements();
      setSelectedAgreement(null);
    } catch (e) {
      showToast(e.reason || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const raiseDispute = async (agreementId, reason) => {
    if (!rentalContract || !reason.trim()) return showToast("Enter dispute reason", "error");
    try {
      setLoading(true);
      const tx = await rentalContract.raiseDispute(agreementId, reason);
      await tx.wait();
      showToast("Dispute raised. Arbitrator has been notified. ⚠️");
      await loadMyAgreements();
      setSelectedAgreement(null);
    } catch (e) {
      showToast(e.reason || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const respondToDispute = async (_agreementId, response) => {
    if (!response.trim()) return showToast("Enter response", "error");
    try {
      setLoading(true);
      // For the demo: Simulate an on-chain rebuttal
      // In a real app, this would be a contract call
      await new Promise(r => setTimeout(r, 2000));
      showToast("Response submitted to blockchain! ✅");
      setSelectedAgreement(null);
    } catch {
      showToast("Failed to submit response", "error");
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async () => {
    try {
      setLoading(true);
      // For the demo: Simulate landlord accepting fault and releasing deposit
      // In a real app, the landlord would call a function to return the deposit
      await new Promise(r => setTimeout(r, 2000));
      showToast("Deposit released! Tenant will receive it shortly. 💸");
      await loadMyAgreements();
      setSelectedAgreement(null);
    } catch {
      showToast("Failed to resolve", "error");
    } finally {
      setLoading(false);
    }
  };

  const rejectDispute = async () => {
    try {
      setLoading(true);
      // For the demo: Simulate escalation to arbitrator
      await new Promise(r => setTimeout(r, 2000));
      showToast("Dispute rejected. Escalated to arbitrator. ⚖️");
      setSelectedAgreement(null);
    } catch {
      showToast("Failed to reject", "error");
    } finally {
      setLoading(false);
    }
  };



  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 animate-fadeUp">
        <div className="text-6xl mb-4 animate-pulse">🔌</div>
        <div className="text-lg font-bold text-white mb-6">Connect your wallet to view agreements</div>
      </div>
    );
  }

  if (myAgreements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 animate-fadeUp">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-lg font-bold text-white mb-6">No agreements yet</div>
        <button
          onClick={navigateToBrowse}
          className="bg-slate-900 border border-slate-700 hover:border-sky-500 text-sky-400 px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          Browse Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp max-w-[1100px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Rentals</h2>
        <p className="text-slate-400 text-sm font-medium">All rental agreements you're involved in as landlord or tenant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAgreements.map((ag, i) => {
          const isLandlord = ag.landlord?.toLowerCase() === wallet?.toLowerCase();
          const statusLabel = STATUS[ag.status] || "Unknown";
          const statusColor = STATUS_COLOR[statusLabel] || "#64748b";

          return (
            <div
              key={ag.id}
              onClick={() => setSelectedAgreement(ag)}
              className={`bg-slate-900 rounded-2xl p-6 transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1 ${ag.isLate
                ? "border-2 border-red-900/50 shadow-red-900/10"
                : "border border-slate-800 hover:border-sky-500/50 hover:shadow-sky-500/10"
                }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full font-mono tracking-widest border"
                      style={{
                        backgroundColor: `${statusColor}15`,
                        color: statusColor,
                        borderColor: `${statusColor}30`
                      }}
                    >
                      {statusLabel}
                    </span>
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full font-mono tracking-widest border border-slate-700">
                      {isLandlord ? "LANDLORD" : "TENANT"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white leading-snug mb-1 line-clamp-1">{ag.roomTitle}</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-1.5 mb-4 line-clamp-1">
                    <span className="text-sky-500/70">📍</span> {ag.roomLocation}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Monthly Rent</div>
                    <div className="text-lg font-bold text-sky-400 font-mono flex items-center gap-1">
                      {fmt(ag.monthlyRent)} <span className="text-xs text-slate-500 font-sans">mUSDC</span>
                    </div>
                  </div>
                  {ag.isLate && !isLandlord && (
                    <div className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md animate-pulse">
                      PAYMENT OVERDUE
                    </div>
                  )}
                  {ag.isDue && !isLandlord && !ag.isLate && (
                    <div className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">
                      RENT DUE
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAgreement && (
        <AgreementDetailModal
          agreement={selectedAgreement}
          onClose={() => setSelectedAgreement(null)}
          isLandlord={selectedAgreement.landlord?.toLowerCase() === wallet?.toLowerCase()}
          payRent={payRent}
          endTenancy={endTenancy}
          raiseDispute={raiseDispute}
          respondToDispute={respondToDispute}
          resolveDispute={resolveDispute}
          rejectDispute={rejectDispute}
        />
      )}
    </div>
  );
}
