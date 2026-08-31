-- Shared leaderboard schema. One table, one row per game played; the API
-- groups by player and takes MAX(score) so nobody needs a per-player table.
CREATE TABLE IF NOT EXISTS scores (
  id         SERIAL PRIMARY KEY,
  player     TEXT NOT NULL,
  score      INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scores_player_idx ON scores (player);
