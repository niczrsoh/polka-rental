import { useEffect, useRef, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { shortAddr } from "../config/helpers";
import ListRoomModal from "./ListRoomModal";
import MintUsdcModal from "./MintUsdcModal";
import RedeemUsdcModal from "./RedeemUsdcModal";

export default function Navbar({ page, setPage }) {
  const { wallet, usdcBalance, connectWallet, disconnectWallet } = useWallet();
  const [showListForm, setShowList] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
  const balanceRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!showBalanceDropdown) return;
      const el = balanceRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setShowBalanceDropdown(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [showBalanceDropdown]);

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-col w-full shadow-md">
        {/* Polkadot Top Banner */}
        <div className="bg-[#E6007A]/10 backdrop-blur-md text-center py-1.5 px-4 border-b border-[#E6007A]/20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E6007A] animate-pulse"></div>
          <span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">
            Testnet Environment • 
          </span>
          <a
            href="https://blockscout-testnet.polkadot.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-white hover:text-[#E6007A] bg-[#E6007A]/20 hover:bg-[#E6007A]/30 px-2 py-0.5 rounded transition-colors inline-flex items-center gap-1 uppercase tracking-wide"
          >
            Polkadot <span className="hidden sm:inline">Blockscout</span> ↗
          </a>
        </div>
        
        <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-8 h-16 flex items-center justify-between">

        {/* LOGO AREA */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg
              className="w-5 h-5 drop-shadow-md relative z-10 transition-transform duration-500 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Network connections forming 'P' */}
              <path d="M10 6V18M10 6C14 6 16.5 8 16.5 11C16.5 14 14 16 10 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              {/* Nodes (Polkadot Style) */}
              <circle cx="10" cy="6" r="2" fill="#E6007A" />
              <circle cx="10" cy="11" r="1.5" fill="white" />
              <circle cx="10" cy="16" r="1.5" fill="white" />
              <circle cx="10" cy="21" r="2" fill="#E6007A" />
              <circle cx="16.5" cy="11" r="2" fill="#E6007A" />
            </svg>
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            PolkaRental
          </span>
          <a
            href="https://blockscout-testnet.polkadot.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/30 px-2 py-1 rounded-md border border-sky-500/20 uppercase tracking-wider hidden sm:flex items-center gap-1 transition-colors"
            title="View on Blockscout Explorer"
          >
            <span>Polkadot Testnet</span> <span>🔍</span>
          </a>
        </div>

        {/* CENTER TABS */}
        <div className="flex gap-2 items-center bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
          {["home", "browse", "dashboard"].map(p => (
            <button
              key={p}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-out capitalize
                ${page === p ? "bg-slate-800 text-sky-400 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
              onClick={() => setPage(p)}
            >
              {p === "home" ? "✨ Home" : p === "browse" ? "🏠 Browse Rentals" : "📋 My Rentals"}
            </button>
          ))}
        </div>

        {/* RIGHT - WALLET & ACTIONS */}
        <div className="flex items-center gap-3">
          {wallet ? (
            <>
              <div className="relative" ref={balanceRef}>
                <button
                  type="button"
                  onClick={() => setShowBalanceDropdown((v) => !v)}
                  className="font-mono text-xs text-green-400 bg-green-950/50 px-3 py-2 rounded-lg border border-green-900/50 flex items-center gap-2 hover:bg-green-950/70 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  title="Click for faucet + copy address"
                >
                  <span className="text-sm">💰</span> {usdcBalance}
                  <span className="text-[10px] text-green-300/70 ml-1">▾</span>
                </button>

                {showBalanceDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-fadeUp origin-top-right z-50">
                    <button
                      type="button"
                      onClick={() => {
                        window.open("https://faucet.polkadot.io/", "_blank", "noopener,noreferrer");
                        setShowBalanceDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-sky-300 hover:bg-slate-800 hover:text-sky-200 flex items-center gap-2 transition-colors"
                    >
                      ⛽ Get PAS faucet (Polkadot testnet) ↗
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(wallet);
                        } catch {
                          // ignore
                        }
                        setShowBalanceDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      📋 Copy my address ({shortAddr(wallet)})
                    </button>
                  </div>
                )}
              </div>

              <div className="flex bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setShowMintModal(true)}
                  className="hover:bg-slate-800 text-sky-400 px-3 py-2 text-xs font-semibold transition-all duration-300 border-r border-slate-700/50"
                  title="Mint Mock USDC"
                >
                  + mUSDC
                </button>
                <button
                  onClick={() => setShowRedeemModal(true)}
                  className="hover:bg-slate-800 text-rose-400 px-3 py-2 text-xs font-semibold transition-all duration-300"
                  title="Redeem to Fiat Bank"
                >
                  - Redeem
                </button>
              </div>

              <button
                onClick={() => setShowList(true)}
                className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-sky-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                + List Room
              </button>

              {/* WALLET DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="font-mono text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  {shortAddr(wallet)}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-fadeUp origin-top-right">
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      🚪 Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
      </div>

      {/* Guest Banner */}
      {!wallet && (
        <div className="bg-emerald-950/30 border-b border-emerald-900/50 px-8 py-2.5 flex items-center justify-between">
          <span className="text-sm text-emerald-400 font-medium flex items-center gap-2">
            👀 Browsing as guest — connect wallet to rent or list rooms
          </span>
          <button
            onClick={connectWallet}
            className="bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-700 text-emerald-300 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            Connect Now
          </button>
        </div>
      )}

      {/* Modals placed here temporarily for simplicity, can also go in App tree */}
      {showListForm && <ListRoomModal onClose={() => setShowList(false)} />}
      {showMintModal && <MintUsdcModal onClose={() => setShowMintModal(false)} />}
      {showRedeemModal && <RedeemUsdcModal onClose={() => setShowRedeemModal(false)} />}
    </>
  );
}
