import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Box3,Vector3} from 'three';
import {CATALOG,CATEGORIES,makeItem} from './catalog.js';
import {createModel} from './models.js';
import {drawDesignerRug} from './designer-rugs.js';
import {disposeOwnedGeometry} from './mesh-optimizer.js';
import {createBody,createWorld} from './physics.js';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};

// Ignore palette, mesh ordering, position and uniform size. A recolor or a
// uniformly enlarged copy cannot increase this count. Rug motifs are explicit
// constructions, independently checked below for different drawing operations.
function visualSignature(def){
  const model=createModel(def);model.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3()),scale=Math.max(...size.toArray()),vertices=[],p=new Vector3();
  model.traverse(o=>{if(!o.isMesh)return;for(const attr of ['position','normal'])assert.ok(o.geometry.attributes[attr].array.every(Number.isFinite),`${def.id}: ${attr}`);const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).sub(center).divideScalar(scale);vertices.push(p.toArray().map(n=>Math.round(n*1000)).join(','));}});
  vertices.sort();const hash=createHash('sha256').update(vertices.join('|')+(def.design?.motif||'')).digest('hex');disposeOwnedGeometry(model);return hash;
}
test('every main category has at least fifty visibly different designs without counting recolors',()=>{
  for(const category of CATEGORIES.filter(c=>!['all','hobbies','architecture'].includes(c.id))){const unique=new Set(CATALOG.filter(d=>d.category===category.id).map(visualSignature));assert.ok(unique.size>=50,`${category.name}: ${unique.size} designs`);}
});
test('the dining-chair collection contains at least thirty different constructions',()=>{
  const chairs=CATALOG.filter(d=>d.kind==='dining-chair');assert.ok(chairs.length>=30);assert.equal(new Set(chairs.map(visualSignature)).size,chairs.length);
  for(const occasion of ['Family dinner','Wedding banquet','Cocktail gathering','Buffet service','Games night'])assert.ok(CATALOG.filter(d=>d.design?.event===occasion).length>=6,occasion);
});
test('all ten rug motifs produce different patterns rather than different colors',()=>{
  const fingerprints=new Set();
  for(const motif of ['medallion','kilim','chevron','arches','dots','greek','sunburst','botanical','patchwork','maze']){const calls=[],ctx=new Proxy({},{get:(_,key)=>(...args)=>calls.push([key,...args]),set:(_,key,value)=>{calls.push([key,value]);return true;}});assert.ok(drawDesignerRug(ctx,`designer-rug|${motif}|#cccccc`));fingerprints.add(JSON.stringify(calls));}
  assert.equal(fingerprints.size,10);
});
test('small objects rest on the rendered countertop of a fitted kitchen unit',()=>{
  const def=CATALOG.find(d=>d.id==='design-kitchen-farmhouse-sink'),model=createModel(def),item=makeItem(def.id);model.updateMatrixWorld(true);
  let topY=0;model.traverse(o=>{if(o.isMesh&&o.userData.surface?.id==='top')topY=Math.max(topY,new Box3().setFromObject(o).max.y);});
  const world=createWorld(10,8),counter=createBody(def,item,model.userData.collisionBoxes),vaseDef=CATALOG.find(d=>d.id==='vase'),vase=createBody(vaseDef,makeItem(vaseDef.id,-def.size[0]*.42,0,0,topY+1));
  world.addBody(counter);world.addBody(vase);for(let i=0;i<300;i++)world.step(1/60);assert.ok(Math.abs(vase.position.y-topY)<.025,`${vase.position.y} vs ${topY}`);
});
test('editing a rug motif color rebuilds its pattern without changing its silhouette',()=>{
  const def=CATALOG.find(d=>d.id==='design-rug-rectangle-medallion'),original=createModel(def),edited=createModel(def,def.color,{accent:{color:'#ad674b'}});
  const mats=model=>{const result=[];model.traverse(o=>{if(o.isMesh&&o.userData.surface?.id==='body')result.push(o.material);});return result;};
  assert.notEqual(mats(original)[0].map,mats(edited)[0].map);assert.ok(new Box3().setFromObject(original).equals(new Box3().setFromObject(edited)));
});
