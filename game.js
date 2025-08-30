// Simple Flappy Bird clone (vanilla JS + Canvas)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('btn-start');
const restartBtn = document.getElementById('btn-restart');
const tapArea = document.getElementById('tapArea');

let W = canvas.width;
let H = canvas.height;

// scale canvas for HD screens
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = 480;
  canvas.height = 640;
  W = canvas.width; H = canvas.height;
}
resizeCanvas();

let game; // game loop handle

// Game state
let bird, pipes, gravity, jump, pipeGap, pipeWidth, speed, score, best, gameOverFlag, started;

function resetGame() {
  gravity = 0.5;
  jump = -9.2;
  pipeGap = 160;
  pipeWidth = 60;
  speed = 2.6;
  score = 0;
  bird = {
    x: Math.floor(W * 0.28),
    y: Math.floor(H / 2),
    w: 34,
    h: 24,
    vy: 0,
    rot: 0
  };
  pipes = [];
  gameOverFlag = false;
  started = false;
  scoreEl.textContent = score;
  best = parseInt(localStorage.getItem('flappy_best') || '0', 10);
  bestEl.textContent = best;
  restartBtn.style.display = 'none';
}

function spawnPipe() {
  const topH = Math.floor(Math.random() * (H - pipeGap - 160)) + 60;
  pipes.push({
    x: W + 20,
    top: topH,
    bottom: topH + pipeGap,
    passed: false
  });
}

function flap() {
  if (gameOverFlag) return;
  bird.vy = jump;
  started = true;
}

function update() {
  if (!started) return;
  // bird physics
  bird.vy += gravity;
  bird.y += bird.vy;
  bird.rot = Math.max(-30, Math.min(90, (bird.vy / 10) * 45));

  // move pipes
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= speed;
    if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
      pipes[i].passed = true;
      score++;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        localStorage.setItem('flappy_best', best);
        bestEl.textContent = best;
      }
    }
  }

  // remove offscreen pipes and spawn new
  if (pipes.length === 0 || (pipes[pipes.length - 1].x < W - 240)) {
    spawnPipe();
  }
  while (pipes.length && pipes[0].x < -pipeWidth) {
    pipes.shift();
  }

  // collision - floor/ceiling
  if (bird.y + bird.h / 2 >= H || bird.y - bird.h / 2 <= 0) {
    endGame();
    return;
  }

  // collision with pipes
  for (let p of pipes) {
    // top pipe rect: x..x+pipeWidth, y: 0..p.top
    // bottom pipe rect: x..x+pipeWidth, y: p.bottom..H
    if (rectIntersect(bird.x - bird.w/2, bird.y - bird.h/2, bird.w, bird.h,
                      p.x, 0, pipeWidth, p.top) ||
        rectIntersect(bird.x - bird.w/2, bird.y - bird.h/2, bird.w, bird.h,
                      p.x, p.bottom, pipeWidth, H - p.bottom)) {
      endGame();
      return;
    }
  }
}

function rectIntersect(x1,y1,w1,h1, x2,y2,w2,h2){
  return !(x2 > x1 + w1 || x2 + w2 < x1 || y2 > y1 + h1 || y2 + h2 < y1);
}

function endGame() {
  gameOverFlag = true;
  restartBtn.style.display = 'inline-block';
}

function draw() {
  // background
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(0,0,W,H);

  // ground
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, H - 80, W, 80);

  // pipes
  for (let p of pipes) {
    ctx.fillStyle = '#2f9e44';
    // top pipe
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    // bottom pipe
    ctx.fillRect(p.x, p.bottom, pipeWidth, H - p.bottom - 80);
  }

  // bird (simple circle/rect)
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rot * Math.PI / 180);
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.ellipse(0,0, bird.w/2, bird.h/2, 0, 0, Math.PI * 2);
  ctx.fill();
  // eye
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(6, -2, 3, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // if not started show text
  if (!started && !gameOverFlag) {
    ctx.fillStyle = 'rgba(3,48,63,0.7)';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click / Tap / Space to flap', W/2, H/2 - 20);
  }

  if (gameOverFlag) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, H/2 - 60, W, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W/2, H/2 - 10);
    ctx.font = '18px Arial';
    ctx.fillText('Press Restart', W/2, H/2 + 20);
  }
}

function loop() {
  update();
  draw();
  game = requestAnimationFrame(loop);
}

function init() {
  resetGame();
  cancelAnimationFrame(game);
  loop();
}

// controls
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!started && !gameOverFlag) { started = true; }
    if (!gameOverFlag) flap();
  }
});

canvas.addEventListener('click', () => {
  if (gameOverFlag) return;
  if (!started) started = true;
  flap();
});

tapArea.addEventListener('click', () => {
  if (!started && !gameOverFlag) started = true;
  if (!gameOverFlag) flap();
});

startBtn.addEventListener('click', () => {
  resetGame();
  init();
  started = true;
});

restartBtn.addEventListener('click', () => {
  resetGame();
  init();
  started = true;
});

// init on load
init();

// handle resize for responsive scale (optional)
window.addEventListener('resize', () => {
  // keep canvas logical size fixed (we set CSS to scale on small screens)
});
