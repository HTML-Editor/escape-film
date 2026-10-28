// render.js: an escape scene drawn 100% in code. Run: node render.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---- settings: change one line, only that thing changes ----
const W = 1080, H = 1920;      // vertical reel
const FPS = 30;
const DURATION = Number(process.env.DURATION || 8);
const SEED = 42;               // same seed = same snow = same video
const LAMP = '#fff4c2';        // searchlight colour
const SKY_TOP = '#0b1630', SKY_BOTTOM = '#2b4a7a';
let hero = null;               // optional character PNG (transparent background), see Step 5

// seeded random, so every render is identical (Math.random is not)
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
const rand = rng(SEED);
const ease = (x) => 0.5 - Math.cos(Math.PI * Math.min(Math.max(x, 0), 1)) / 2;

// snow: every flake gets a depth z (near = bigger + faster = parallax)
const flakes = Array.from({ length: 520 }, () => ({
  x: rand() * W, y: rand() * H, z: 0.3 + rand() * 0.7, drift: rand() * 6.28,
}));

function sky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, SKY_TOP); g.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function ground(ctx) {
  ctx.fillStyle = '#d9e4f2';
  ctx.beginPath(); ctx.moveTo(0, 1250);
  ctx.quadraticCurveTo(W / 2, 1190, W, 1260); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
}

function tower(ctx, t) {
  ctx.fillStyle = '#060b18';
  ctx.fillRect(800, 820, 14, 420); ctx.fillRect(880, 820, 14, 420);   // legs
  ctx.fillRect(770, 760, 150, 70);                                     // cabin
  ctx.beginPath(); ctx.moveTo(760, 760); ctx.lineTo(845, 715); ctx.lineTo(930, 760); ctx.fill();
  // searchlight beam sweeps left and right
  const a = Math.PI + 0.35 * Math.sin(t * 0.9);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const beam = ctx.createRadialGradient(845, 795, 10, 845, 795, 1100);
  beam.addColorStop(0, LAMP + 'cc'); beam.addColorStop(1, LAMP + '00');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(845, 795);
  ctx.arc(845, 795, 1100, a - 0.09, a + 0.09); ctx.fill(); ctx.restore();
  return a;
}

function wire(ctx) {
  ctx.strokeStyle = '#0a1224'; ctx.fillStyle = '#0a1224'; ctx.lineWidth = 4;
  for (let p = -40; p < W + 80; p += 180) ctx.fillRect(p, 1080, 10, 200);  // posts
  for (const y of [1110, 1160, 1210]) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 30) {
      ctx.lineTo(x, y + 6 * Math.sin(x / 90));
      ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6);             // barb
      ctx.moveTo(x, y + 6 * Math.sin(x / 90));
    }
    ctx.stroke();
  }
}

// a hooded runner, drawn with paths; legs swing with time
function runner(ctx, x, y, s, t, phase) {
  const k = Math.sin(t * 10 + phase);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#0d1426';
  ctx.beginPath(); ctx.ellipse(0, -150, 34, 40, 0, 0, 6.28); ctx.fill();            // hood
  ctx.beginPath(); ctx.moveTo(-40, -120); ctx.lineTo(40, -120);       // coat
  ctx.lineTo(48, -10); ctx.lineTo(-48, -10); ctx.fill();
  ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.strokeStyle = '#0d1426';
  ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(-14 + 40 * k, 80); ctx.stroke();  // legs
  ctx.beginPath(); ctx.moveTo(14, -12); ctx.lineTo(14 - 40 * k, 80); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-36, -100); ctx.lineTo(-36 - 35 * k, -40); ctx.stroke(); // arms
  ctx.beginPath(); ctx.moveTo(36, -100); ctx.lineTo(36 + 35 * k, -40); ctx.stroke();
  ctx.restore();
}

function snowDraw(ctx, t) {
  ctx.fillStyle = '#ffffff';
  for (const f of flakes) {
    const y = (f.y + t * 220 * f.z) % H;
    const x = (f.x + Math.sin(t + f.drift) * 30 * f.z + W) % W;
    ctx.globalAlpha = 0.4 + 0.6 * f.z;
    ctx.beginPath(); ctx.arc(x, y, 2 + 4 * f.z, 0, 6.28); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function grain(ctx, t) {
  const r = rng(SEED + Math.floor(t * FPS));   // grain is seeded per frame too
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 2500; i++) ctx.fillRect(r() * W, r() * H, 2, 2);
}

function shot(ctx, t) {
  const zoom = 1 + 0.08 * ease(t / DURATION);     // slow camera push-in
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
  sky(ctx); tower(ctx, t); ground(ctx); wire(ctx);
  const run = 1400 - 140 * t;                     // runners cross right to left
  runner(ctx, run, 1480, 1.3, t, 0);
  runner(ctx, run + 260, 1430, 1.1, t, 1.7);
  if (hero) {                                      // Step 5: PNG character moved by code
    const bob = Math.sin(t * 2) * 6;               // breathing / bobbing
    const w = 420, h = w * hero.height / hero.width;  // keep ratio
    ctx.drawImage(hero, 140 + t * 25, 1300 + bob, w, h);
  }
  ctx.restore();
  snowDraw(ctx, t); grain(ctx, t);
}

// ---- render: draw each frame, pipe raw pixels straight into ffmpeg ----
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba',
  '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
  '-crf', '18', 'film.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });

(async () => {
  const heroPath = path.join(__dirname, 'hero.png');   // optional: drop hero.png next to render.js
  if (fs.existsSync(heroPath)) hero = await loadImage(heroPath);
  const total = DURATION * FPS;
  for (let f = 0; f < total; f++) {
    shot(ctx, f / FPS);
    const frame = ctx.getImageData(0, 0, W, H).data;
    const ok = ff.stdin.write(Buffer.from(frame.buffer));
    if (!ok) await new Promise((r) => ff.stdin.once('drain', r));   // wait if ffmpeg is busy
    if (f % FPS === 0) process.stdout.write(`frame ${f} / ${total}\r`);
  }
  ff.stdin.end();
  ff.on('close', (code) => {
    console.log(code === 0 ? `\ndone: film.mp4 (${total} frames)` : `ffmpeg exited ${code}`);
  });
})();
