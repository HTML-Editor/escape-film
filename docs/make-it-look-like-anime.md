# Make it look like anime

- **Depth layers.** Background moves slowest, foreground fastest. Giving each snowflake its own depth (`z`) already sells it.
- **Light adds, it does not paint.** Draw beams and glows with `globalCompositeOperation = 'lighter'` so they brighten what is underneath.
- **Slow camera.** A 5 to 10% push-in over the whole shot feels like cinema. Fast zooms feel like a slideshow.
- **Grain on top.** A few thousand faint dots per frame hide the "too clean" computer look.
- **Animate on twos.** Change character poses about 12 times a second (use `Math.floor(t * 12)`) for the hand-drawn anime rhythm.
- **One scene per file.** Make shot1.js, shot2.js, render each, then cut them together in your editor.
