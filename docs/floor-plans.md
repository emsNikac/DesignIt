# Floor plans

Open **Layouts → Create a floor plan**, or **New design → Draw my own shape**. If an unfinished draft exists, the button continues it. To use an existing outline, choose **Copy shape** on a layout or saved-design card. Copying starts a new draft and leaves the source home fixed.

## Create the map

1. Name the layout. In **Draw dots**, click successive corners and click the first dot again, or choose **Close outline**. Every line becomes a wall, initially solid. Arbitrary angles are supported.
2. Add rooms inside the first outline, or join additional outlines along an edge. **Connect & align** aligns points to existing corners and a 25 cm grid. Turn it off to draw freely. One grid square is one meter.
3. Alternatively, choose a rectangle, L, bay or octagonal template, set its width/depth and rotation, then **Place on map**. Select an area to attach a template above, below, left or right. Matching shared edges become one wall, including T-junctions.
4. Use **Move corners / areas** to drag corners or entire areas. Double-click an edge to insert a corner. Selected corners also have exact X/Z fields. Undo/redo applies to draft edits. **Pan map** (or a middle/right drag) moves around the drawing, and the zoom/fit buttons keep large plans easy to reach.
5. Mark each area as an indoor room, terrace, garden or outdoor path. Indoor room uses include living, bedroom, kitchen, bathroom, hall and office. Bathrooms receive the bathroom tile material. Outdoor surfaces include grass, decking, paving, gravel and asphalt. Outdoor areas have no ceiling.
6. In **Wall designs**, tap an edge and choose solid, windowed, full glass, doorway, wide opening, half wall, timber screen, fence/railing or open space. Doorways and openings permit walking. Selected outdoor areas also have bulk **Open outdoor edges** and **Fence outdoor edges** actions; their shared house walls stay unchanged.
7. Choose the **Open viewing side**. The 3D preview shows the cutaway, without removing interior room dividers. It can be orbited independently.
8. **Review layout**, then **Confirm layout & furnish** creates an empty saved home. This fixes its footprint, room boundaries, wall designs and viewing side. There is no structural editor for a confirmed home. To change its structure, copy its shape into a new draft and confirm a separate home. Furniture, colors, wall finishes and outdoor ground finishes remain editable.

Drafts autosave in this browser/device; **Save draft & close** retains the unfinished map. There is one working draft. Copying another layout starts a draft from that shape. JSON export/import includes a confirmed plan and its finishes; premade designs keep their existing layout IDs.

## Geometry and limits

Layouts are single-floor, up to 32 × 32 m, with up to 40 connected areas, 256 total corners and 400 resulting wall segments. Individual outlines allow 3–64 corners and edges of at least 20 cm. The editor rejects crossing outlines, partial room overlaps, disconnected islands and corner-only connections. A room can sit completely inside a larger outline; its surface replaces that part of the larger floor. Rooms can surround an empty courtyard hole, or the hole can be filled with a garden zone. Add the entire garden or terrace floor area before placing outdoor furniture.

Furniture footprints must lie on the actual floor, including rotated corners; large objects cannot span a missing corner or courtyard void. Physics floor triangles and structural collision sections follow the same geometry. Walkthrough restores the exterior envelope and ceilings above indoor areas. Furnishing remains approximate rigid-body simulation: furniture is anchored and small objects use gravity. This is not a building-code or architectural engineering tool.

## Larger premade homes

| Layout | Total floor area | Indoor rooms | Shape |
| --- | ---: | ---: | --- |
| The Branching House | 225 m² | 7 | A central hall with rooms branching to both sides and a terrace |
| The Garden L | 151 m² | 4 | Two wings with a sheltered terrace |
| The Courtyard Home | 252 m² | 6 | A home surrounding an open garden courtyard |
| The City Gallery | 250 m² | 8 | A long gallery hall and garden balcony |
| The Family Garden | 324 m² | 7 | Bedroom and work wings with a broad garden |
| The Open Atelier | 295.5 m² | 3 | An angled open plan with a side terrace |

Areas include terrace/garden zones. Each has a furnished demo and an empty-design option. The original Sunday Loft, Little City Studio, Parkside Flat and Skyline Penthouse remain available with their original furniture and shapes.

All geometry and outdoor models are generated locally. Polygon clipping uses the installed `polygon-clipping` package; no external server, account, asset API or online deployment is required.
