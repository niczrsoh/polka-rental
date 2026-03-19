/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import { CONFIG, RENTAL_ABI, USDC_ABI } from "../config/contracts";
import { toUsdc, fmt } from "../config/helpers";

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [rentalContract, setRental] = useState(null);
  const [usdcContract, setUsdc] = useState(null);
  const [usdcBalance, setUsdcBal] = useState("0");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Constants
  // "Burn" address to simulate destroying tokens upon fiat redemption
  const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CONFIG.POLKADOT_TESTNET.chainId }]
      });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CONFIG.POLKADOT_TESTNET]
        });
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return showToast("Please install MetaMask!", "error");
    try {
      setLoading(true);
      await switchNetwork();
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _addr = await _signer.getAddress();
      const _rental = new ethers.Contract(CONFIG.RENTAL_ADDRESS, RENTAL_ABI, _signer);
      const _usdc = new ethers.Contract(CONFIG.USDC_ADDRESS, USDC_ABI, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setWallet(_addr);
      setRental(_rental);
      setUsdc(_usdc);

      showToast(`Connected: ${_addr.slice(0, 6)}...${_addr.slice(-4)}`);
      await loadBalance(_usdc, _addr);
    } catch (e) {
      showToast(e.message || "Connection failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setProvider(null);
    setSigner(null);
    setRental(null);
    setUsdc(null);
    setUsdcBal("0");
    showToast("Wallet disconnected");
  };

  const loadBalance = async (_usdc, _addr) => {
    try {
      const bal = await _usdc.balanceOf(_addr);
      setUsdcBal(fmt(bal));
    } catch {
      // ignore
    }
  };

  const mintUsdc = async (amount = "5000") => {
    if (!usdcContract || !wallet) return;
    try {
      setLoading(true);
      const tx = await usdcContract.mint(wallet, toUsdc(amount.toString()));
      await tx.wait();

      // Wait 2 seconds for network RPC to sync
      await new Promise(r => setTimeout(r, 2000));
      await loadBalance(usdcContract, wallet);
      showToast(`Minted ${amount} mUSDC to your wallet! 🎉`);
    } catch (e) {
      showToast(e.reason || "Mint failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const redeemUsdc = async (amount) => {
    if (!usdcContract || !wallet) return;
    try {
      setLoading(true);
      // Transfer tokens to the DEAD address to simulate burning they out of circulation
      // Since it's MockUSDC we don't need a real backend bridge for this demo
      const tx = await usdcContract.transfer(DEAD_ADDRESS, toUsdc(amount.toString()));
      await tx.wait();

      // Wait 2 seconds for network RPC to sync
      await new Promise(r => setTimeout(r, 2000));
      await loadBalance(usdcContract, wallet);
    } catch (e) {
      showToast(e.reason || "Redemption failed", "error");
      throw e; // throw up to the modal to handle UI state
    } finally {
      setLoading(false);
    }
  };

  const value = {
    wallet,
    provider,
    signer,
    rentalContract,
    usdcContract,
    usdcBalance,
    loading,
    setLoading,
    toast,
    showToast,
    connectWallet,
    disconnectWallet,
    mintUsdc,
    redeemUsdc,
    loadBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
