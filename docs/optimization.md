# Rendering optimization

The default **Original** graphics preset keeps the existing appearance: a device pixel ratio capped at 1.75, 2048-pixel soft shadows, 12-sample GTAO with the same parameters, the same PBR materials, environment lighting, tone mapping, geometry and texture detail. High-quality SMAA edge smoothing is now enabled in Original; the prior geometry, materials, lighting and tone mapping remain. Lower quality is an explicit player choice.

## Changes independent of graphics quality

- Opaque meshes with matching material, editable part and shadow flags are merged within each furniture object. Transform positions, normals and UVs are baked into the merged geometry. Transparent surfaces remain separate for sorting. Original bounds are retained for fitted models, placement and selection.
- Primitive and merged geometry is reused between objects and appearance edits. Material and texture pooling remains shared. Removing one object does not dispose shared resources needed by another.
- The animation loop skips drawing while nothing changes or the document is hidden. Camera movement, edits, daylight changes and active physics invalidate the render. A lightweight animation callback remains active; this is not a claim of zero idle CPU use.
- Directional shadow maps update after geometry, lighting or visibility changes, rather than on every camera frame.
- Rigid-body stepping pauses after all dynamic props sleep. The small planter collides with its pot rather than treating flexible leaves as a solid box; the old box wedged against a shelf in the furnished loft and kept physics awake indefinitely. Appearance edits preserve an existing physics body.
- Walkthrough obstacle bounds are cached rather than recalculated for every object each frame.
- Catalog thumbnails are requested near the visible scroll area, cached, and canceled when no longer needed. The temporary thumbnail renderer and its environment resources are released after the queue drains.
- Disabling contact shading releases its render targets; disabling shadows releases the directional shadow map.

## Measurements and checks

Measured on the unchanged furnished **Sunday Loft** demo, including its wall art:

| Furniture geometry | Before | After |
| --- | ---: | ---: |
| Meshes | 712 | 162 |
| Triangles | 137,992 | 137,992 |

That is a 77.2% reduction in furniture mesh submissions per pass. It is not a whole-frame draw-call count or an FPS claim: architecture, transparent objects, shadows and postprocessing also contribute work, and performance varies with device and viewpoint.

Automated checks compare triangle counts and world bounds with batching enabled/disabled for all 278 catalog entries. They also cover independent countertop materials, saved appearance validation, geometry reuse, hobby coverage, graphics preferences, non-overlapping initial placement and the furnished loft reaching physics sleep. Browser checks verified visible customization, persistence after reload, graphics resolution changes, a clean console and a temporary idle render counter that stopped advancing (diagnostic instrumentation was removed afterward).

Before/after screenshots were reviewed at Original quality. Geometry and materials retain the current look; batching can produce small edge and ambient-occlusion rasterization differences, so the result is not claimed to be pixel-identical. No native-device FPS or battery-life benchmark was performed.

The rendering strategy follows Three.js guidance on [rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html).

## Anti-aliasing

The room renders through offscreen buffers for contact shading, so the canvas `antialias` flag alone did not smooth its edges. Graphics settings now offer Off, Fast (FXAA) and High (SMAA). SMAA runs before OutputPass in linear color; FXAA runs afterward in display color. Their pixel sizes follow the actual render resolution. Switching modes disposes unused passes and render targets. SMAA lookup textures are embedded in Three.js, require no network service, and trigger a redraw when decoded, including in idle scenes. Older saved profiles migrate to the appropriate default: Original uses SMAA, Balanced/Performance use FXAA, and Battery saver uses Off. See [Three.js SMAAPass documentation](https://threejs.org/docs/pages/SMAAPass.html).
