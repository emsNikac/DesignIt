# Forma

A browser-based 3D flat design sandbox built with React, Three.js and cannon-es.

This project is intended to run locally. It has no hosting configuration or deployment scripts.

## Run

```sh
npm install
npm run dev
```

Press `Ctrl+C` in the terminal to stop the server and close its port.

`npm run build` creates a static production build in `dist/`. `npm test` checks every furniture model, material customization, geometry batching, support physics, placement, graphics preferences, saved-design migration and camera movement.

## In the studio

- Browse 629 furniture, kitchen, bedroom, bathroom, lighting, decorative, hobby and architectural items. Drag a piece from its catalog image or name onto a clear place in the flat, or click to add; newly added pieces enter Move mode. A translucent preview and outline show placement validity before a drop. Dropping keeps the current camera position and zoom; click the placed piece to focus it. Small props can be dropped onto shelves and countertops. The category row supports its arrows, mouse wheel, trackpad, scrollbar and touch swipes. Larger pieces start in a clear area when one is available.
- Navigate is the default tool: drag anywhere, including over furniture, to orbit; scroll to zoom and right-drag to pan. A short click selects an object. Choose **Move** to drag it. WASD also pans the regular 3D camera without changing orbit, zoom or pan gestures. Clicking an item frames it beside the inspector; **Focus item** frames it again. Esc or deselection restores the camera from before the selection. Intervening flat walls temporarily cut away during focus. On phones, the inspector sits below the stage. **Move stays active after deselection**; press `H` or choose Navigate to leave Move mode.
- Select an object and choose **Customize part** to edit its individual surfaces. Kitchen and vanity countertops, table tops, cabinetry, frames, upholstery, cushions, metalwork, planters and other details can have independent colors and finishes. Clicking a surface selects its part directly. There are 12 finish choices, including wood, woven fabric, leather, marble, terrazzo and brushed metal; rectangular rugs also have five pattern choices. Restore each part individually. Customizations survive undo, duplication, saving and JSON export/import.
- Explore **Hobbies** and filter by 20 themes, with three objects per theme: bicycles, treadmills, exercise equipment, instruments, gaming setups, art and craft supplies, gardening, camping, fishing, travel, board games, cinema, dance, collections and pet furniture. These are widely practiced hobby themes, not a definitive global ranking; see [selection notes](docs/hobbies.md).
- Every main category has at least 50 distinct constructions or rug motifs; existing color variants are retained but do not count toward that minimum. The expanded collection adds 36 dining-chair constructions, 40 tables for dinner, weddings, cocktails, buffets and games, plus extensive storage, lighting, décor, rugs, kitchens, bedrooms and bathrooms. Search **dining chair**, **wedding banquet**, **buffet service** or **games night** to explore. See [catalog coverage](docs/catalog.md).
- Browse **Walls & dividers** for eight interior wall types, including doorway/window walls, half walls, framed glass and oak slats. Place, rotate, recolor and duplicate them. Set length, height and thickness separately; edits are saved and exported. Doorway openings allow walking and props through while the panels block them. Wall lengths adjust to the available room bounds when rotated.
- Edit rotation, size or position. Small objects have gravity and snap onto upward-facing surfaces. Tables and bookcases use compound colliders with open spaces.
- Choose **New design**, pick one of four empty floor plans and name your design. Create multiple independent designs using the same flat layout.
- Open the furnished homes from **My spaces → Demo homes**. Edits create a personal copy; the original demos stay available. Older per-layout saves migrate into **Your designs** automatically. Saved design cards have a **Delete** action with an explicit confirmation. Cancelling keeps the design. Deleting the active design opens another saved home, or a demo if the library is empty.
- Change wall paint, 18 floor materials and bathroom tiles. New floors include oak/walnut herringbone, basketweave parquet, bamboo, cork, slate, marble, terracotta, patterned cement and woven carpet. Bathroom tiles offer 24 named colors, a custom picker and hex entry; these apply to the two divided layouts and survive saves and JSON export/import.
- Change time from midnight through daylight and sunset. Direct sunlight, directional moonlight, shadows, ambient light and reflection intensity respond to time. **Light switch** turns installed ceiling fixtures and placed lamps on or off independently of time. The saved switch also controls lamp-shade emission. Night no longer turns on a single automatic light in the middle of the flat.
- Switch between an orbit camera, a top-down plan and a first-person walkthrough. In Walkthrough, the mouse looks around freely, WASD moves, Shift walks faster and Esc releases the cursor and pauses movement. Click the room to resume. Looking up and down is supported; diagonal movement stays at the same walking speed. Entry chooses a clear position when furniture occupies the usual spawn. Walking slides along obstacles; edits that enclose the player trigger a new clear position. If furniture covers every available point, a temporary furniture-collision escape mode lets the player reach an open spot while room boundaries remain enforced.
- Browsers supporting the Pointer Lock API capture the cursor for continuous turning. If capture is unavailable (including some embedded preview browsers), choose **Use mouse-look** to look around by moving the mouse over the room. Touch screens retain drag-to-look controls.
- Export the current view as PNG. Save and import portable JSON designs.
- Open **Graphics settings** at the bottom of the left toolbar. **Original** uses full resolution, materials, shadow detail and contact shading, with High anti-aliasing to smooth jagged edges. **Balanced**, **Performance** and **Battery saver** reduce rendering cost for weaker devices. Anti-aliasing (**Off**, **Fast · FXAA**, **High · SMAA**), resolution, shadows, contact shading, shading quality and the 30/60 FPS cap can also be adjusted separately. Preferences stay on this browser/device; **Restore original visuals** resets them.

Keyboard shortcuts: `H` navigate/deselect, `V` select, `M` move, `R` rotate 15°, `Delete` remove, `⌘/Ctrl D` duplicate, `⌘/Ctrl Z` undo, `⌘/Ctrl Shift Z` redo, `Escape` deselect/restore the previous view, `WASD` pan in 3D view or move in Walkthrough.

## Rendering and simulation

The app creates its own detailed procedural 3D furniture and canvas-based material textures. No asset API, API key or external model service is needed. Fonts load from Google Fonts with system fallbacks. Rendering uses physically based materials, a room environment map, ACES tone mapping, directional sun/moon shadows, switchable interior lighting and ground-truth ambient occlusion. Medium shadow detail and higher give two installed fixtures 512-pixel shadow maps; lower presets disable those extra shadows. Up to eight placed lamps emit local light. Interior illumination is an approximation, without simulated light bouncing between rooms.

Opaque furniture surfaces are batched without reducing geometry detail, and geometry is shared between repeated objects. The furnished Sunday Loft uses 162 furniture meshes instead of 712, retaining all 137,992 triangles. Drawing stops when the scene is idle; sleeping props stop physics stepping and static shadow maps are reused. Nearby catalog previews share one reusable renderer, release temporary GPU resources after each render, and unload their images off screen. Resource caches are bounded. See [optimization notes and validation limits](docs/optimization.md).

If graphics are interrupted, the game shows a recovery message instead of leaving a blank canvas. It rebuilds its environment and render targets when the browser restores the context. **Restore 3D view** starts a fresh renderer with the current design, without reloading the browser.

This is an interactive design sandbox. Furniture remains anchored while small items use rigid-body gravity and contact physics. Placement checks compound furniture colliders; walkthrough collision and object shapes are approximations. Reflections use an environment map rather than ray tracing, and the renderer does not simulate full global illumination. Designs save on the current browser and device; export JSON for a durable backup.

See [studio interaction and lighting notes](docs/studio-controls.md) for the behavior and validation of the latest controls.
