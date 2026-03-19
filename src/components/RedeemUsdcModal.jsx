import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1.0 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "MYR", symbol: "RM", rate: 4.75 },
  { code: "SGD", symbol: "S$", rate: 1.34 },
  { code: "GBP", symbol: "£", rate: 0.79 },
];

export default function RedeemUsdcModal({ onClose }) {
  const { redeemUsdc, showToast, usdcBalance } = useWallet();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showToast("Please enter a valid amount greater than 0", "error");
      return;
    }
    if (Number(amount) > Number(usdcBalance)) {
      showToast("Insufficient mUSDC balance", "error");
      return;
    }
    if (!bankName.trim() || !accountNumber.trim()) {
      showToast("Please fill in your banking details", "error");
      return;
    }

    setIsRedeeming(true);
    // Simulate the fiat redemption backend request and token burn/transfer
    await redeemUsdc(amount);

    // Calculate final fiat
    const fiatAmount = (Number(amount) * currency.rate).toFixed(2);
    showToast(`Success! ${currency.symbol}${fiatAmount} is being transferred to ${bankName}.`);

    setIsRedeeming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-fadeUp overflow-hidden">

        {/* Header Hero */}
        <div className="h-32 bg-gradient-to-br from-slate-900 via-rose-950/20 to-orange-950/30 flex flex-col items-center justify-center text-5xl relative rounded-t-3xl border-b border-slate-800/80">
          <div className="animate-bounce mt-2">🏦</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Redeem to Bank</h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            Convert your mUSDC back into fiat currency. Funds will be sent to your local bank account.
          </p>

          <form onSubmit={handleRedeem} className="space-y-4">

            {/* Amount and Currency */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Amount (<span className="text-rose-400 font-bold">mUSDC</span>)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max={usdcBalance || "0"}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white font-mono focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-600"
                    placeholder="e.g. 500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">$</span>
                </div>
                <div className="text-right mt-1">
                  <button type="button" onClick={() => setAmount(usdcBalance)} className="text-[10px] text-rose-400 hover:text-white font-mono uppercase tracking-widest font-bold">Max: {usdcBalance} USDC</button>
                </div>
              </div>

              <div className="w-1/3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Currency
                </label>
                <select
                  value={currency.code}
                  onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all appearance-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimated Output */}
            {amount && !isNaN(amount) && (
              <div className="bg-rose-950/10 border border-rose-900/30 p-3 rounded-lg flex justify-between items-center mb-4">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">You Receive:</span>
                <span className="font-mono font-bold text-rose-400">{currency.symbol}{(Number(amount) * currency.rate).toFixed(2)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-600"
                  placeholder="e.g. Maybank, Chase"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-600"
                  placeholder="0000 0000 0000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRedeeming}
              className={`w-full mt-6 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-rose-500/20 transition-all ${isRedeeming ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
                }`}
            >
              {isRedeeming ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
