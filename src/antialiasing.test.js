import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAntialiasing} from './antialiasing.js';

test('FXAA samples neighboring pixels at the actual render-target size',()=>{
  const pass=createAntialiasing('fxaa',()=>{});pass.setSize(1200,750);
  assert.equal(pass.uniforms.resolution.value.x,1/1200);assert.equal(pass.uniforms.resolution.value.y,1/750);pass.dispose();
});
test('SMAA redraws an idle scene when lookup images decode and releases them on removal',()=>{
  const previous=globalThis.Image,images=[];let redraws=0;
  globalThis.Image=class {constructor(){this.listeners=new Set();images.push(this);}addEventListener(_,fn){this.listeners.add(fn);}removeEventListener(_,fn){this.listeners.delete(fn);}};
  try{
    const pass=createAntialiasing('smaa',()=>redraws++);
    for(const image of images){image.onload();for(const fn of image.listeners)fn();}
    assert.equal(redraws,2);assert.ok(pass._areaTexture.version>0);
    let disposed=false;pass._edgesRT.addEventListener('dispose',()=>{disposed=true;});pass.dispose();
    assert.equal(disposed,true);assert.ok(images.every(image=>image.listeners.size===0));
  }finally{if(previous===undefined)delete globalThis.Image;else globalThis.Image=previous;}
});
