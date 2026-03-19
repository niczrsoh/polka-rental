// Format USDC amount (6 decimals) to UI display
export const fmt = (n) => {
  if (n === undefined || n === null) return "0.00";
  return (Number(n) / 1_000_000).toFixed(2);
};

// Convert UI string to USDC amount (6 decimals)
export const toUsdc = (n) => {
  if (!n) return "0";
  return Math.floor(parseFloat(n) * 1_000_000).toString();
};

// Format address for UI
export const shortAddr = (a) => {
  if (!a) return "";
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
};

export const STATUS = ["Pending", "Active", "Disputed", "Ended", "Resolved"];

export const STATUS_COLOR = {
  Pending: "#f59e0b",
  Active: "#22c55e",
  Disputed: "#ef4444",
  Ended: "#64748b",
  Resolved: "#3b82f6"
};

// Map array structure into actual object attributes
export const formatAgreement = (id, a) => ({
  id: Number(id),
  landlord: a[0],
  tenant: a[1],
  monthlyRent: a[2].toString(),
  depositAmount: a[3].toString(),
  startTimestamp: a[4].toString(), // timestamp in seconds
  durationMonths: a[5].toString(),
  lastRentPaidAt: a[6].toString(),
  rentPaidCount: a[7].toString(),
  status: Number(a[8]),
  depositLocked: a[9],
  disputeRaisedBy: a[10],
  disputeReason: a[11],
  roomTitle: a[12],
  roomLocation: a[13]
});

// Generate Blockscout Explorer URL
export const getExplorerUrl = (hash, type = 'address') => {
  const baseUrl = "https://blockscout-testnet.polkadot.io";
  if (type === 'tx') return `${baseUrl}/tx/${hash}`;
  return `${baseUrl}/address/${hash}`;
};
