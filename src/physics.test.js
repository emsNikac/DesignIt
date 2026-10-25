import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,makeItem,DEFAULT_DESIGN,validateDesign,LAYOUTS,initialItems} from './catalog.js';
import {createWorld,createBody,canPlaceBody} from './physics.js';

const body=(id,x=0,y=0,z=0)=>createBody(CATALOG.find(i=>i.id===id),makeItem(id,x,z,0,y));
const settle=world=>{for(let i=0;i<300;i++)world.step(1/60);};
test('a small object falls onto the floor',()=>{const w=createWorld(10,8),v=body('vase',2,2,0);w.addBody(v);settle(w);assert.ok(Math.abs(v.position.y)<.025);});
test('a small object rests on a coffee table',()=>{const w=createWorld(10,8),t=body('table-oak'),v=body('vase',0,1.5);w.addBody(t);w.addBody(v);settle(w);assert.ok(v.position.y>.38&&v.position.y<.43,`height ${v.position.y}`);});
test('a floating wall shelf supports small decor',()=>{const w=createWorld(10,8),s=body('shelf-wall',0,1.2),v=body('vase',0,1.8);w.addBody(s);w.addBody(v);settle(w);assert.ok(Math.abs(v.position.y-1.45)<.02,`height ${v.position.y}`);});
test('the new open shelving supports books inside its frame',()=>{const w=createWorld(10,8),s=body('shelf-low'),b=body('books',.3,.55);w.addBody(s);w.addBody(b);settle(w);assert.ok(b.position.y>.42&&b.position.y<.46,`height ${b.position.y}`);});
test('books fit between open shelves',()=>{const w=createWorld(10,8),s=body('shelf-oak'),b=body('books',-.38,1.55);w.addBody(s);w.addBody(b);settle(w);const shelfTop=.43+2*.46+.045/2;assert.ok(Math.abs(b.position.y-shelfTop)<.01,`height ${b.position.y}`);});
test('a removed support lets a sleeping object fall',()=>{const w=createWorld(10,8),t=body('table-oak'),v=body('vase',0,1.5);w.addBody(t);w.addBody(v);settle(w);w.removeBody(t);v.wakeUp();settle(w);assert.ok(Math.abs(v.position.y)<.025);});
test('furniture placement rejects intersecting solid furniture',()=>{const w=createWorld(10,8),a=body('sofa-olive'),b=body('sofa-sand',.4,0,.1);w.addBody(a);w.addBody(b);assert.equal(canPlaceBody(w,b,[a]),false);b.position.x=4;b.aabbNeedsUpdate=true;assert.equal(canPlaceBody(w,b,[a]),true);});
test('every starter layout is a valid portable design',()=>{for(const l of LAYOUTS){const d={...DEFAULT_DESIGN(),layoutId:l.id,items:initialItems(l.id)};assert.equal(validateDesign(JSON.parse(JSON.stringify(d))).layoutId,l.id);}});
test('import rejects unknown models, invalid colors and non-finite coordinates',()=>{const d=DEFAULT_DESIGN();d.items[0].catalogId='not-a-model';assert.throws(()=>validateDesign(d));const a=DEFAULT_DESIGN();a.items[0].x=NaN;assert.throws(()=>validateDesign(a));const b=DEFAULT_DESIGN();b.wallColor='invalid';assert.throws(()=>validateDesign(b));});
