const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s@.-]/gu, "")
    .trim();

const median = (arr) => {
  const xs = arr.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (xs.length === 0) return 0;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
};

const usdcFromChain = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return n / 1_000_000;
};

/**
 * Local “AI-like” risk heuristic (no backend).
 * Returns { score: 0..100, level: 'Low'|'Medium'|'High', reasons: string[] }.
 */
export function scoreListingRisk(listing, context) {
  const reasons = [];
  let score = 0;

  const rent = usdcFromChain(listing?.monthlyRent);
  const med = context?.medianRent ?? 0;

  // Price anomaly vs market median (within the current dataset).
  if (med > 0) {
    if (rent > 0 && rent < med * 0.55) {
      score += 28;
      reasons.push("Price unusually low vs similar listings (possible bait).");
    } else if (rent > med * 1.9) {
      score += 18;
      reasons.push("Price unusually high vs similar listings (verify details).");
    }
  }

  // Repeated landlord wallet (many listings from same address).
  const landlord = (listing?.landlord || "").toLowerCase();
  const countByLandlord = context?.landlordCounts?.get(landlord) ?? 0;
  if (landlord && countByLandlord >= 3) {
    score += 20;
    reasons.push("Same wallet posts many listings (double-check legitimacy).");
  }

  // Potential copy/paste duplicates by normalized title+location.
  const key = `${normalize(listing?.roomTitle)}|${normalize(listing?.roomLocation)}`;
  const dupCount = context?.titleLocCounts?.get(key) ?? 0;
  if (key !== "|" && dupCount >= 2) {
    score += 22;
    reasons.push("Duplicate-looking listing details detected (possible copy/paste).");
  }

  // Extremely short / vague listing metadata.
  const titleN = normalize(listing?.roomTitle);
  const locN = normalize(listing?.roomLocation);
  if (titleN.length > 0 && titleN.length < 10) {
    score += 8;
    reasons.push("Very short title — missing specifics.");
  }
  if (locN.length > 0 && locN.length < 8) {
    score += 6;
    reasons.push("Very short location — missing specifics.");
  }

  // Mild confidence reduction if we have almost no signals.
  if (reasons.length === 0) {
    score = 8;
    reasons.push("No obvious red flags detected from available on-chain metadata.");
  }

  const finalScore = clamp(Math.round(score), 0, 100);
  const level = finalScore >= 60 ? "High" : finalScore >= 30 ? "Medium" : "Low";
  return { score: finalScore, level, reasons, source: "heuristic" };
}

export function buildRiskContext(listings = []) {
  const rents = listings.map((l) => usdcFromChain(l?.monthlyRent)).filter((n) => n > 0);
  const medianRent = median(rents);

  const landlordCounts = new Map();
  const titleLocCounts = new Map();

  for (const l of listings) {
    const landlord = (l?.landlord || "").toLowerCase();
    if (landlord) landlordCounts.set(landlord, (landlordCounts.get(landlord) ?? 0) + 1);

    const key = `${normalize(l?.roomTitle)}|${normalize(l?.roomLocation)}`;
    if (key !== "|") titleLocCounts.set(key, (titleLocCounts.get(key) ?? 0) + 1);
  }

  return { medianRent, landlordCounts, titleLocCounts };
}

