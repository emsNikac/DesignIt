import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {CATALOG,makeItem,DEFAULT_DESIGN,validateDesign} from './catalog.js';
import {createModel} from './models.js';
import {HOBBIES,HOBBY_ITEMS} from './hobbies.js';
import {DEFAULT_GRAPHICS,GRAPHICS_PRESETS,normalizeGraphics,loadGraphics} from './graphics.js';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
const def=id=>CATALOG.find(d=>d.id===id);
const triangles=model=>{let sum=0;model.traverse(o=>{if(o.isMesh)sum+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});return sum;};
const meshes=model=>{let sum=0;model.traverse(o=>{if(o.isMesh)sum++;});return sum;};
const partMaterials=(model,id)=>{const result=[];model.traverse(o=>{if(o.isMesh&&o.userData.surface?.id===id)result.push(o.material);});return result;};

test('countertop customization leaves cabinetry and geometry unchanged',()=>{
  const original=createModel(def('kitchen')),changed=createModel(def('kitchen'),undefined,{top:{color:'#112233',finish:'wood'}});
  assert.ok(partMaterials(changed,'top').every(m=>m===partMaterials(changed,'top')[0]));
  assert.equal(partMaterials(original,'body')[0],partMaterials(changed,'body')[0]);
  assert.notEqual(partMaterials(original,'top')[0],partMaterials(changed,'top')[0]);
  assert.equal(triangles(original),triangles(changed));
  assert.ok(changed.userData.appearanceParts.some(p=>p.id==='top'&&p.label==='Countertop'));
});
test('body finishes leave separately editable tabletops and frames untouched',()=>{
  for(const id of ['table-oak','sectional-linen','island']){
    const definition=def(id);if(!definition)throw new Error(`Missing test fixture ${id}`);
    const original=createModel(definition),changed=createModel(definition,definition.color,{body:{color:'#112233',finish:'leather'}});
    for(const part of original.userData.appearanceParts.filter(p=>p.id!=='body'))assert.equal(partMaterials(original,part.id)[0],partMaterials(changed,part.id)[0],`${id}: ${part.id}`);
  }
});
test('custom parts survive JSON export/import and invalid overrides are rejected',()=>{
  const d=DEFAULT_DESIGN();d.items.push(makeItem('kitchen',0,0,0,0,{appearance:{top:{color:'#345678',finish:'terrazzo'}}}));
  assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(d))).items.at(-1).appearance,{top:{color:'#345678',finish:'terrazzo'}});
  d.items.at(-1).appearance.top.finish='unknown';assert.throws(()=>validateDesign(d));
});
test('batching preserves triangle count and bounds for every model',()=>{
  let before=0,after=0;
  for(const definition of CATALOG){const original=createModel(definition,undefined,{},undefined,false),optimized=createModel(definition);
    assert.equal(triangles(optimized),triangles(original),definition.id);
    const a=new Box3().setFromObject(original),b=new Box3().setFromObject(optimized);
    assert.ok(a.min.distanceTo(b.min)<.00002&&a.max.distanceTo(b.max)<.00002,definition.id);
    before+=meshes(original);after+=meshes(optimized);
  }
  assert.ok(after<before*.5,`${before} -> ${after}`);
});
test('all twenty hobby themes have three unique modeled items',()=>{
  assert.equal(HOBBIES.length,20);assert.equal(HOBBY_ITEMS.length,60);
  for(const [id] of HOBBIES)assert.equal(HOBBY_ITEMS.filter(i=>i.hobby===id).length,3,id);
  assert.ok(HOBBY_ITEMS.some(i=>i.model==='bicycle'));assert.ok(HOBBY_ITEMS.some(i=>i.model==='treadmill'));
});
test('every item exposes editable surfaces and most have independent parts',()=>{
  let multipart=0;
  for(const definition of CATALOG){const parts=createModel(definition).userData.appearanceParts;
    assert.ok(parts.length>0,definition.id);assert.equal(new Set(parts.map(p=>p.id)).size,parts.length,definition.id);
    if(parts.length>1)multipart++;
  }
  assert.ok(multipart>180);
});
test('appearance changes reuse geometry including lathed and extruded pieces',()=>{
  for(const id of ['kitchen','vase','bowl','bath']){
    const original=createModel(def(id)),changed=createModel(def(id),'#123456'),geometries=[];
    original.traverse(o=>{if(o.isMesh)geometries.push(o.geometry);});
    changed.traverse(o=>{if(o.isMesh)assert.ok(geometries.includes(o.geometry),id);});
  }
});
test('rug pattern selection changes the model and survives design validation',()=>{
  const rug=def('rug-jute'),plain=createModel(rug,undefined,{},'plain'),checker=createModel(rug,undefined,{},'checker');
  assert.ok(triangles(checker)>triangles(plain));
  const d=DEFAULT_DESIGN();d.items=[makeItem(rug.id,0,0,0,0,{pattern:'checker',appearance:{accent:{color:'#123456'}}})];
  assert.equal(validateDesign(JSON.parse(JSON.stringify(d))).items[0].pattern,'checker');
});
test('original graphics preserve the previous quality and lower presets reduce work',()=>{
  assert.deepEqual([DEFAULT_GRAPHICS.pixelRatio,DEFAULT_GRAPHICS.shadows,DEFAULT_GRAPHICS.aoSamples],[1.75,2048,12]);
  assert.equal(DEFAULT_GRAPHICS.ao,true);
  for(const id of ['balanced','performance','battery'])assert.ok(GRAPHICS_PRESETS[id].pixelRatio<DEFAULT_GRAPHICS.pixelRatio);
  assert.equal(GRAPHICS_PRESETS.battery.shadows,0);assert.equal(GRAPHICS_PRESETS.battery.ao,false);
});
test('graphics preferences round-trip and corrupt settings use safe defaults',()=>{
  const storage={getItem:()=>JSON.stringify({...GRAPHICS_PRESETS.performance,preset:'performance'})};
  assert.equal(loadGraphics(storage).fps,30);assert.equal(loadGraphics(storage).ao,false);
  assert.equal(normalizeGraphics({pixelRatio:1000,shadows:-1}).pixelRatio,1.75);
  assert.equal(loadGraphics({getItem:()=>'{broken'}).preset,'original');
});
test('anti-aliasing settings persist and older saved presets receive suitable defaults',()=>{
  for(const antialias of ['off','fxaa','smaa'])assert.equal(loadGraphics({getItem:()=>JSON.stringify({...DEFAULT_GRAPHICS,antialias})}).antialias,antialias);
  assert.equal(normalizeGraphics({preset:'battery'}).antialias,'off');
  assert.equal(normalizeGraphics({preset:'original'}).antialias,'smaa');
  assert.equal(normalizeGraphics({antialias:'unsupported'}).antialias,'smaa');
});
