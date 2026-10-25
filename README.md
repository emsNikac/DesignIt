# Forma

A browser-based 3D flat design sandbox built with React, Three.js and cannon-es.

This project is intended to run locally. It has no hosting configuration or deployment scripts.

## Run

```sh
npm install
npm run dev
```

Press `Ctrl+C` in the terminal to stop the server and close its port.

`npm run build` creates a static production build in `dist/`. `npm test` checks support physics, furniture collisions and saved-file validation.

## In the studio

- Browse 51 furniture, kitchen, bedroom, bathroom, lighting and decorative items. Click to add; drag to place.
- Select an object to edit its color, rotation, size or position. Small objects have gravity and snap onto upward-facing surfaces. Tables and bookcases use compound colliders with open spaces.
- Choose one of four flat layouts. Each layout saves separately in browser storage.
- Change wall paint, floor finishes and bathroom tiles. Bathroom tile finishes apply to the two divided layouts.
- Change time from midnight through daylight and sunset. Direct sunlight, shadows, ambient light and reflection intensity respond to time.
- Switch between an orbit camera, a top-down plan and a first-person walkthrough. Use WASD to move and drag or arrow keys to turn.
- Export the current view as PNG. Save and import portable JSON designs.

Keyboard shortcuts: `V` select, `M` move, `R` rotate 15°, `Delete` remove, `⌘/Ctrl D` duplicate, `⌘/Ctrl Z` undo, `⌘/Ctrl Shift Z` redo, `Escape` deselect.

## Rendering and simulation

The app creates its own detailed procedural 3D furniture and canvas-based material textures. No asset API, API key or external model service is needed. Fonts load from Google Fonts with system fallbacks. Rendering uses physically based materials, a room environment map, ACES tone mapping, directional shadow maps and ground-truth ambient occlusion.

This is an interactive design sandbox. Furniture remains anchored while small items use rigid-body gravity and contact physics. Placement checks compound furniture colliders; walkthrough collision and object shapes are approximations. Reflections use an environment map rather than ray tracing, and the renderer does not simulate full global illumination. Designs save on the current browser and device; export JSON for a durable backup.
