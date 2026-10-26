import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,Texture} from 'three';
import {createThumbnailQueue} from './thumbnail-queue.js';
import {isolatePreviewResources} from './thumbnails.js';
import {LruCache} from './lru-cache.js';

test('scrolling through separate preview batches creates one reusable renderer',()=>{
  const tasks=[],rendered=[];let created=0,disposed=0;
  const queue=createThumbnailQueue(()=>{created++;return {render:def=>{rendered.push(def.id);return `image-${def.id}`;},dispose:()=>disposed++};},fn=>tasks.push(fn));
  for(let i=0;i<100;i++){queue.request({id:String(i)},()=>{});while(tasks.length)tasks.shift()();}
  assert.equal(created,1);assert.equal(rendered.length,100);assert.equal(disposed,0);queue.dispose();assert.equal(disposed,1);
});
test('offscreen requests are canceled and preview errors cannot break the remaining queue',()=>{
  const tasks=[],rendered=[];const original=console.warn;console.warn=()=>{};
  try{const q=createThumbnailQueue(()=>({render:def=>{if(def.id==='bad')throw Error('GPU interrupted');rendered.push(def.id);return 'image';},dispose:()=>{}}),fn=>tasks.push(fn));q.request({id:'skip'},()=>{})();q.request({id:'bad'},()=>{});q.request({id:'good'},()=>{});while(tasks.length)tasks.shift()();assert.deepEqual(rendered,['good']);q.dispose();}finally{console.warn=original;}
});
test('preview disposal leaves the flat geometry, textures and materials intact',()=>{
  const geometry=new BoxGeometry(),texture=new Texture(),material=new MeshStandardMaterial({map:texture,bumpMap:texture}),group=new Group();group.add(new Mesh(geometry,material));let sourceDisposed=0,previewDisposed=0;
  for(const resource of [geometry,texture,material])resource.addEventListener('dispose',()=>sourceDisposed++);
  const release=isolatePreviewResources(group),mesh=group.children[0];assert.notEqual(mesh.geometry,geometry);assert.notEqual(mesh.material,material);assert.notEqual(mesh.material.map,texture);assert.equal(mesh.material.map,mesh.material.bumpMap);
  for(const resource of [mesh.geometry,mesh.material,mesh.material.map])resource.addEventListener('dispose',()=>previewDisposed++);
  release();assert.equal(previewDisposed,3);assert.equal(sourceDisposed,0);
});
test('weighted resource caches stay bounded and keep recently used entries',()=>{
  const cache=new LruCache(10);cache.set('a',{},4);cache.set('b',{},4);cache.get('a');cache.set('c',{},4);assert.ok(cache.has('a'));assert.equal(cache.has('b'),false);assert.equal(cache.weight,8);cache.set('large',{},20);assert.equal(cache.weight,0);
});
