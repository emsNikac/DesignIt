# Rendering optimization

The default **Original** graphics preset keeps the existing appearance: a device pixel ratio capped at 1.75, 2048-pixel soft shadows, 12-sample GTAO with the same parameters, full PBR material, geometry and texture detail. Time-dependent lighting now includes the switchable interior sources described in [studio controls](studio-controls.md). High-quality SMAA edge smoothing is now enabled in Original; the prior furniture geometry and material detail remain. Lower quality is an explicit player choice.

## Changes independent of graphics quality

- Opaque meshes with matching material, editable part and shadow flags are merged within each furniture object. Transform positions, normals and UVs are baked into the merged geometry. Transparent surfaces remain separate for sorting. Original bounds are retained for fitted models, placement and selection.
- Primitive and merged geometry is reused between objects and appearance edits. Material and texture pooling remains shared. Removing one object does not dispose shared resources needed by another.
- The animation loop skips drawing while nothing changes or the document is hidden. Camera movement, edits, daylight changes and active physics invalidate the render. A lightweight animation callback remains active; this is not a claim of zero idle CPU use.
- Directional shadow maps update after geometry, lighting or visibility changes, rather than on every camera frame.
- Rigid-body stepping pauses after all dynamic props sleep. The small planter collides with its pot rather than treating flexible leaves as a solid box; the old box wedged against a shelf in the furnished loft and kept physics awake indefinitely. Appearance edits preserve an existing physics body.
- Walkthrough obstacle bounds are cached rather than recalculated for every object each frame.
- Catalog thumbnails are requested near the visible scroll area and canceled when no longer needed. One preview renderer is reused across idle batches; it is explicitly disposed and its WebGL context released when the application unmounts. Each preview uses isolated temporary geometry, materials and textures that are disposed immediately after capture. Browsing does not populate the merged-model cache. Off-screen image elements unload, and the PNG cache holds at most 128 previews.
- Disabling contact shading releases its render targets; disabling shadows releases the directional shadow map.

## Measurements and checks

Measured on the unchanged furnished **Sunday Loft** demo, including its wall art:

| Furniture geometry | Before | After |
| --- | ---: | ---: |
| Meshes | 712 | 162 |
| Triangles | 137,992 | 137,992 |

That is a 77.2% reduction in furniture mesh submissions per pass. It is not a whole-frame draw-call count or an FPS claim: architecture, transparent objects, shadows and postprocessing also contribute work, and performance varies with device and viewpoint.

Automated checks compare triangle counts and world bounds with batching enabled/disabled for all 629 catalog entries. They also cover independent countertop materials, saved appearance validation, geometry reuse, hobby coverage, graphics preferences, non-overlapping initial placement and the furnished loft reaching physics sleep. Browser checks verified visible customization, persistence after reload, graphics resolution changes, a clean console and a temporary idle render counter that stopped advancing (diagnostic instrumentation was removed afterward).

Before/after screenshots were reviewed at Original quality. Geometry and materials retain the current look; batching can produce small edge and ambient-occlusion rasterization differences, so the result is not claimed to be pixel-identical. No native-device FPS or battery-life benchmark was performed.

The rendering strategy follows Three.js guidance on [rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html).

## Anti-aliasing

The room renders through offscreen buffers for contact shading, so the canvas `antialias` flag alone did not smooth its edges. Graphics settings now offer Off, Fast (FXAA) and High (SMAA). SMAA runs before OutputPass in linear color; FXAA runs afterward in display color. Their pixel sizes follow the actual render resolution. Switching modes disposes unused passes and render targets. SMAA lookup textures are embedded in Three.js, require no network service, and trigger a redraw when decoded, including in idle scenes. Older saved profiles migrate to the appropriate default: Original uses SMAA, Balanced/Performance use FXAA, and Battery saver uses Off. See [Three.js SMAAPass documentation](https://threejs.org/docs/pages/SMAAPass.html).

## Catalog scrolling and recovery

The previous thumbnail path created a WebGL renderer for every idle batch. Calling `dispose()` released its renderer resources but left context lifetime to the browser. Repeated batches could therefore put pressure on the context limit, potentially evicting the older context used by the flat. The screenshot alone did not include driver logs, so this was treated as an identified resource-lifetime defect rather than a proven reproduction of that particular Brave failure.

The preview service now reuses a single context and explicitly releases it on teardown. Shared geometry caching is capped at 32 MiB, pooled material entries at 128, canvas texture entries at 32, and PNG previews at 128. Eviction drops cache ownership without destroying resources still held by the flat. These limits bound the caches, not total application memory: live models, browser allocations and render targets add memory.

The main canvas handles `webglcontextlost` with a visible recovery message. On restoration it recreates the environment map and composer buffers, refreshes shadows and resumes drawing. A manual Restore 3D view action recreates the renderer while preserving the current in-memory design. Failed renderer initialization also releases its partially created context.

Validation includes 100 separate preview batches using one backend, isolated GPU-resource disposal, cancellation/error continuation, cache eviction, and browser scrolling through all nine main categories (108 scroll actions) with the scene remaining ready and no warnings or errors. A temporary local harness forced real WebGL loss/restoration and exercised the manual recovery control. No hardware-specific Brave GPU-driver crash was reproduced.

References: [Three.js WebGLRenderer lifecycle](https://threejs.org/docs/pages/WebGLRenderer.html), [WebGL context-loss events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event).
