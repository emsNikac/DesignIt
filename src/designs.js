import { DEFAULT_DESIGN, LAYOUTS, initialItems, makeItem, validateDesign } from './catalog.js';

export const LIBRARY_KEY = 'forma-library-v2';
const read = (storage, key) => { try { return JSON.parse(storage.getItem(key)); } catch { return null; } };
const newId = () => `design-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
const layoutFor = id => { const layout = LAYOUTS.find(l => l.id === id); if (!layout) throw new Error('Choose a supported flat layout.'); return layout; };

export function createDemo(layoutId) {
  const layout = layoutFor(layoutId);
  return { ...DEFAULT_DESIGN(), designId: `demo-${layoutId}`, kind: 'demo', name: layout.name,
    layoutId, items: [...initialItems(layoutId), makeItem('art', -layout.width / 2 + .12, -layout.depth * .13, Math.PI / 2, 1.15)] };
}

export function createBlankDesign(layoutId, name = '') {
  const layout = layoutFor(layoutId);
  return { ...DEFAULT_DESIGN(), designId: newId(), kind: 'design', name: name.trim().slice(0, 80) || `${layout.name} — my design`, layoutId, items: [] };
}

export function personalCopy(design) {
  return { ...design, designId: newId(), kind: 'design',
    name: design.kind === 'demo' && design.name === layoutFor(design.layoutId).name ? `${design.name} — my version` : design.name };
}

export function readLibrary(storage) {
  const value = read(storage, LIBRARY_KEY);
  const designs = [];
  if (value?.version === 2 && Array.isArray(value.designs)) {
    const ids = new Set();
    for (const saved of value.designs) {
      try {
        const design = validateDesign(saved);
        if (saved.kind !== 'design' || typeof saved.designId !== 'string' || !saved.designId.startsWith('design-') || ids.has(saved.designId)) continue;
        ids.add(saved.designId); designs.push({ ...design, kind: 'design', designId: saved.designId });
      } catch { /* One damaged save must not hide other homes. */ }
    }
    return { version: 2, activeId: typeof value.activeId === 'string' ? value.activeId : 'demo-loft', designs, favoriteIds: Array.isArray(value.favoriteIds) ? value.favoriteIds : undefined };
  }
  // Preserve existing per-layout saves when upgrading from the original studio.
  const active = read(storage, 'forma-design-v1');
  for (const layout of LAYOUTS) {
    const old = active?.layoutId === layout.id ? active : read(storage, `forma-space-${layout.id}`);
    if (!old) continue;
    try { designs.push({ ...validateDesign(old), designId: `design-legacy-${layout.id}`, kind: 'design' }); } catch {}
  }
  return { version: 2, activeId: designs.find(d => d.layoutId === active?.layoutId)?.designId || 'demo-loft', designs };
}

export function loadWorkspace(storage) {
  const library = readLibrary(storage);
  const saved = library.designs.find(d => d.designId === library.activeId);
  if (saved) return saved;
  const layoutId = library.activeId.replace(/^demo-/, '');
  const demo=createDemo(LAYOUTS.some(l => l.id === layoutId) ? layoutId : 'loft');
  return {...demo,favoriteIds:library.favoriteIds || demo.favoriteIds};
}

export function saveWorkspace(storage, design) {
  const library = readLibrary(storage);
  if (design.kind === 'design') {
    const index = library.designs.findIndex(d => d.designId === design.designId);
    if (index < 0) library.designs.unshift(design); else library.designs[index] = design;
  }
  library.activeId = design.designId;
  library.favoriteIds = design.favoriteIds;
  storage.setItem(LIBRARY_KEY, JSON.stringify(library));
  return library;
}

export function deleteSavedDesign(storage,designId){
  const library=readLibrary(storage);
  if(!library.designs.some(d=>d.designId===designId))throw new Error('This saved design could not be found.');
  library.designs=library.designs.filter(d=>d.designId!==designId);
  if(library.activeId===designId)library.activeId=library.designs[0]?.designId||'demo-loft';
  storage.setItem(LIBRARY_KEY,JSON.stringify(library));
  return library;
}
