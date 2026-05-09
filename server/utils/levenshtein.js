export function levenshtein(a, b) {
  const s = String(a);
  const t = String(b);
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function minDistToWord(query, word) {
  const w = String(word);
  if (!w) return Infinity;
  let best = levenshtein(query, w);
  if (w.length >= query.length) {
    best = Math.min(best, levenshtein(query, w.slice(0, query.length)));
  }
  return best;
}

export function bestMatchDistance(query, title, author) {
  const q = query.trim().toLowerCase();
  if (!q) return Infinity;
  const t = (title || "").toLowerCase();
  const a = (author || "").toLowerCase();
  let best = levenshtein(q, t);
  best = Math.min(best, levenshtein(q, a));
  for (const w of t.split(/\s+/)) {
    if (w.length >= 2) best = Math.min(best, minDistToWord(q, w));
  }
  for (const w of a.split(/\s+/)) {
    if (w.length >= 2) best = Math.min(best, minDistToWord(q, w));
  }
  return best;
}

export function maxEditDistanceForQueryLength(len) {
  if (len < 2) return 0;
  if (len <= 4) return 1;
  if (len <= 10) return 2;
  return 3;
}

export function searchMatchTier(query, title, author) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = (title || "").toLowerCase();
  const a = (author || "").toLowerCase();
  if (t.startsWith(q)) return 0;
  if (t.includes(q)) return 1;
  if (a.startsWith(q)) return 2;
  if (a.includes(q)) return 3;
  return 4;
}
