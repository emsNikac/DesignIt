import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createModel} from './models.js';
import {createThumbnailQueue} from './thumbnail-queue.js';

// Each preview owns its GPU buffers and textures, independently of the flat.
export function isolatePreviewResources(model){
  const geometries=new Map(),materials=new Map(),textures=new Map();
  const cloneMaterial=source=>{
    if(materials.has(source))return materials.get(source);
    const copy=source.clone();materials.set(source,copy);
    for(const [key,value] of Object.entries(copy))if(value?.isTexture){if(!textures.has(value)){const texture=value.clone();texture.needsUpdate=true;textures.set(value,texture);}copy[key]=textures.get(value);}
    return copy;
  };
  model.traverse(mesh=>{if(!mesh.isMesh)return;const original=mesh.geometry;if(!geometries.has(original))geometries.set(original,original.clone());mesh.geometry=geometries.get(original);mesh.material=Array.isArray(mesh.material)?mesh.material.map(cloneMaterial):cloneMaterial(mesh.material);});
  return()=>{for(const g of geometries.values())g.dispose();for(const m of materials.values())m.dispose();for(const t of textures.values())t.dispose();};
}
function createBackend(){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  try{
  renderer.setSize(240,190);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#fff7e8','#c4bead',1.6));const light=new THREE.DirectionalLight('#fff3dc',2.6);light.position.set(-3,6,5);light.castShadow=true;light.shadow.mapSize.set(512,512);scene.add(light);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.5;room.dispose();pmrem.dispose();
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.1}));plane.rotation.x=-Math.PI/2;plane.receiveShadow=true;plane.position.y=-.008;scene.add(plane);
  const camera=new THREE.PerspectiveCamera(32,240/190,.01,100);
  return {
    render(def){
      if(renderer.getContext().isContextLost())throw new Error('Preview context was interrupted.');
      // Browsing does not populate the merged-model cache for hundreds of items.
      const model=createModel(def,undefined,{},undefined,false),release=isolatePreviewResources(model);scene.add(model);
      try{const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),dim=Math.max(size.x,size.z,size.y*1.12);
        camera.position.copy(center).add(new THREE.Vector3(dim*1.4,dim*.85,dim*1.65));camera.lookAt(center);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');
      }finally{scene.remove(model);release();renderer.renderLists.dispose();}
    },
    dispose(){env.dispose();plane.geometry.dispose();plane.material.dispose();light.shadow.dispose();renderer.dispose();if(!renderer.getContext().isContextLost())renderer.forceContextLoss();},
  };
  }catch(error){renderer.dispose();if(!renderer.getContext().isContextLost())renderer.forceContextLoss();throw error;}
}
let service=null,owners=0;
const queue=()=>service??=createThumbnailQueue(createBackend);
export function requestThumbnail(def,callback){return queue().request(def,callback);}
export function acquireThumbnails(){owners++;return()=>{if(--owners===0){service?.dispose();service=null;}};}
