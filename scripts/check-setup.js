// Step 1 check: Node.js and ffmpeg both print a version number.
const { spawnSync } = require('child_process');
let ok = true;
function run(label, cmd, args, hint) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    ok = false;
    console.log(`✗ ${label}: not found. ${hint}`);
  } else {
    console.log(`✓ ${label}: ${(r.stdout || '').split('\n')[0]}`);
  }
}
console.log(`✓ node: ${process.version}`);
run('ffmpeg', 'ffmpeg', ['-version'],
  "Install it (README Step 1), then reopen the terminal.");
try { require.resolve('@napi-rs/canvas'); console.log('✓ @napi-rs/canvas installed'); }
catch { ok = false; console.log('✗ @napi-rs/canvas missing. Run: npm install'); }
process.exit(ok ? 0 : 1);
