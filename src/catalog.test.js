import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {CATALOG,CATEGORIES,makeItem} from './catalog.js';
import {createModel} from './models.js';
import {createBody} from './physics.js';
import {disposeOwnedGeometry} from './mesh-optimizer.js';

// Geometry can be checked without a GPU; the browser verifies texture rendering.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
test('the expanded collection has unique IDs and broad choices in every category',()=>{
  assert.ok(CATALOG.length>=170);assert.equal(new Set(CATALOG.map(d=>d.id)).size,CATALOG.length);
  for(const c of CATEGORIES.filter(c=>c.id!=='all'))assert.ok(CATALOG.filter(d=>d.category===c.id).length>=15,c.name);
});
test('every catalog entry builds a finite 3D model and an appropriate collider',()=>{
  for(const def of CATALOG){
    const model=createModel(def),bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3());
    assert.ok(!bounds.isEmpty(),def.id);assert.ok([size.x,size.y,size.z].every(n=>Number.isFinite(n)&&n>0),def.id);
    if(def.fit)for(let i=0;i<3;i++)assert.ok(Math.abs(size.getComponent(i)-def.size[i])<.001,`${def.id} dimension ${i}`);
    const body=createBody(def,makeItem(def.id));assert.equal(!!body,!(def.rug||def.ceiling||(def.wall&&!def.wallSupport)),def.id);
    disposeOwnedGeometry(model);
  }
});
