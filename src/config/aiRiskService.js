export async function fetchClaudeRiskScores(listings) {
  const res = await fetch("/api/ai/risk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ listings })
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `AI risk API failed (${res.status})`);
  }

  return await res.json();
}

