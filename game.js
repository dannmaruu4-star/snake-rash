// Simple Snake game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('btn-start');
const pauseBtn = document.getElementById('btn-pause');
const resetBtn = document.getElementById('btn-reset');

let grid = 20; // size of one cell in pixels
let cols = canvas.width / grid;
let rows = canvas.height / grid;

let snake;
let food;
let dir = { x: 1, y: 0 };
let running = false;
let gameInterval;
let speed = 120; // ms per tick

function init() {
  snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
  dir = { x: 1, y: 0 };
  placeFood();
  updateScore(0);
  running = false;
  clearInterval(gameInterval);
  draw();
}

function placeFood(){
  while(true){
    const fx = Math.floor(Math.random() * cols);
    const fy = Math.floor(Math.random() * rows);
    if(!snake.some(s => s.x===fx && s.y===fy)){
      food = { x: fx, y: fy };
      break;
    }
  }
}

function updateScore(n){ scoreEl.textContent = n; }

function drawCell(x,y, color){
  ctx.fillStyle = color;
  ctx.fillRect(x*grid, y*grid, grid-1, grid-1);
}

function draw(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  // background subtle grid
  for(let i=0;i<cols;i++){
    for(let j=0;j<rows;j++){
      // optional faint checkboard
    }
  }
  // food
  drawCell(food.x, food.y, '#ef4444');
  // snake
  snake.forEach((s, idx) => {
    drawCell(s.x, s.y, idx===0 ? '#34d399' : '#10b981');
  });
}

function step(){
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  // wall collision
  if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows){
    return gameOver();
  }
  // self collision
  if(snake.some(seg => seg.x === head.x && seg.y === head.y)){
    return gameOver();
  }
  snake.unshift(head);
  // eat
  if(head.x === food.x && head.y === food.y){
    updateScore(snake.length - 1);
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameOver(){
  clearInterval(gameInterval);
  running = false;
  alert('Game Over — score: ' + (snake.length - 1));
  init();
}

function startGame(){
  if(running) return;
  running = true;
  clearInterval(gameInterval);
  gameInterval = setInterval(step, speed);
}

function pauseGame(){
  running = false;
  clearInterval(gameInterval);
}

function resetGame(){
  init();
}

document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowUp' || e.key === 'w'){ if(dir.y === 0) dir = { x: 0, y: -1 }; }
  if(e.key === 'ArrowDown' || e.key === 's'){ if(dir.y === 0) dir = { x: 0, y: 1 }; }
  if(e.key === 'ArrowLeft' || e.key === 'a'){ if(dir.x === 0) dir = { x: -1, y: 0 }; }
  if(e.key === 'ArrowRight' || e.key === 'd'){ if(dir.x === 0) dir = { x: 1, y: 0 }; }
  // space to pause/start
  if(e.key === ' '){ if(running) pauseGame(); else startGame(); }
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', () => { if(running) pauseGame(); else startGame(); });
resetBtn.addEventListener('click', resetGame);

// mobile controls
document.getElementById('mobile-controls').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-dir]');
  if(!b) return;
  const d = b.dataset.dir;
  if(d === 'up' && dir.y === 0) dir = { x: 0, y: -1 };
  if(d === 'down' && dir.y === 0) dir = { x: 0, y: 1 };
  if(d === 'left' && dir.x === 0) dir = { x: -1, y: 0 };
  if(d === 'right' && dir.x === 0) dir = { x: 1, y: 0 };
});

// initialize
init();
