# Escape Film: make anime films with code

An 8-second anime-style escape scene (searchlight, snow, barbed wire, hooded runners) drawn **100% in code** and rendered to `film.mp4` on your own laptop. No video model, no credits, no watermark.

Based on the free guide *Make Anime Films With Code* by @aiwithlakshay.

> **Honest note.** "No AI was used" reels usually mean no AI *video* model. An AI still writes most of the code, and polished anime faces are usually image layers. This repo covers both parts.

## How it works

A code film is a program that draws one picture, moves time forward by 1/30 s, and draws the next. ffmpeg stitches the pictures into an MP4.

| Part | Who does it | Cost |
|---|---|---|
| Drawing every frame | `render.js` on your laptop | Free |
| Writing/editing the code | You + an AI chat (see `prompts/`) | Free tier works |
| Detailed characters | Optional PNG from any image tool, moved by code | Depends on tool |
| Frames to MP4 | ffmpeg | Free |

**Flow:** 1 Pick a scene → 2 Draw it in code → 3 Animate the camera → 4 Render → 5 Edit and post (CapCut/Premiere).

## Step 1: install two free tools

| Computer | Node.js | ffmpeg |
|---|---|---|
| Windows | LTS from nodejs.org | `winget install --id Gyan.FFmpeg -e`, then reopen the terminal |
| Mac | LTS from nodejs.org or `brew install node` | `brew install ffmpeg` |
| Linux | LTS from nodejs.org or your package manager | `sudo apt install ffmpeg` |

```bash
node -v
ffmpeg -version
```

## Step 2: set up the project

```bash
git clone <this-repo> escape-film
cd escape-film
npm install          # installs @napi-rs/canvas (prebuilt, nothing to compile)
npm run check        # confirms node, ffmpeg and canvas are all found
```

## Step 3: the code

Everything lives in [`render.js`](render.js): settings, world (sky, ground, tower + searchlight, barbed wire), hooded runners, snow, grain, camera push-in, and the render loop that pipes raw RGBA frames into ffmpeg. `shot(ctx, t)` draws the whole world at time `t`; layer order matters: sky, light, ground, wire, characters, then snow and grain.

## Step 4: render

```bash
node render.js            # 8 s film -> film.mp4
```

You'll see `frame 0 / 240` counting up, then `done: film.mp4 (240 frames)`.

| Want | Mac / Linux | Windows PowerShell | Any OS |
|---|---|---|---|
| 3 s test | `DURATION=3 node render.js` | `$env:DURATION=3; node render.js` | `npm run test:3s` |
| 15 s film | `DURATION=15 node render.js` | `$env:DURATION=15; node render.js` | `npm run render:15s` |

Same code gives the same video every time, since the snow uses a fixed seed (never use `Math.random()`). Prove it with `npm run verify`.

### Change one line, only that changes

| Line to edit | Try this | What changes |
|---|---|---|
| `LAMP` | `'#ff6b6b'` | Searchlight turns red |
| `SKY_TOP` | `'#2a0d3a'` | Purple night sky |
| `length: 520` | `1500` | Heavy blizzard |
| `0.08 * ease(...)` | `0.25` | Stronger camera push-in |
| `Math.sin(t * 0.9)` | `Math.sin(t * 0.3)` | Slower searchlight sweep |
| `SEED` | `7` | Different, but repeatable, snowfall |

## Step 5: add real character art

Make a PNG with a transparent background in any image tool, save it as **`hero.png`** next to `render.js`. `render.js` detects it automatically and draws it (bobbing, drifting right) just before the camera transform ends. Size, position, bob and speed are in the `if (hero) { ... }` block in `shot()`. No `hero.png`, no hero: the scene renders as before.

## Step 6: prompts that write the code for you

- [`prompts/01-new-scene.md`](prompts/01-new-scene.md): a brand-new scene
- [`prompts/02-change-one-thing.md`](prompts/02-change-one-thing.md): a surgical edit
- [`prompts/03-fix-an-error.md`](prompts/03-fix-an-error.md): debugging

More polish tips: [`docs/make-it-look-like-anime.md`](docs/make-it-look-like-anime.md). Progress list: [`docs/checklist.md`](docs/checklist.md).

## If something breaks

| You see | Do this |
|---|---|
| `'ffmpeg' is not recognized` / `ENOENT` | Install ffmpeg (Step 1), then reopen the terminal |
| `Cannot find module '@napi-rs/canvas'` | Run `npm install` in this folder |
| Video is black or 0 seconds | `shot()` must draw the sky first, and the loop must finish before ffmpeg closes |
| Rendering is slow | Test with `DURATION=2`, lower the snow count, render the final once |
| Characters look flat | Add a PNG character (Step 5) |

## Repo layout

```
render.js                     the whole film
package.json                  npm scripts: check, render, test:3s, render:15s, verify
scripts/check-setup.js        Step 1 check
scripts/run.js                cross-platform DURATION helper
scripts/verify-determinism.js render twice, compare hashes
prompts/                      the three AI prompts
docs/                         anime tips + launch checklist
```

Got your first film? Post it and tag **@aiwithlakshay** on Instagram.
