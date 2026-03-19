import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function MintUsdcModal({ onClose }) {
  const { mintUsdc, showToast } = useWallet();
  const [amount, setAmount] = useState("5000");
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showToast("Please enter a valid amount greater than 0", "error");
      return;
    }

    setIsMinting(true);
    await mintUsdc(amount);
    setIsMinting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-fadeUp overflow-hidden">

        {/* Header Hero */}
        <div className="h-32 bg-gradient-to-br from-slate-900 via-green-950/20 to-emerald-950/30 flex flex-col items-center justify-center text-5xl relative rounded-t-3xl border-b border-slate-800/80">
          <div className="animate-bounce mt-2">💸</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Get Demo mUSDC</h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            Since this is on the Polkadot Testnet, you can mint free mUSDC to test the platform.
          </p>

          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                Amount to Mint (mUSDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-slate-600"
                  placeholder="e.g. 5000"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">$</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isMinting}
              className={`w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all ${isMinting ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
                }`}
            >
              {isMinting ? "Minting..." : "Mint Tokens"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
