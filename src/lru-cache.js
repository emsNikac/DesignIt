export class LruCache{
  constructor(limit){this.limit=limit;this.entries=new Map();this.weight=0;}
  has(key){return this.entries.has(key);}
  peek(key){return this.entries.get(key)?.value;}
  get(key){const entry=this.entries.get(key);if(!entry)return;this.entries.delete(key);this.entries.set(key,entry);return entry.value;}
  set(key,value,weight=1){const old=this.entries.get(key);if(old){this.weight-=old.weight;this.entries.delete(key);}this.entries.set(key,{value,weight});this.weight+=weight;while(this.weight>this.limit&&this.entries.size){const [id,entry]=this.entries.entries().next().value;this.entries.delete(id);this.weight-=entry.weight;}return value;}
  clear(){this.entries.clear();this.weight=0;}
}
