import {test} from 'node:test';import assert from 'node:assert/strict';
import {CATALOG,makeItem} from './catalog.js';import {createBlankDesign} from './designs.js';import {findPlacement,footprint} from './placement.js';
test('a bicycle spawns clear of an existing treadmill',()=>{
  const d=createBlankDesign('loft'),treadmill=CATALOG.find(i=>i.model==='treadmill'),bike=CATALOG.find(i=>i.model==='bicycle');
  const first=findPlacement(treadmill,d);d.items.push(makeItem(treadmill.id,first.x,first.z));const next=findPlacement(bike,d);
  const a=footprint(treadmill,d.items[0]),b=footprint(bike,{...next,scale:1,rotation:0});
  assert.ok(Math.abs(a.x-b.x)>=a.halfX+b.halfX||Math.abs(a.z-b.z)>=a.halfZ+b.halfZ);
});
test('large hobby equipment stays inside a compact studio',()=>{
  const d=createBlankDesign('studio');for(const def of CATALOG.filter(i=>i.category==='hobbies')){const p=findPlacement(def,d);assert.ok(p,def.id);assert.ok(Math.abs(p.x)+def.size[0]/2<=3.5,def.id);assert.ok(Math.abs(p.z)+def.size[2]/2<=3,def.id);}
});
