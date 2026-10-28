# Studio controls and lighting

## Selection and navigation

Clicking a piece in 3D view or floor plan frames its bounds in the usable part of the canvas, beside the inspector and below the toolbar. The first focused selection stores the current camera position and orbit target. Switching between pieces retains that original pose. Escape, the inspector's close button, or an empty-space click restores it. The Focus item button frames the current piece again. Flat walls intersecting the focused sight lines temporarily cut away and return on deselection; their design and collision data do not change. A phone-sized inspector sits over the catalog below the stage.

WASD translates the regular 3D camera and orbit target together on the horizontal plane. It does not rotate or move furniture. Orbit, right-drag pan and scroll zoom remain available. Typing in fields and opening library/help/confirmation dialogs suspend camera keyboard movement. Walkthrough keeps its existing mouse-look, WASD, Shift and arrow controls.

Move mode remains selected when a piece is deselected, removed or closed. Choose Navigate or press H to leave it. Select mode still returns to Navigate after deselection.

## Catalog placement

Drag a catalog image or name onto the canvas with a mouse/trackpad. A translucent model previews the position; its outline indicates whether the piece fits. Drops use the pointed-to position and current grid setting. Dropping selects the piece for editing while preserving the camera; subsequent appearance edits or physics updates do not trigger focus. Clicking the placed piece requests focus, including when it is already selected. Moving existing furniture also preserves the camera; a short click requests focus after release. Larger pieces check room/furniture colliders; small pieces can land on upward-facing shelves and worktops. An invalid drop, a drop outside the flat, or cancellation adds no item. Clicking to add remains available, including on touch devices without native HTML drag support. A successful addition is one undo step.

## Walkthrough entry

The entry search checks the usual starting point against furniture, room partitions and player-placed wall sections. If it is occupied, it chooses a nearby clear point, preferring one with room to step away. Movement is subdivided and slides along obstacles. Placing furniture around a player triggers relocation. If furniture occupies every sampled point, an escape fallback temporarily relaxes furniture collisions; room bounds and wall sections still apply. Normal collisions resume upon reaching a clear point. This remains an approximate navigation system rather than a human-body physics simulator.

## Light switch and materials

The saved Light switch controls built-in ceiling fixtures, up to eight placed lamps and the emission of placed light shades. The sun/moon source remains independent of that switch. Sunlight and cool, dim moonlight come directionally from outside the rear windows. Window glass and the backdrop no longer block those shadow rays. Sky fill and environment reflections dim at night, with consistent exposure. The previous automatic center point light is removed.

Two installed spotlights cast 512-pixel shadows at Medium shadow detail or above. Lower shadow presets disable these additional shadows. Other interior sources provide local illumination. This lighting approximates room illumination; it does not calculate astronomical positions, light bouncing between rooms, or ray-traced reflections. The switch and custom shades survive local saves and portable JSON files; older saves default to lights on.

Bathroom tiles offer 24 named colors plus a picker and hex entry. The original sage, cream, terracotta and charcoal identifiers stay compatible. Tiles continue to apply to the two layouts with bathrooms.

## Design deletion

Each personal design in My spaces has a Delete action. The confirmation names the design, explains permanence, focuses Keep design and traps keyboard focus between the two choices. Escape/backdrop/cancellation leaves the save intact. Only an explicit Delete design action removes it. Deleting the active design opens another saved home, or the Sunday Loft demo when no personal designs remain. Furnished demos cannot be deleted. Undo history is cleared when the active design is removed, and the normal autosave cannot reinsert that deleted active document.

## Validation

The 74-test suite covers camera framing/restoration, temporary wall visibility, unchanged furniture during camera panning, persistent Move mode, obstructed entry across all four layouts, obstacle sliding, dense-floor escape, floor and worktop catalog drops, invalid/cancelled previews, actual light/emission switching, tile and switch persistence, and inactive/active/last-design deletion.

Browser checks measured zero camera position, rotation, target and field-of-view change after a native catalog drop, followed by focus on clicking that already-selected item and exact position restoration on Escape. They also exercised native catalog dragging to a chosen floor coordinate, off-floor rejection, selection/Escape restoration, WASD movement, a bed at the original walkthrough spawn, midnight with interior lights on/off, tile presets and custom hex entry, confirmation/cancellation, and persistence after reload. A 390 × 844 viewport check verified that the inspector stays below the canvas without horizontal page overflow and that camera focus avoids the mobile controls. No native-device performance benchmark was performed.
