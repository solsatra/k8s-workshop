// Classic snake: grid movement, wall collision, self collision. Everything
// here runs client-side — the game keeps working even if every backend call
// below fails, which is the whole point of this component.
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const playerNameEl = document.getElementById('player-name');
const leaderboardBody = document.getElementById('leaderboard-body');

let gridSize = 20;
let tickMs = 120;
let playerName = 'anonymous';
let cell = canvas.width / gridSize;

let snake, dir, nextDir, food, score, alive, timer;

function reset() {
  snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
  dir = { x: 0, y: 0 };
  nextDir = { x: 0, y: 0 };
  score = 0;
  alive = true;
  placeFood();
  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
}

function tick() {
  if (!alive) return;
  dir = nextDir;
  if (dir.x === 0 && dir.y === 0) return; // not started yet

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
  const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameOver() {
  alive = false;
  clearInterval(timer);
  statusEl.textContent = `Game over — score ${score}. Press an arrow key to play again.`;
  submitScore(score);
}

function draw() {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(food.x * cell, food.y * cell, cell, cell);

  ctx.fillStyle = '#22c55e';
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(s.x * cell, s.y * cell, cell - 1, cell - 1);
  });

  if (alive) statusEl.textContent = `Score: ${score}`;
}

window.addEventListener('keydown', (e) => {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };
  const d = map[e.key];
  if (!d) return;
  e.preventDefault();

  if (!alive) {
    reset();
    timer = setInterval(tick, tickMs);
  }
  // ignore 180-degree reversals
  if (dir.x === -d.x && dir.y === -d.y && (dir.x !== 0 || dir.y !== 0)) return;
  nextDir = d;
});

async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    gridSize = cfg.gridSize || gridSize;
    tickMs = cfg.tickMs || tickMs;
    playerName = cfg.playerName || playerName;
    cell = canvas.width / gridSize;
  } catch (_err) {
    // fall back to client-side defaults above — config being unreachable
    // should never stop the game from loading
  }
  playerNameEl.textContent = playerName;
}

async function submitScore(finalScore) {
  try {
    await fetch('/api/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ score: finalScore }),
    });
  } catch (_err) {
    // fire-and-forget
  }
  refreshLeaderboard();
}

async function refreshLeaderboard() {
  try {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    if (!data.available) {
      leaderboardBody.textContent = 'Leaderboard unavailable right now — keep playing!';
      return;
    }
    if (!data.scores.length) {
      leaderboardBody.textContent = 'No scores yet — be the first.';
      return;
    }
    leaderboardBody.innerHTML = data.scores
      .map((s, i) => `<div class="row"><span>${i + 1}. ${s.player}</span><span>${s.best}</span></div>`)
      .join('');
  } catch (_err) {
    leaderboardBody.textContent = 'Leaderboard unavailable right now — keep playing!';
  }
}

(async function init() {
  await loadConfig();
  reset();
  timer = setInterval(tick, tickMs);
  refreshLeaderboard();
  setInterval(refreshLeaderboard, 5000);
})();
