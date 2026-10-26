import { EXTRA_ITEMS } from './collection.js';
import {validateAppearance,PATTERNS} from './appearance.js';
import {HOBBY_ITEMS} from './hobbies.js';

export const CATEGORIES = [
  { id: 'all', name: 'All items' }, { id: 'seating', name: 'Seating' },
  { id: 'tables', name: 'Tables' }, { id: 'storage', name: 'Storage' },
  { id: 'lighting', name: 'Lighting' }, { id: 'decor', name: 'Décor' },
  { id: 'rugs', name: 'Rugs' }, { id: 'kitchen', name: 'Kitchen' },
  { id: 'bedroom', name: 'Bedroom' }, { id: 'bathroom', name: 'Bathroom' },
  { id: 'hobbies', name: 'Hobbies' },
];

const item = (id, name, category, model, color, size, extra = {}) => ({ id, name, category, model, color, size, ...extra });
export const CATALOG = [
  item('sofa-olive', 'Sola linen sofa', 'seating', 'sofa', '#7c8060', [2.8, .92, 1.05], { tag: 'Bestseller', finish: 'Olive linen' }),
  item('chair-cream', 'Arc lounge chair', 'seating', 'chair', '#e4dac9', [.9, .88, .85], { finish: 'Ivory bouclé' }),
  item('table-oak', 'Pebble coffee table', 'tables', 'coffee', '#9b754f', [1.35, .4, .75], { finish: 'Natural oak' }),
  item('lamp-arch', 'Halo floor lamp', 'lighting', 'floorlamp', '#403b31', [.55, 1.95, .55], { finish: 'Warm brass' }),
  item('shelf-oak', 'Grid open bookcase', 'storage', 'shelf', '#ab8660', [1.6, 2, .36], { finish: 'Natural oak' }),
  item('plant-ficus', 'Ficus & clay planter', 'decor', 'plant', '#7b8961', [.7, 1.65, .7], { finish: 'Terracotta' }),
  item('sofa-sand', 'Cloud modular sofa', 'seating', 'sofa', '#dfd3bd', [2.8, .92, 1.05], { finish: 'Sand linen' }),
  item('chair-rust', 'Arc accent chair', 'seating', 'chair', '#ad674b', [.9, .88, .85], { finish: 'Burnt sienna' }),
  item('sofa-slate', 'Sola charcoal sofa', 'seating', 'sofa', '#53595a', [2.8, .92, 1.05], { finish: 'Slate weave' }),
  item('chair-wood', 'Milo dining chair', 'seating', 'diningchair', '#9b7854', [.48, .85, .52], { finish: 'Oak & linen' }),
  item('stool-oak', 'Noma counter stool', 'seating', 'stool', '#a98860', [.42, .75, .42], { finish: 'Solid oak' }),
  item('bench', 'Everyday oak bench', 'seating', 'bench', '#aa855e', [1.45, .46, .4], { finish: 'Oiled oak' }),
  item('table-round', 'Gather dining table', 'tables', 'dining', '#9d7955', [1.4, .76, 1.4], { finish: 'Smoked oak' }),
  item('table-side', 'Pillar side table', 'tables', 'side', '#bcaa8f', [.45, .5, .45], { finish: 'Travertine' }),
  item('desk', 'Studio writing desk', 'tables', 'desk', '#ad8c65', [1.4, .76, .65], { finish: 'White oak' }),
  item('coffee-dark', 'Pebble walnut table', 'tables', 'coffee', '#634832', [1.35, .4, .75], { finish: 'American walnut' }),
  item('console', 'Lowline sideboard', 'storage', 'console', '#a67b50', [1.8, .72, .42], { finish: 'Ribbed oak' }),
  item('shelf-black', 'Grid graphite shelf', 'storage', 'shelf', '#49473f', [1.6, 2, .36], { finish: 'Graphite ash' }),
  item('dresser', 'Linea chest of drawers', 'storage', 'dresser', '#c3a17c', [1.1, .9, .45], { finish: 'Bleached oak' }),
  item('wardrobe', 'Frame wardrobe', 'storage', 'wardrobe', '#d3c5b0', [1.5, 2.2, .6], { finish: 'Warm white' }),
  item('lamp-table', 'Mushroom table light', 'lighting', 'tablelamp', '#e4d3b3', [.35, .43, .35], { finish: 'Milk glass', small: true }),
  item('lamp-paper', 'Akari paper floor light', 'lighting', 'paperlamp', '#f2e5cb', [.5, 1.5, .5], { finish: 'Rice paper' }),
  item('pendant', 'Luna pendant', 'lighting', 'pendant', '#bc9b70', [.65, .55, .65], { finish: 'Woven rattan', ceiling: true }),
  item('lamp-black', 'Task desk lamp', 'lighting', 'tasklamp', '#454941', [.28, .55, .28], { finish: 'Matte black', small: true }),
  item('vase', 'Terra ceramic vase', 'decor', 'vase', '#b57755', [.22, .34, .22], { finish: 'Fired clay', small: true }),
  item('vase-white', 'Forma sculptural vase', 'decor', 'vase', '#dcd5c7', [.22, .34, .22], { finish: 'Chalk ceramic', small: true }),
  item('books', 'A well-read collection', 'decor', 'books', '#8a7e62', [.38, .3, .18], { finish: 'Five favorite titles', small: true }),
  item('book-stack', 'Sunday reading stack', 'decor', 'bookstack', '#ab8870', [.32, .13, .24], { finish: 'Art & architecture', small: true }),
  item('plant-small', 'Little olive tree', 'decor', 'smallplant', '#69805b', [.3, .5, .3], { finish: 'Stone planter', small: true }),
  item('plant-monstera', 'Monstera deliciosa', 'decor', 'monstera', '#4e7145', [.8, 1.15, .8], { finish: 'Sandstone pot' }),
  item('bowl', 'Still ceramic bowl', 'decor', 'bowl', '#b7a68d', [.3, .09, .3], { finish: 'Hand-glazed', small: true }),
  item('candle', 'Evening candle', 'decor', 'candle', '#dbceaf', [.1, .17, .1], { finish: 'Warm vanilla', small: true }),
  item('mirror', 'Arch floor mirror', 'decor', 'mirror', '#9b805b', [.75, 1.8, .1], { finish: 'Brushed brass' }),
  item('art', 'Composition No. 04', 'decor', 'art', '#ae7f58', [.9, 1.15, .06], { finish: 'Framed print', wall: true }),
  item('rug-jute', 'Meadow woven rug', 'rugs', 'rug', '#b8a88a', [3.1, .025, 2.2], { finish: 'Natural jute', rug: true }),
  item('rug-cream', 'Cloud wool rug', 'rugs', 'rug', '#ddd3c1', [3.1, .025, 2.2], { finish: 'Ivory wool', rug: true }),
  item('rug-rust', 'Atlas patterned rug', 'rugs', 'rug', '#a97962', [3.1, .025, 2.2], { finish: 'Rust & cream', rug: true, pattern: true }),
  item('rug-round', 'Circle braided rug', 'rugs', 'roundrug', '#bca98b', [2, .025, 2], { finish: 'Braided jute', rug: true }),
  item('kitchen', 'Atelier kitchen unit', 'kitchen', 'kitchen', '#c5beaa', [2.7, .95, .65], { finish: 'Sage & quartz' }),
  item('island', 'The gathering island', 'kitchen', 'island', '#a98a64', [1.7, .94, .8], { finish: 'Oak & marble' }),
  item('fridge', 'Retro refrigerator', 'kitchen', 'fridge', '#d8d9ca', [.65, 1.8, .68], { finish: 'Soft sage' }),
  item('oven', 'Built-in cooking station', 'kitchen', 'oven', '#555951', [.65, .91, .65], { finish: 'Brushed steel' }),
  item('kettle', 'Pour-over kettle', 'kitchen', 'kettle', '#5d6655', [.22, .23, .22], { finish: 'Sage enamel', small: true }),
  item('bed', 'Drift upholstered bed', 'bedroom', 'bed', '#c7b99f', [1.8, 1.05, 2.1], { finish: 'Oat linen' }),
  item('bed-olive', 'Drift sage bed', 'bedroom', 'bed', '#8d9476', [1.8, 1.05, 2.1], { finish: 'Sage linen' }),
  item('nightstand', 'Lune bedside table', 'bedroom', 'nightstand', '#a8855f', [.48, .5, .4], { finish: 'White oak' }),
  item('toilet', 'Pure ceramic toilet', 'bathroom', 'toilet', '#eeeae1', [.43, .8, .7], { finish: 'White porcelain' }),
  item('bath', 'Sol freestanding tub', 'bathroom', 'bath', '#eeece4', [1.65, .6, .78], { finish: 'Matte porcelain' }),
  item('vanity', 'Float bathroom vanity', 'bathroom', 'vanity', '#af8a61', [.95, .85, .5], { finish: 'Oak & ceramic' }),
  item('shower', 'Rain walk-in shower', 'bathroom', 'shower', '#b2a68f', [.95, 2.15, .95], { finish: 'Glass & brass' }),
  item('towelrack', 'Everyday towel rail', 'bathroom', 'towelrack', '#9e927b', [.6, .9, .3], { finish: 'Brass & cotton' }),
  ...EXTRA_ITEMS,
  ...HOBBY_ITEMS,
];

export const SWATCHES = ['#7c8060', '#dfd3bd', '#e4dac9', '#ad674b', '#53595a', '#8d9a9d', '#bba38d', '#634832', '#d4c3a2', '#464b3d'];
export const WALL_COLORS = [
  { name: 'Warm chalk', color: '#e8e4d9' }, { name: 'Linen', color: '#d6cab5' },
  { name: 'Soft sage', color: '#b2baa3' }, { name: 'Terracotta', color: '#c69276' },
  { name: 'Dusty blue', color: '#a6b6bb' }, { name: 'Forest', color: '#687561' },
  { name: 'Blush', color: '#d6b5a7' }, { name: 'Charcoal', color: '#62645e' },
];
export const FLOOR_TYPES = [
  { id: 'oak', name: 'Natural oak', color: '#b8966d', type: 'wood' },
  { id: 'walnut', name: 'Smoked walnut', color: '#73523b', type: 'wood' },
  { id: 'ash', name: 'Whitewashed ash', color: '#d2c4a9', type: 'wood' },
  { id: 'concrete', name: 'Warm concrete', color: '#bab5a9', type: 'stone' },
  { id: 'terrazzo', name: 'Cream terrazzo', color: '#d9d1be', type: 'terrazzo' },
  { id: 'tiles', name: 'Limestone tile', color: '#c4bda8', type: 'tile' },
];
export const LAYOUTS = [
  { id: 'loft', name: 'The Sunday Loft', subtitle: 'Open plan. Endless possibilities.', area: 80, rooms: '1 room', width: 10, depth: 8, style: 'Open-plan loft', badge: 'Currently designing' },
  { id: 'studio', name: 'Little City Studio', subtitle: 'Good things, in a smaller space.', area: 42, rooms: '1 room', width: 7, depth: 6, style: 'Compact studio' },
  { id: 'apartment', name: 'The Parkside Flat', subtitle: 'A little room for every part of life.', area: 96, rooms: '3 rooms', width: 12, depth: 8, style: 'One-bedroom apartment', partitions: true },
  { id: 'penthouse', name: 'Skyline Penthouse', subtitle: 'More space. A different perspective.', area: 120, rooms: '3 rooms', width: 12, depth: 10, style: 'Generous penthouse', partitions: true },
];

let idCounter = 0;
export const makeItem = (catalogId, x = 0, z = 0, rotation = 0, y = 0, extra = {}) => ({
  uid: `item-${Date.now().toString(36)}-${++idCounter}`,
  catalogId, x, y, z, rotation, scale: 1, color: CATALOG.find(i => i.id === catalogId)?.color || '#ccc', ...extra,
});

export function initialItems(layoutId = 'loft') {
  if (layoutId === 'studio') return [
    makeItem('rug-cream', -.9, .25), makeItem('sofa-sand', -1.2, -.9),
    makeItem('table-oak', -1.15, .35), makeItem('plant-ficus', -2.75, -2.35),
    makeItem('kitchen', 1.6, -2.62), makeItem('bed', 2.1, 1.45),
    makeItem('lamp-paper', -2.65, -.8), makeItem('table-side', -2.65, .5),
    makeItem('vase', -1.35, .4, 0, .4), makeItem('shelf-oak', -3.18, 1.3, Math.PI/2),
  ];
  const base = [
    makeItem('rug-jute', -1.65, .45, 0, 0, { scale: 1.25 }),
    makeItem('sofa-olive', -1.85, -1.15),
    makeItem('chair-cream', .25, 1.85, -Math.PI * .83),
    makeItem('table-oak', -1.65, .5, -.12),
    makeItem('table-side', -3.65, -1.05),
    makeItem('lamp-table', -3.65, -1.05, 0, .5),
    makeItem('plant-ficus', -4.15, -2.9),
    makeItem('lamp-arch', -.1, -1.75, -.4),
    makeItem('shelf-oak', -4.65, .65, Math.PI / 2),
    makeItem('books', -4.65, .23, Math.PI / 2, .45),
    makeItem('books', -4.65, .87, Math.PI / 2, .91),
    makeItem('vase-white', -4.65, 1.16, 0, 1.37),
    makeItem('plant-small', -4.65, .1, 0, 1.83),
    makeItem('kitchen', 3.15, -3.6),
    makeItem('fridge', 4.57, -3.5),
    makeItem('island', 3.35, -1.5),
    makeItem('stool-oak', 2.85, -.65),
    makeItem('stool-oak', 3.85, -.65),
    makeItem('table-round', 2.6, 1.8),
    makeItem('chair-wood', 2.6, .75),
    makeItem('chair-wood', 2.6, 2.85, Math.PI),
    makeItem('chair-wood', 1.55, 1.8, -Math.PI / 2),
    makeItem('chair-wood', 3.65, 1.8, Math.PI / 2),
    makeItem('plant-monstera', 4.3, 3),
    makeItem('vase', -1.9, .45, 0, .4),
    makeItem('book-stack', -1.25, .6, -.2, .4),
    makeItem('bowl', 2.6, 1.8, 0, .76),
    makeItem('kettle', 3.8, -3.65, 0, .95),
    makeItem('pendant', 2.6, 1.8, 0, 2.25),
    makeItem('pendant', 3.35, -1.5, 0, 2.3),
  ];
  if (layoutId === 'apartment' || layoutId === 'penthouse') {
    const items = base.filter(i => !['kitchen', 'fridge', 'island', 'stool-oak', 'kettle', 'pendant'].includes(i.catalogId));
    for(const i of items){
      if(i.catalogId==='table-round'||i.catalogId==='chair-wood'||i.catalogId==='bowl'){i.x-=6.2;i.z+=.85;}
      if(i.x===-4.65)i.x=-5.65;
      if(i.catalogId==='plant-ficus')i.x=-5.1;
    }
    items.push(makeItem('bed', 3.65, -1.95), makeItem('nightstand', 2.25, -2.65), makeItem('lamp-table', 2.25, -2.65, 0, .5), makeItem('wardrobe', 5.55, -1.8, -Math.PI / 2), makeItem('toilet', 5.4, 1.15), makeItem('vanity', 2.9, 1.05), makeItem('bath', 4.7, 3.25), makeItem('towelrack', 2.6, 3.2));
    return items;
  }
  return base;
}

export const DEFAULT_DESIGN = () => ({ version: 1, name: 'A space of my own', layoutId: 'loft', wallColor: '#e8e4d9', floor: 'oak', bathTile: 'sage', time: 15.5, items: initialItems(), favoriteIds: ['sofa-olive', 'chair-cream', 'table-oak', 'plant-ficus'] });

export function validateDesign(value) {
  if (!value || value.version !== 1 || !LAYOUTS.some(l => l.id === value.layoutId) || !Array.isArray(value.items) || value.items.length > 400) throw new Error('Please choose a valid Forma design file.');
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const color = c => typeof c === 'string' && /^#[\da-f]{6}$/i.test(c);
  const ids = new Set();
  for (const i of value.items) {
    validateAppearance(i.appearance);
    if(i.pattern!==undefined&&(!PATTERNS.includes(i.pattern)||CATALOG.find(c=>c.id===i.catalogId)?.model!=='rug'))throw new Error('Unsupported rug pattern.');
    if (!CATALOG.some(c => c.id === i.catalogId) || typeof i.uid !== 'string' || ids.has(i.uid) || ![i.x,i.y,i.z,i.rotation,i.scale].every(finite) || i.scale < .3 || i.scale > 3 || Math.abs(i.x) > 20 || Math.abs(i.z) > 20 || i.y < 0 || i.y > 10 || !color(i.color)) throw new Error('This design contains unsupported items or positions.');
    ids.add(i.uid);
  }
  if (!FLOOR_TYPES.some(f => f.id === value.floor) || !color(value.wallColor) || !finite(value.time) || value.time < 0 || value.time > 24) throw new Error('This design contains unsupported materials.');
  return { ...value, name: String(value.name || 'Untitled space').slice(0, 80), favoriteIds: Array.isArray(value.favoriteIds) ? value.favoriteIds.filter(id => CATALOG.some(c => c.id === id)) : [], bathTile: ['sage','cream','terracotta','charcoal'].includes(value.bathTile) ? value.bathTile : 'sage' };
}
