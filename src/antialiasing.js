import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';

// SMAA consumes linear color before OutputPass; FXAA consumes display color after it.
export function createAntialiasing(mode,invalidate){
  if(mode==='off')return null;
  const pass=mode==='smaa'?new SMAAPass():new ShaderPass(FXAAShader);
  if(mode==='fxaa')pass.setSize=(width,height)=>pass.uniforms.resolution.value.set(1/width,1/height);
  if(mode==='smaa'){
    // Built-in lookup images decode asynchronously. An idle scene must redraw
    // when each is ready, otherwise its first smoothed frame can stay incomplete.
    const images=[pass._areaTexture,pass._searchTexture].map(texture=>texture.image);
    for(const image of images)image.addEventListener('load',invalidate,{once:true});
    const dispose=pass.dispose.bind(pass);pass.dispose=()=>{for(const image of images)image.removeEventListener('load',invalidate);dispose();};
  }
  return pass;
}
