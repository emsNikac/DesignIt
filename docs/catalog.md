# Catalog coverage

The catalog contains 709 items. The indoor expansion added 351 entries with different construction, silhouettes or motifs; the floor-plan update adds 80 distinct outdoor pieces. Existing IDs and saved designs remain compatible. Hobbies and Walls & dividers retain their existing collections.

| Category | Items |
| --- | ---: |
| Seating | 64 |
| Tables | 60 |
| Storage | 61 |
| Lighting | 61 |
| Décor | 63 |
| Rugs | 66 |
| Kitchen | 62 |
| Bedroom | 61 |
| Bathroom | 63 |
| Hobbies | 60 |
| Walls & dividers | 8 |
| Outdoor living | 80 |

Each of the nine main categories passes an automated minimum of **50 distinct constructions or rug motifs**. The check ignores palette, mesh ordering, position and uniform scale, so recoloring or uniformly enlarging a model cannot increase the count. Rug motifs are checked independently for different drawing operations. This is a regression guard; visual review is still necessary to assess design quality.

## The expanded collection

- **Seating:** 36 new dining chairs, including spindle, wishbone, ladder, cross, fan, medallion, cane, scoop, shell, bentwood, scallop, lattice, wing, rattan, hoop, fretwork, channel and keyhole backs. Frames include tapered, splayed, turned, sled, cantilever, pedestal, swivel, hairpin and Eiffel bases.
- **Tables:** 40 new combinations for family dinners, wedding banquets, cocktail gatherings, buffet service and games nights. Tops include round, oval, rectangular, racetrack, hexagonal, octagonal, kidney and scalloped shapes; supports include four legs, trestles, pedestals, sleds and crossed frames.
- **Storage:** low, tower, arched, leaning, asymmetric, corner, stepped and floating constructions with open, apothecary, shoji, tambour and glass fronts.
- **Lighting:** floor, table, pendant, wall, chandelier, task, lantern and ceiling fixtures with bell, opal, conical, pleated or petal shades.
- **Décor:** plants, sculptural vases, artwork, blinds, tapestry, mirrors, fireplace designs, a typewriter, gramophone, telescope and other accents.
- **Rugs:** 50 additional shape/motif combinations: area, round, oval, hexagonal and runner forms with medallion, kilim, chevron, arches, dots, Greek-key, sunburst, botanical, patchwork and maze designs. Motif and base colors can be edited independently.
- **Kitchen:** refrigerators, ovens, ranges, islands, sink units, serving carts, small appliances and cookware. Countertops remain separately customizable.
- **Bedroom:** 12 bed/headboard constructions plus wardrobes, bedside tables, vanities, daybeds, nursery pieces and dressing accessories.
- **Bathroom:** baths, washstands, toilets, shower enclosures, mirrors, towel storage, laundry pieces and spa accessories.

New anchored furniture derives compound collision boxes from its rendered parts, including the fitting transform. This keeps shelves and work surfaces aligned with their visible height. Dining chairs have separate seat, leg and backrest colliders so they can tuck under a table. Curved surfaces are approximated by component bounds; this remains a design sandbox rather than a manufacturing or engineering simulator.

## Outdoor living

Eight families each contain ten different constructions: seating, shelters, boundaries, planting, ground surfaces, amenities, accents and leisure. Examples include an Adirondack chair, hammock, pergola, gazebo, greenhouse, glass railing, gate, rose trellis, vegetable bed, road segment, stepping stones, grill, pond, hot tub, festoon lights, sundial, sandpit, garden swing, tool shed and bicycle rack. Parts have independent colors and finishes.

Outdoor anchored pieces derive component colliders from the fitted render. Walking can pass between pergola posts and under elevated roofs. Ground pieces act as surface overlays, without rigid-body obstacles. Curves and foliage retain approximate collision shapes.
