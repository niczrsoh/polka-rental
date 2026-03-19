export const CONFIG = {
  RENTAL_ADDRESS: "0x2b424A2F250D164bb6829B1E82Aa24a8fC71aB0C",   // PolkaRental.sol
  USDC_ADDRESS: "0x07D7f05B3826D3F6D779AcEe3B4E2Be18c7Ca45b",          // MockUSDC.sol
  POLKADOT_TESTNET: {
    chainId: "0x190f1b41",                       // 420420417 in hex (Polkadot Testnet chain ID)
    chainName: "Polkadot Testnet",
    rpcUrls: ["https://services.polkadothub-rpc.com/testnet"], // Generic public RPC or user provided later
    nativeCurrency: { name: "PAS", symbol: "PAS", decimals: 18 },
    blockExplorerUrls: ["https://blockscout-testnet.polkadot.io/"],
  },
};

export const RENTAL_ABI = [
  "function createListing(string,string,uint256,uint256,uint256) returns (uint256)",
  "function acceptListing(uint256)",
  "function payRent(uint256,uint256)",
  "function requestEndTenancy(uint256)",
  "function raiseDispute(uint256,string)",
  "function resolveDispute(uint256,uint256,uint256)",
  "function getAgreement(uint256) view returns (tuple(address landlord,address tenant,uint256 monthlyRent,uint256 depositAmount,uint256 startTimestamp,uint256 durationMonths,uint256 lastRentPaidAt,uint256 rentPaidCount,uint8 status,bool depositLocked,address disputeRaisedBy,string disputeReason,string roomTitle,string roomLocation))",
  "function getPendingListings() view returns (uint256[])",
  "function getLandlordAgreements(address) view returns (uint256[])",
  "function getTenantAgreements(address) view returns (uint256[])",
  "function isRentDue(uint256) view returns (bool)",
  "function isRentOverdue(uint256) view returns (bool)",
  "function monthsRemaining(uint256) view returns (uint256)",
  "function agreementCount() view returns (uint256)",
  "function demoFastForwardTime(uint256,uint256)"
];

export const USDC_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
  "function mint(address,uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
];

export const DEMO_LISTINGS = [
  { id: 1, roomTitle: "Master Room @ Taman Universiti", roomLocation: "Skudai, Johor", monthlyRent: "500000000", depositAmount: "1000000000", durationMonths: "12", status: 0, landlord: "0x1234...abcd", tenant: "0x0000000000000000000000000000000000000000" },
  { id: 2, roomTitle: "Single Room @ Desa Skudai", roomLocation: "Skudai Perdana, JB", monthlyRent: "350000000", depositAmount: "700000000", durationMonths: "6", status: 0, landlord: "0x5678...ef01", tenant: "0x0000000000000000000000000000000000000000" },
  { id: 3, roomTitle: "Studio Unit @ KSL City Area", roomLocation: "Taman Abad, JB", monthlyRent: "800000000", depositAmount: "1600000000", durationMonths: "12", status: 1, landlord: "0x9abc...2345", tenant: "0x6789...cdef" },
];
