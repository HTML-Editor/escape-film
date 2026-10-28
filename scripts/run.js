// Cross-platform helper: node scripts/run.js <seconds>
// Same as DURATION=<seconds> node render.js (works on Windows PowerShell too).
const { spawnSync } = require('child_process');
const path = require('path');
const seconds = process.argv[2] || '8';
const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'render.js')], {
  stdio: 'inherit', env: { ...process.env, DURATION: seconds },
});
process.exit(r.status ?? 1);
