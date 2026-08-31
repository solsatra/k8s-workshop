// leaderboard-api: talks to Postgres on the shared All-Apps scoreboard VM.
// This is the pod players deliberately kill in exercise 4 — the point is
// that snake-core keeps working without it, not that this service is
// itself resilient.
const express = require('express');
const { Pool } = require('pg');

const PORT = process.env.PORT || 8080;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 10000,
});
pool.on('error', (err) => console.error('idle client error', err.message));

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/scores/top', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  try {
    const { rows } = await pool.query(
      `SELECT player, MAX(score) AS best
       FROM scores
       GROUP BY player
       ORDER BY best DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ scores: rows });
  } catch (err) {
    console.error('scores/top failed', err.message);
    res.status(503).json({ error: 'db unavailable' });
  }
});

app.post('/scores', async (req, res) => {
  const player = String((req.body && req.body.player) || '').slice(0, 64);
  const score = Number(req.body && req.body.score);
  if (!player || !Number.isFinite(score)) {
    return res.status(400).json({ error: 'player and numeric score required' });
  }
  try {
    await pool.query('INSERT INTO scores (player, score) VALUES ($1, $2)', [player, score]);
    res.status(201).json({ accepted: true });
  } catch (err) {
    console.error('scores insert failed', err.message);
    res.status(503).json({ error: 'db unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`leaderboard-api listening on :${PORT}, db=${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
