# Prompt 1 · New scene

Write a single Node.js file render.js that uses @napi-rs/canvas to draw a 1080x1920, 30 fps, 8 second anime-style scene: [describe your scene, the light, the weather and what moves]. Draw every frame with a function shot(ctx, t). Use a seeded random generator, never Math.random. Pipe raw RGBA frames into ffmpeg with spawn and write film.mp4. Put all colours, speeds and counts as constants at the top.
