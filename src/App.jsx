import { useState } from "react";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Browse from "./pages/Browse";
import Dashboard from "./pages/Dashboard";
import OnboardingModal from "./components/OnboardingModal";
import "./App.css";

// Inner App component that consumes the context
function AppContent() {
  const [page, setPage] = useState("home"); // "home" | "browse" | "dashboard"

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-sky-500/30">

      {/* Universal Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[150px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar page={page} setPage={setPage} />

        <main className="flex-1 w-full">
          {page === "home" && <Landing navigateToBrowse={() => setPage("browse")} />}
          {page === "browse" && <Browse navigateToDashboard={() => setPage("dashboard")} />}
          {page === "dashboard" && <Dashboard navigateToBrowse={() => setPage("browse")} />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950/50 backdrop-blur-sm py-6 px-8 mt-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-md flex items-center justify-center text-white text-[10px] shadow-lg shadow-sky-500/20">
              ⬡
            </div>
            <span className="font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              PolkaRental
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500 text-center md:text-right">
            Built on Polkadot Testnet 2025 · EVM Smart Contract Track
          </span>
        </footer>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
}

// Wrap app inside Context Provider
export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
