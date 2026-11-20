/* ---------- Settings ---------- */
const COLS = 10;
const ROWS = 20;
const CELL = Math.min(30, Math.floor((window.innerHeight - 120) / ROWS), Math.floor((window.innerWidth - 150) / COLS));

const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};
const COLORS = {
  I: "#3ad0e8", O: "#f5d142", T: "#a65ee8", S: "#5cd165",
  Z: "#ef5050", J: "#4f7cf0", L: "#f59a3a",
};
const LINE_POINTS = [0, 100, 300, 500, 800];

/* ---------- Elements ---------- */
const board = document.getElementById("board");
const ctx = board.getContext("2d");
const nextCanvas = document.getElementById("next");
const nctx = nextCanvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayBtn = document.getElementById("overlayBtn");
const pauseBtn = document.getElementById("pauseBtn");
const el = id => document.getElementById(id);

board.width = COLS * CELL;
board.height = ROWS * CELL;
const NEXT_CELL = Math.max(16, Math.floor(CELL * 0.7));
nextCanvas.width = NEXT_CELL * 4;
nextCanvas.height = NEXT_CELL * 4;

/* ---------- State ---------- */
// The grid only holds LANDED blocks (a color string, or null for empty).
// The falling piece is kept separately in `piece`.
let grid, piece, nextType, bag;
let score, lines, level;
let running = false, paused = false, gameOver = false;
let dropTimer = 0, lastTime = 0;
let best = 0;
try { best = Number(localStorage.getItem("tetris-best")) || 0; } catch (e) {}

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// "7-bag": every 7 pieces you get one of each, in random order.
function takeFromBag() {
  if (!bag || bag.length === 0) {
    bag = Object.keys(SHAPES);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

function makePiece(type) {
  const shape = SHAPES[type].map(row => row.slice());
  return {
    type,
    shape,
    row: type === "I" ? -1 : 0,
    col: Math.floor((COLS - shape[0].length) / 2),
  };
}

/* ---------- Core rule: does a shape fit here? ---------- */
function fits(shape, row, col) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;           // empty corners of the box don't matter
      const r = row + y, c = col + x;
      if (c < 0 || c >= COLS || r >= ROWS) return false;   // walls and floor
      if (r >= 0 && grid[r][c]) return false;              // landed blocks
    }
  }
  return true;
}

function rotate(shape) {
  // Transpose, then reverse each row = 90° clockwise
  const n = shape.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      out[x][n - 1 - y] = shape[y][x];
  return out;
}

/* ---------- Moves ---------- */
function tryMove(dRow, dCol) {
  if (fits(piece.shape, piece.row + dRow, piece.col + dCol)) {
    piece.row += dRow;
    piece.col += dCol;
    return true;
  }
  return false;
}

function tryRotate() {
  if (piece.type === "O") return;
  const rotated = rotate(piece.shape);
  // Try in place, then nudge sideways/up so it can rotate next to walls ("wall kicks")
  const kicks = [[0,0],[0,-1],[0,1],[0,-2],[0,2],[-1,0]];
  for (const [dr, dc] of kicks) {
    if (fits(rotated, piece.row + dr, piece.col + dc)) {
      piece.shape = rotated;
      piece.row += dr;
      piece.col += dc;
      return;
    }
  }
}

function softDrop() {
  if (tryMove(1, 0)) { score += 1; dropTimer = 0; }
  else lockPiece();
}

function hardDrop() {
  let dist = 0;
  while (tryMove(1, 0)) dist++;
  score += dist * 2;
  lockPiece();
}

function ghostRow() {
  let r = piece.row;
  while (fits(piece.shape, r + 1, piece.col)) r++;
  return r;
}

/* ---------- Landing, line clears, spawning ---------- */
function lockPiece() {
  let toppedOut = false;
  piece.shape.forEach((rowArr, y) => rowArr.forEach((v, x) => {
    if (!v) return;
    const r = piece.row + y, c = piece.col + x;
    if (r < 0) toppedOut = true;
    else grid[r][c] = COLORS[piece.type];
  }));
  if (toppedOut) return endGame();

  clearLines();
  spawn();
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell)) {
      grid.splice(r, 1);
      grid.unshift(Array(COLS).fill(null));
      cleared++;
      r++; // re-check the same row index, since rows shifted down
    }
  }
  if (cleared) {
    lines += cleared;
    score += LINE_POINTS[cleared] * level;
    level = Math.floor(lines / 10) + 1;
  }
}

function spawn() {
  piece = makePiece(nextType);
  nextType = takeFromBag();
  dropTimer = 0;
  if (!fits(piece.shape, piece.row, piece.col)) endGame();
}

function dropInterval() {
  return Math.max(80, 800 - (level - 1) * 70);
}

/* ---------- Game flow ---------- */
function startGame() {
  grid = emptyGrid();
  bag = [];
  score = 0; lines = 0; level = 1;
  nextType = takeFromBag();
  gameOver = false;
  paused = false;
  running = true;
  spawn();
  overlay.classList.add("hidden");
  pauseBtn.textContent = "Pause";
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  gameOver = true;
  if (score > best) {
    best = score;
    try { localStorage.setItem("tetris-best", String(best)); } catch (e) {}
  }
  draw();
  overlayTitle.textContent = "Game Over";
  overlayText.textContent = "Score: " + score.toLocaleString();
  overlayBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (paused) {
    overlayTitle.textContent = "Paused";
    overlayText.textContent = "Press P or Resume to continue.";
    overlayBtn.textContent = "Resume";
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function loop(now) {
  if (!running || paused) return;
  dropTimer += now - lastTime;
  lastTime = now;
  if (dropTimer >= dropInterval()) {
    dropTimer = 0;
    if (!tryMove(1, 0)) lockPiece();
  }
  draw();
  if (running) requestAnimationFrame(loop);
}

/* ---------- Drawing ---------- */
function drawCell(c, x, y, size, color, alpha = 1) {
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  // small highlight for a bit of depth
  c.fillStyle = "rgba(255,255,255,0.18)";
  c.fillRect(x * size + 1, y * size + 1, size - 2, Math.max(2, size * 0.15));
  c.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);

  // faint grid lines
  ctx.strokeStyle = "#1a1d26";
  ctx.lineWidth = 1;
  for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL + .5, 0); ctx.lineTo(x * CELL + .5, board.height); ctx.stroke(); }
  for (let y = 1; y < ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL + .5); ctx.lineTo(board.width, y * CELL + .5); ctx.stroke(); }

  // landed blocks
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c]) drawCell(ctx, c, r, CELL, grid[r][c]);

  if (piece && !gameOver) {
    // ghost piece: shows where it will land
    const gr = ghostRow();
    piece.shape.forEach((rowArr, y) => rowArr.forEach((v, x) => {
      if (v && gr + y >= 0) drawCell(ctx, piece.col + x, gr + y, CELL, COLORS[piece.type], 0.2);
    }));
    // falling piece
    piece.shape.forEach((rowArr, y) => rowArr.forEach((v, x) => {
      if (v && piece.row + y >= 0) drawCell(ctx, piece.col + x, piece.row + y, CELL, COLORS[piece.type]);
    }));
  }

  // next piece preview, centered
  nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (nextType) {
    const s = SHAPES[nextType];
    const filled = [];
    s.forEach((row, y) => row.forEach((v, x) => { if (v) filled.push([x, y]); }));
    const minX = Math.min(...filled.map(p => p[0])), maxX = Math.max(...filled.map(p => p[0]));
    const minY = Math.min(...filled.map(p => p[1])), maxY = Math.max(...filled.map(p => p[1]));
    const offX = (4 - (maxX - minX + 1)) / 2 - minX;
    const offY = (4 - (maxY - minY + 1)) / 2 - minY;
    filled.forEach(([x, y]) => drawCell(nctx, x + offX, y + offY, NEXT_CELL, COLORS[nextType]));
  }

  el("score").textContent = score.toLocaleString();
  el("lines").textContent = lines;
  el("level").textContent = level;
  el("best").textContent = Math.max(best, score).toLocaleString();
}

/* ---------- Input ---------- */
function act(action) {
  if (!running || paused) return;
  if (action === "left") tryMove(0, -1);
  else if (action === "right") tryMove(0, 1);
  else if (action === "down") softDrop();
  else if (action === "rotate") tryRotate();
  else if (action === "drop") hardDrop();
  if (running) draw();
}

document.addEventListener("keydown", e => {
  const map = { ArrowLeft: "left", ArrowRight: "right", ArrowDown: "down", ArrowUp: "rotate", " ": "drop" };
  if (map[e.key]) {
    e.preventDefault();   // stop the page from scrolling
    act(map[e.key]);
  } else if (e.key === "p" || e.key === "P") {
    togglePause();
  } else if (e.key === "Enter" && !running) {
    startGame();
  }
});

document.querySelectorAll(".touch button").forEach(btn => {
  btn.addEventListener("pointerdown", e => { e.preventDefault(); act(btn.dataset.act); });
});

overlayBtn.addEventListener("click", () => {
  if (paused) togglePause();
  else startGame();
});
pauseBtn.addEventListener("click", togglePause);

/* ---------- Initial screen ---------- */
grid = emptyGrid();
score = 0; lines = 0; level = 1;
el("best").textContent = best.toLocaleString();
draw();
