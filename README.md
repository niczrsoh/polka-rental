# Polka Room Rental Platform 🏠

Polka is a decentralized, Web3-native room rental platform built on the **Polkadot Testnet**. It enables landlords to list properties and tenants to rent them securely using **mUSDC** (Mock Stablecoin), holding deposits mathematically locked inside an immutable escrow Smart Contract.

By leveraging stablecoins and smart contracts, Polka eliminates the need for expensive intermediary brokers, ensures rapid deposits/returns without arbitrary holds, and establishes mathematically encoded trust.

## 🌟 Key Features

### For Tenants
* **Stablecoin Deposits**: Lock your deposit in USDC (via our `mUSDC` test token). Your deposit is shielded from cryptocurrency volatility. Whatever you put in, you get out.
* **Flexible Prepayments**: Pay rent for multiple months in advance directly through standard wallet interactions.
* **AI Risk Scoring**: Our AI algorithm evaluates the room listing scams and provides transparent risk reasons.
* **Fiat Off-Ramping (Demo)**: A simulated gateway to redeem your mUSDC back directly into local fiat currency to your Bank Account.
* **View in Polkadot Testnet Blockscout**: View the smart contract transactions and events on the Polkadot Testnet Blockscout explorer.
* **Raise Dispute or Terminate Rental**: Raise a dispute or terminate the rental directly through the platform.

### For Landlords
* **Instant Payments**: Rent payments are routed instantly to your wallet.
* **Immutable Agreements**: Tenancy agreements are legally encoded into the Polkadot EVM Testnet.
* **Deposit Security**: The smart contract acts as an escrow, meaning the tenant cannot arbitrarily take the deposit back until the end of the tenancy or mutual consent.
* **Respond to Dispute**: Landlords can respond to disputes raised by tenants.

## 🛠 Tech Stack
* **Frontend Design**: React.js / Vite / TailwindCSS (Dark Mode Glassmorphism Theme) 
* **Blockchain/Smart Contracts**: Solidity (EVM)
* **Web3 Integration**: `ethers.js` v6
* **Network**: Polkadot Testnet (EVM)
* **Explorers**: Native integration with the Blockscout Explorer UI

## ⚙️ Quick Start (Local Development)

### Prerequisites
* Have Node.js installed on your machine.
* A Web3 Wallet extension installed on your web browser (e.g. MetaMask).
* Add the **Polkadot Testnet** to your wallet.

### 1. Web Application Setup
Run the following commands in the root directory to boot the development server:

```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---
Built for the 2026 Hackathon.
