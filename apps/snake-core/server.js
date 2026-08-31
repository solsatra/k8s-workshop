// snake-core: serves the game and proxies to two optional backends.
// Neither backend failing should ever take the game itself down — that's
// the point of this component in the workshop (see docs/04-leaderboard-and-fault-isolation.md).
const express = require('express');
const path = require('path');
const Redis = require('ioredis');

const PORT = process.env.PORT || 8080;
const PLAYER_NAME = process.env.PLAYER_NAME || 'anonymous';
const GRID_SIZE = parseInt(process.env.GRID_SIZE || '20', 10);
const TICK_MS = parseInt(process.env.TICK_MS || '120', 10);
const LEADERBOARD_API_URL = process.env.LEADERBOARD_API_URL || '';
const REDIS_HOST = process.env.REDIS_HOST || '';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const BACKEND_TIMEOUT_MS = 1500;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let redis = null;
if (REDIS_HOST) {
  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't keep hammering a dead redis
  });
  redis.on('error', () => {}); // swallow — every call site already handles failure
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function fetchJson(url, opts, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/api/config', (_req, res) => {
  res.json({ gridSize: GRID_SIZE, tickMs: TICK_MS, playerName: PLAYER_NAME });
});

// The leaderboard widget: if leaderboard-api is down or slow, we still
// return 200 with available:false so the frontend renders a fallback
// instead of breaking. This is the fault-isolation behavior itself.
app.get('/api/leaderboard', async (_req, res) => {
  if (!LEADERBOARD_API_URL) return res.json({ available: false, scores: [] });
  try {
    const data = await fetchJson(`${LEADERBOARD_API_URL}/scores/top`, {}, BACKEND_TIMEOUT_MS);
    res.json({ available: true, scores: data.scores || [] });
  } catch (_err) {
    res.json({ available: false, scores: [] });
  }
});

// Best-effort score submission — a dead leaderboard-api should never
// interrupt play, so we always respond 202 to the browser.
app.post('/api/score', async (req, res) => {
  res.status(202).json({ accepted: true });
  if (!LEADERBOARD_API_URL) return;
  const score = Number(req.body && req.body.score) || 0;
  try {
    await fetchJson(
      `${LEADERBOARD_API_URL}/scores`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ player: PLAYER_NAME, score }),
      },
      BACKEND_TIMEOUT_MS
    );
  } catch (_err) {
    // dropped on the floor on purpose — see comment above
  }
});

// Session state — used in the persistent storage exercise. Lets a page
// refresh mid-game resume, IF redis (and its volume) survived.
app.get('/api/session', async (_req, res) => {
  if (!redis) return res.json({ session: null });
  try {
    const raw = await withTimeout(redis.get(`session:${PLAYER_NAME}`), BACKEND_TIMEOUT_MS);
    res.json({ session: raw ? JSON.parse(raw) : null });
  } catch (_err) {
    res.json({ session: null });
  }
});

app.post('/api/session', async (req, res) => {
  res.status(202).json({ accepted: true });
  if (!redis) return;
  try {
    await withTimeout(
      redis.set(`session:${PLAYER_NAME}`, JSON.stringify(req.body || {}), 'EX', 3600),
      BACKEND_TIMEOUT_MS
    );
  } catch (_err) {
    // best-effort, same reasoning as /api/score
  }
});

app.listen(PORT, () => {
  console.log(`snake-core listening on :${PORT} (player=${PLAYER_NAME})`);
});
