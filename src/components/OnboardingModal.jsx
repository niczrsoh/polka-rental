import { useState, useEffect } from "react";

export default function OnboardingModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has seen the onboarding guide before
    const hasSeen = localStorage.getItem("hasSeenOnboarding_v1");
    if (!hasSeen) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding_v1", "true");
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "Get PAS Gas Tokens",
      desc: "You need PAS tokens to pay for transaction fees on the network.",
      action: { label: "Faucet", url: "https://faucet.polkadot.io/" },
      icon: "⛽"
    },
    {
      title: "Mint Mock USDC",
      desc: "Mint mUSDC to use for paying rent and deposits.",
      icon: "💵"
    },
    {
      title: "List a Room",
      desc: "Have a room? List it securely with an on-chain escrow.",
      icon: "🏠"
    },
    {
      title: "Lock & Deposit",
      desc: "Renters can lock in a room by depositing stablecoins.",
      icon: "🔒"
    },
    {
      title: "Withdraw Anytime",
      desc: "Landlords and tenants can withdraw their funds safely per the agreement.",
      icon: "💸"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl shadow-sky-900/20 rounded-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span className="text-3xl">👋</span> Welcome to PolkaRental
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Your trustless, escrow-protected rental platform. Here&apos;s how to get started:
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-sky-500/30 transition-colors group">
              <div className="w-12 h-12 shrink-0 bg-slate-950 rounded-full flex items-center justify-center text-2xl border border-slate-700 group-hover:scale-110 transition-transform shadow-inner">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-200">
                    <span className="text-sky-400 mr-2">{i + 1}.</span>
                    {step.title}
                  </h3>
                  {step.action && (
                    <a
                      href={step.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white px-2 py-1 rounded-full transition-colors border border-sky-500/20 uppercase tracking-wide"
                    >
                      {step.action.label} ↗
                    </a>
                  )}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 shrink-0">
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            Got it, let&apos;s go! 🚀
          </button>
        </div>
        
        {/* Close button top right */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
