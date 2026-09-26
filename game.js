const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');
const speedEl = document.querySelector('#speed');
const startButton = document.querySelector('#startButton');

const road = { x: 55, width: 290 };
const player = { x: 182, y: 545, width: 36, height: 68, speed: 6 };
let traffic = [], score = 0, best = Number(localStorage.getItem('highwayDashBest') || 0);
let running = false, gameOver = false, keys = {}, roadOffset = 0, spawnTimer = 0, lastTime = 0;
bestEl.textContent = best;

function reset() {
  player.x = 182; traffic = []; score = 0; roadOffset = 0; spawnTimer = 0;
  gameOver = false; running = true; startButton.textContent = 'Restart Game';
  scoreEl.textContent = '0';
}
function spawnCar() {
  const width = 36;
  const lanes = [road.x + 35, road.x + 127, road.x + 219];
  traffic.push({ x: lanes[Math.floor(Math.random() * lanes.length)], y: -80, width, height: 68, color: ['#fb7185', '#fbbf24', '#a78bfa'][Math.floor(Math.random() * 3)] });
}
function overlaps(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
function drawCar(car, color) {
  ctx.fillStyle = color; ctx.fillRect(car.x, car.y, car.width, car.height);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(car.x + 6, car.y + 11, car.width - 12, 18); ctx.fillRect(car.x + 6, car.y + 39, car.width - 12, 16);
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(car.x + 3, car.y + 5, 5, 10); ctx.fillRect(car.x + car.width - 8, car.y + 5, 5, 10);
}
function draw() {
  ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#374151'; ctx.fillRect(road.x, 0, road.width, canvas.height);
  ctx.fillStyle = '#f8fafc';
  for (let y = -50 + roadOffset; y < canvas.height; y += 90) ctx.fillRect(road.x + 94, y, 7, 48), ctx.fillRect(road.x + 190, y, 7, 48);
  ctx.fillStyle = '#facc15'; ctx.fillRect(road.x - 5, 0, 5, canvas.height); ctx.fillRect(road.x + road.width, 0, 5, canvas.height);
  traffic.forEach(car => drawCar(car, car.color)); drawCar(player, '#38bdf8');
  if (!running) { ctx.fillStyle = '#0009'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 28px system-ui'; ctx.fillText(gameOver ? 'Game Over!' : 'Highway Dash', 200, 295); ctx.font = '16px system-ui'; ctx.fillText(gameOver ? 'Press Space or Restart' : 'Press Space or Start', 200, 325); }
}
function frame(time) {
  const dt = Math.min((time - lastTime) / 16.67 || 1, 2); lastTime = time;
  if (running) {
    const multiplier = 1 + Math.min(score / 500, 2); speedEl.textContent = multiplier.toFixed(1);
    if (keys.ArrowLeft || keys.a) player.x -= player.speed * dt;
    if (keys.ArrowRight || keys.d) player.x += player.speed * dt;
    player.x = Math.max(road.x + 8, Math.min(road.x + road.width - player.width - 8, player.x));
    roadOffset = (roadOffset + 5 * multiplier * dt) % 90; spawnTimer += dt;
    if (spawnTimer > Math.max(28, 65 - score / 20)) { spawnCar(); spawnTimer = 0; }
    traffic.forEach(car => car.y += 4.5 * multiplier * dt);
    traffic = traffic.filter(car => { if (car.y > canvas.height) { score += 10; scoreEl.textContent = score; return false; } return true; });
    if (traffic.some(car => overlaps(player, car))) { running = false; gameOver = true; if (score > best) { best = score; localStorage.setItem('highwayDashBest', best); bestEl.textContent = best; } }
  }
  draw(); requestAnimationFrame(frame);
}
function start() { reset(); }
startButton.addEventListener('click', start);
window.addEventListener('keydown', event => { keys[event.key] = true; if (event.code === 'Space') { event.preventDefault(); start(); } });
window.addEventListener('keyup', event => { keys[event.key] = false; });
draw(); requestAnimationFrame(frame);
