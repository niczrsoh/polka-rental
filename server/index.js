/* global process */
import "dotenv/config";
import express from "express";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function levelFromScore(score) {
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function safeJsonParseFromText(text) {
  // Try strict JSON first
  try {
    return JSON.parse(text);
  } catch {
    // fall through to extraction
  }

  // Try extracting first JSON object/array
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  const start = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
  if (start === -1) return null;

  const endBrace = text.lastIndexOf("}");
  const endBracket = text.lastIndexOf("]");
  const end = endBrace === -1 ? endBracket : endBracket === -1 ? endBrace : Math.max(endBrace, endBracket);
  if (end <= start) return null;

  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

app.post("/api/ai/risk", async (req, res) => {
  try {
    const listings = Array.isArray(req.body?.listings) ? req.body.listings : [];
    if (listings.length === 0) return res.json({ results: [] });

    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: "ANTHROPIC_API_KEY is not set on the server",
        results: []
      });
    }

    const system = [
      "You are an AI fraud analyst for Malaysian student rental listings.",
      "Given a list of rental listings, produce an explainable scam risk score per listing.",
      "Return ONLY valid JSON (no markdown), with this exact shape:",
      "{ \"results\": [{ \"id\": <number>, \"score\": <0-100>, \"level\": \"Low\"|\"Medium\"|\"High\", \"reasons\": [<string>...] }] }",
      "Rules:",
      "- Keep reasons concise, specific, and non-defamatory (use 'possible', 'verify', 'suspicious pattern').",
      "- Use 2-5 reasons each. If low risk, include at least 1 reason explaining why it looks OK.",
      "- Consider price anomalies, vague metadata, duplicate-looking text, repeated landlord wallet behavior, unusual deposit-to-rent ratio.",
    ].join("\n");

    const user = {
      listings: listings.map((l) => ({
        id: Number(l.id),
        roomTitle: String(l.roomTitle || ""),
        roomLocation: String(l.roomLocation || ""),
        monthlyRent: String(l.monthlyRent || ""),
        depositAmount: String(l.depositAmount || ""),
        durationMonths: String(l.durationMonths || ""),
        landlord: String(l.landlord || "")
      }))
    };

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 700,
        temperature: 0.2,
        system,
        messages: [{ role: "user", content: JSON.stringify(user) }]
      })
    });

    if (!anthropicRes.ok) {
      const t = await anthropicRes.text().catch(() => "");
      return res.status(502).json({ error: t || "Anthropic API error", results: [] });
    }

    const data = await anthropicRes.json();
    const text = (data?.content || [])
      .filter((c) => c?.type === "text")
      .map((c) => c.text)
      .join("\n");

    const parsed = safeJsonParseFromText(text);
    const results = Array.isArray(parsed?.results) ? parsed.results : [];

    const normalized = results
      .map((r) => {
        const score = clamp(Number(r.score) || 0, 0, 100);
        const id = Number(r.id);
        const level = r.level || levelFromScore(score);
        const reasons = Array.isArray(r.reasons) ? r.reasons.slice(0, 6).map(String) : [];
        return { id, score, level, reasons, source: "claude", model: data?.model };
      })
      .filter((r) => Number.isFinite(r.id));

    res.json({ results: normalized });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Server error", results: [] });
  }
});

app.listen(PORT, () => {
  // Intentionally minimal log.
  console.log(`AI risk server listening on :${PORT}`);
});

