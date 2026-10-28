// Checklist item: "Rendered twice and got the same video".
// Renders a 2 s film twice and compares SHA-256 hashes.
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const hash = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function render(out) {
  const r = spawnSync(process.execPath, ['render.js'], {
    cwd: root, stdio: 'ignore', env: { ...process.env, DURATION: '2' },
  });
  if (r.status !== 0) { console.error('render failed'); process.exit(1); }
  fs.renameSync(path.join(root, 'film.mp4'), path.join(root, out));
}
render('film-a.mp4'); render('film-b.mp4');
const a = hash(path.join(root, 'film-a.mp4')), b = hash(path.join(root, 'film-b.mp4'));
console.log(a === b ? `✓ identical: ${a.slice(0, 16)}…` : '✗ files differ (did you use Math.random()?)');
process.exit(a === b ? 0 : 1);
