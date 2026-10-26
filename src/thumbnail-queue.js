import {LruCache} from './lru-cache.js';
export function createThumbnailQueue(createBackend,schedule=fn=>setTimeout(fn,20)){
  const cache=new LruCache(128),requests=new Map();let backend=null,running=false,disposed=false;
  const next=()=>{
    if(disposed){running=false;return;}
    const entry=requests.entries().next().value;if(!entry){running=false;return;}
    const [id,request]=entry;requests.delete(id);
    if(request.listeners.size){try{backend??=createBackend();const url=backend.render(request.def);if(url){cache.set(id,url);for(const fn of request.listeners)fn(url);}}catch(error){console.warn('A catalog preview could not render.',error);backend?.dispose();backend=null;}}
    schedule(next);
  };
  return {
    request(def,callback){
      if(disposed)return()=>{};const cached=cache.get(def.id);if(cached){callback(cached);return()=>{};}
      if(!requests.has(def.id))requests.set(def.id,{def,listeners:new Set()});const request=requests.get(def.id);request.listeners.add(callback);
      if(!running){running=true;schedule(next);}return()=>{request.listeners.delete(callback);if(!request.listeners.size&&requests.get(def.id)===request)requests.delete(def.id);};
    },
    dispose(){disposed=true;requests.clear();cache.clear();backend?.dispose();backend=null;},
  };
}
