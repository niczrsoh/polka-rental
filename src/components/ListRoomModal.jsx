import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toUsdc } from "../config/helpers";

export default function ListRoomModal({ onClose }) {
  const { rentalContract, showToast, setLoading, loading } = useWallet();
  const [form, setForm] = useState({ title: "", location: "", rent: "", deposit: "", months: "12" });

  const createListing = async () => {
    if (!rentalContract) return;
    if (!form.title || !form.location || !form.rent || !form.deposit) {
      return showToast("Please fill all fields", "error");
    }

    try {
      setLoading(true);
      const tx = await rentalContract.createListing(
        form.title,
        form.location,
        toUsdc(form.rent),
        toUsdc(form.deposit),
        parseInt(form.months),
        { 
          gasLimit: 3000000 // Substrate/Polkadot EVM nodes sometimes underestimate gas for strings
        }
      );
      await tx.wait();
      showToast("Room listed on-chain! ✅");

      // Ideally trigger a context reload here. In a robust setup, use React Query or pass a refresh prop.
      setTimeout(() => {
        window.location.reload(); // Simple refresh to pick up new listing
      }, 1500);

      onClose();
    } catch (e) {
      showToast(e.reason || "Listing failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-fadeUp overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex justify-between items-center border-b border-slate-800/80">
          <div>
            <h3 className="text-xl font-extrabold text-white">List a Room</h3>
            <p className="font-mono text-xs text-sky-400 mt-1">Stored on Polkadot Testnet</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          <div className="space-y-4">
            {[
              ["Room Title", "title", "text", "e.g. Master Room @ Taman Universiti"],
              ["Location", "location", "text", "e.g. Skudai, Johor"],
              ["Monthly Rent (USDC)", "rent", "number", "e.g. 500"],
              ["Deposit Amount (USDC)", "deposit", "number", "e.g. 1000"]
            ].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-mono">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-mono">
              Duration (Months)
            </label>
            <select
              value={form.months}
              onChange={e => setForm({ ...form, months: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all appearance-none"
            >
              {[3, 6, 9, 12, 18, 24].map(m => (
                <option key={m} value={m}>{m} months</option>
              ))}
            </select>
          </div>

          <div className="bg-sky-950/20 border border-sky-900/30 rounded-xl p-4 text-xs text-sky-200 leading-relaxed font-mono">
            ℹ️ Tenant will lock <strong className="text-sky-400">{form.deposit || "0"} USDC</strong> deposit on-chain. It is strictly held in escrow and returned automatically at the end of the tenancy.
          </div>

          <button
            onClick={createListing}
            disabled={loading}
            className={`w-full py-4 mt-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/25 transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:from-sky-400 hover:to-indigo-400 hover:-translate-y-0.5"}`}
          >
            {loading ? "Processing..." : "⬡ Post Listing On-Chain"}
          </button>
        </div>

      </div>
    </div>
  );
}
