# Forma

A browser-based 3D flat design sandbox built with React, Three.js and cannon-es.

This project is intended to run locally. It has no hosting configuration or deployment scripts.

## Run

```sh
npm install
npm run dev
```

Press `Ctrl+C` in the terminal to stop the server and close its port.

`npm run build` creates a static production build in `dist/`. `npm test` checks every furniture model, support physics, saved-design migration and camera movement.

## In the studio

- Browse 178 furniture, kitchen, bedroom, bathroom, lighting and decorative items, including sectionals, rocking chairs, appliances, curtains, patterned rugs and bathroom accessories. Click to add; drag to place.
- Select an object to edit its color, rotation, size or position. Small objects have gravity and snap onto upward-facing surfaces. Tables and bookcases use compound colliders with open spaces.
- Choose **New design**, pick one of four empty floor plans and name your design. Create multiple independent designs using the same flat layout.
- Open the furnished homes from **My spaces → Demo homes**. Edits create a personal copy; the original demos stay available. Older per-layout saves migrate into **Your designs** automatically.
- Change wall paint, floor finishes and bathroom tiles. Bathroom tile finishes apply to the two divided layouts.
- Change time from midnight through daylight and sunset. Direct sunlight, shadows, ambient light and reflection intensity respond to time.
- Switch between an orbit camera, a top-down plan and a first-person walkthrough. In Walkthrough, the mouse looks around freely, WASD moves, Shift walks faster and Esc releases the cursor and pauses movement. Click the room to resume. Looking up and down is supported; diagonal movement stays at the same walking speed.
- Browsers supporting the Pointer Lock API capture the cursor for continuous turning. If capture is unavailable (including some embedded preview browsers), choose **Use mouse-look** to look around by moving the mouse over the room. Touch screens retain drag-to-look controls.
- Export the current view as PNG. Save and import portable JSON designs.

Keyboard shortcuts: `V` select, `M` move, `R` rotate 15°, `Delete` remove, `⌘/Ctrl D` duplicate, `⌘/Ctrl Z` undo, `⌘/Ctrl Shift Z` redo, `Escape` deselect.

## Rendering and simulation

The app creates its own detailed procedural 3D furniture and canvas-based material textures. No asset API, API key or external model service is needed. Fonts load from Google Fonts with system fallbacks. Rendering uses physically based materials, a room environment map, ACES tone mapping, directional shadow maps and ground-truth ambient occlusion.

This is an interactive design sandbox. Furniture remains anchored while small items use rigid-body gravity and contact physics. Placement checks compound furniture colliders; walkthrough collision and object shapes are approximations. Reflections use an environment map rather than ray tracing, and the renderer does not simulate full global illumination. Designs save on the current browser and device; export JSON for a durable backup.
