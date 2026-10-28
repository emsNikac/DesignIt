import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDemo,createBlankDesign,personalCopy,readLibrary,loadWorkspace,saveWorkspace,deleteSavedDesign,LIBRARY_KEY} from './designs.js';
import {LAYOUTS,DEFAULT_DESIGN,makeItem,validateDesign} from './catalog.js';

const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('every flat starts completely empty in a new design',()=>{
  for(const l of LAYOUTS){const d=createBlankDesign(l.id,'My new flat');assert.deepEqual(d.items,[]);assert.equal(d.kind,'design');assert.equal(d.name,'My new flat');assert.equal(validateDesign(d).layoutId,l.id);}
});
test('several designs for the same layout remain independent',()=>{
  const s=storage(),a=createBlankDesign('loft','One'),b=createBlankDesign('loft','Two');a.items.push(makeItem('bed'));saveWorkspace(s,a);saveWorkspace(s,b);
  assert.notEqual(a.designId,b.designId);assert.equal(readLibrary(s).designs.length,2);assert.equal(loadWorkspace(s).name,'Two');assert.equal(readLibrary(s).designs.find(d=>d.name==='One').items.length,1);
});
test('editing a demo preserves the original furnished home',()=>{
  const s=storage(),demo=createDemo('loft'),originalCount=demo.items.length,copy=personalCopy({...demo,items:[]});saveWorkspace(s,copy);saveWorkspace(s,createDemo('loft'));
  assert.equal(loadWorkspace(s).kind,'demo');assert.equal(loadWorkspace(s).items.length,originalCount);assert.equal(readLibrary(s).designs.length,1);assert.equal(readLibrary(s).designs[0].items.length,0);
});
test('legacy saves migrate without replacing furnished demos',()=>{
  const s=storage(),old=DEFAULT_DESIGN();old.items=[];old.name='Existing work';s.setItem('forma-design-v1',JSON.stringify(old));
  const current=loadWorkspace(s);assert.equal(current.name,'Existing work');assert.equal(current.kind,'design');saveWorkspace(s,current);assert.equal(loadWorkspace(s).items.length,0);assert.ok(createDemo('loft').items.length>0);
});
test('a damaged save does not hide other designs',()=>{
  const s=storage(),good=createBlankDesign('studio','Safe design');s.setItem(LIBRARY_KEY,JSON.stringify({version:2,activeId:good.designId,designs:[{broken:true},good]}));assert.equal(readLibrary(s).designs.length,1);assert.equal(loadWorkspace(s).name,'Safe design');
});
test('all furnished demos remain valid and include their editable artwork',()=>{
  for(const l of LAYOUTS){const d=createDemo(l.id);validateDesign(d);assert.ok(d.items.some(i=>i.catalogId==='art'));assert.ok(d.items.length>=10);}
});
test('deleting an inactive design preserves the active home; deleting the active one opens the remaining home',()=>{
  const s=storage(),a=createBlankDesign('loft','One'),b=createBlankDesign('studio','Two'),c=createBlankDesign('apartment','Three');saveWorkspace(s,a);saveWorkspace(s,b);saveWorkspace(s,c);
  deleteSavedDesign(s,a.designId);assert.equal(loadWorkspace(s).designId,c.designId);assert.equal(readLibrary(s).designs.length,2);
  deleteSavedDesign(s,c.designId);assert.equal(loadWorkspace(s).designId,b.designId);saveWorkspace(s,loadWorkspace(s));assert.deepEqual(readLibrary(s).designs.map(d=>d.designId),[b.designId]);
  deleteSavedDesign(s,b.designId);assert.equal(loadWorkspace(s).kind,'demo');assert.equal(readLibrary(s).designs.length,0);assert.throws(()=>deleteSavedDesign(s,'demo-loft'));assert.throws(()=>deleteSavedDesign(s,b.designId));
});
