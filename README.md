# Polka Room Rental Platform 🏠

Polka is a decentralized, Web3-native room rental platform built on the **Polkadot Testnet**. It enables landlords to list properties and tenants to rent them securely using **mUSDC** (Mock Stablecoin), holding deposits mathematically locked inside an immutable escrow Smart Contract.

By leveraging stablecoins and smart contracts, Polka eliminates the need for expensive intermediary brokers, ensures rapid deposits/returns without arbitrary holds, and establishes mathematically encoded trust.

## 🌟 Key Features

### For Tenants
* **Stablecoin Deposits**: Lock your deposit in USDC (via our `mUSDC` test token). Your deposit is shielded from cryptocurrency volatility. Whatever you put in, you get out.
* **Flexible Prepayments**: Pay rent for multiple months in advance directly through standard wallet interactions.
* **Auto-Deduct/Cron Simulation**: Experience a seamless backend simulation of automatic rent deductions using pre-approved allowances.
* **Fiat Off-Ramping (Demo)**: A simulated gateway to redeem your mUSDC back directly into local fiat currency to your Bank Account.

### For Landlords
* **Instant Payments**: Rent payments are routed instantly to your wallet.
* **Immutable Agreements**: Tenancy agreements are legally encoded into the Polkadot EVM Testnet.
* **Deposit Security**: The smart contract acts as an escrow, meaning the tenant cannot arbitrarily take the deposit back until the end of the tenancy or mutual consent.

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

### 2. Smart Contract Adjustments (If needed)
The application points to pre-deployed instances of `PolkaRental.sol` and `MockUSDC.sol` on the Testnet. To deploy your own instances:

1. Use Remix IDE or HardHat to deploy `MockUSDC.sol` first.
2. Deploy `PolkaRental.sol`, passing the MockUSDC address into its constructor.
3. Update the `RENTAL_ADDRESS` and `USDC_ADDRESS` inside `src/config/contracts.js` to point to your new contracts.

## 💡 Hackathon Demo Tips
If you are presenting this project, we have included a few hidden testing functions configured in the UI:
* **Custom mUSDC Minting**: Click the `+ mUSDC` button in the navbar to generate free testnet stablecoin straight into your wallet.
* **Fast-Forward Time**: Open any active Agreement Detail Modal and look for the "Hackathon Demo Tools" banner. You can simulate time travel (pushing the blockchain timestamp 30 days ahead) to instantly trigger "Rent Due" states.
* **Simulated Cron Job**: Fire the "Run Auto-Pay Cron Job" button in the same modal to demonstrate how a backend keeper node automatically pulls rent seamlessly without user intervention.

---
Built for the 2025 Hackathon.
