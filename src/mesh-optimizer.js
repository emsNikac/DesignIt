import {Mesh,Matrix4,Box3} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {LruCache} from './lru-cache.js';

const geometryCache=new LruCache(32*1024*1024);
export function sharedGeometry(key,build){
  if(!geometryCache.has(key)){const geometry=build();geometry.userData.shared=true;geometry.userData.cacheKey=key;const bytes=Object.values(geometry.attributes).reduce((n,a)=>n+a.array.byteLength,geometry.index?.array.byteLength||0);geometryCache.set(key,geometry,bytes);return geometry;}
  return geometryCache.get(key);
}

// Bake transforms and batch opaque surfaces within an object. Transparent meshes
// retain their original ordering. Triangle positions, UVs and materials survive.
export function batchModel(group){
  group.updateMatrixWorld(true);const inverse=new Matrix4().copy(group.matrixWorld).invert();
  const batches=new Map(),untouched=[];
  group.traverse(o=>{
    if(!o.isMesh)return;
    const matrix=new Matrix4().multiplyMatrices(inverse,o.matrixWorld);
    if(Array.isArray(o.material)||o.material.transparent){untouched.push({mesh:o,matrix});return;}
    const key=`${o.material.uuid}|${o.userData.surface?.id||''}|${o.castShadow}|${o.receiveShadow}`;
    if(!batches.has(key))batches.set(key,[]);batches.get(key).push({mesh:o,matrix});
  });
  const output=[];
  for(const entries of batches.values()){
    const first=entries[0].mesh;
    const key=entries.map(({mesh,matrix})=>`${mesh.geometry.uuid}:${matrix.elements.join(',')}`).join('|');
    const geometry=sharedGeometry(`batch:${key}`,()=>{
      const bounds=new Box3();
      for(const {mesh,matrix} of entries){if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(matrix));}
      const sources=entries.map(({mesh,matrix})=>{const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();return g.applyMatrix4(matrix);});
      const merged=mergeGeometries(sources,false);sources.forEach(g=>g.dispose());
      if(!merged)throw new Error('Unable to batch furniture geometry.');merged.boundingBox=bounds;return merged;
    });
    const merged=new Mesh(geometry,first.material);merged.castShadow=first.castShadow;merged.receiveShadow=first.receiveShadow;
    merged.userData={...first.userData};output.push(merged);
  }
  for(const {mesh,matrix} of untouched){const copy=new Mesh(mesh.geometry,mesh.material);copy.applyMatrix4(matrix);copy.castShadow=mesh.castShadow;copy.receiveShadow=mesh.receiveShadow;copy.userData={...mesh.userData};output.push(copy);}
  group.clear();group.add(...output);return group;
}

export function disposeOwnedGeometry(group){const disposed=new Set();group.traverse(o=>{if(o.geometry&&(!o.geometry.userData.shared||geometryCache.peek(o.geometry.userData.cacheKey)!==o.geometry))o.geometry.dispose();if(o.userData.ownedMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(disposed.has(m))continue;disposed.add(m);if(!m.userData.sharedTextures)m.map?.dispose();m.dispose();}});}
