const wall=(id,name,model,width,height,depth,color='#ddd8c9',finish='Painted plaster')=>({id,name,model,category:'architecture',size:[width,height,depth],color,finish,architecture:true});
export const WALL_ITEMS=[
  wall('wall-short','Interior wall · 1 m','partition-wall',1,2.9,.15),
  wall('wall-standard','Interior wall · 2 m','partition-wall',2,2.9,.15),
  wall('wall-long','Interior wall · 3 m','partition-wall',3,2.9,.15),
  wall('wall-doorway','Interior wall with doorway','doorway-wall',2.4,2.9,.16),
  wall('wall-window','Interior wall with window','window-wall',2.4,2.9,.16),
  wall('wall-half','Half-height room divider','partition-wall',2,1.1,.15),
  wall('wall-glass','Framed glass partition','glass-wall',2,2.9,.09,'#626c60','Glass & graphite'),
  wall('wall-slats','Oak slatted room divider','slat-wall',1.5,2.9,.12,'#b49a76','Natural oak'),
];

export function itemDefinition(def,item){return def.architecture&&item.dimensions?{...def,size:item.dimensions}:def;}
export function validWallDimensions(dimensions){return Array.isArray(dimensions)&&dimensions.length===3&&dimensions.every((n,i)=>Number.isFinite(n)&&n>=[.5,.4,.06][i]&&n<=[8,3.1,.4][i]);}
export function fitWallDimensions(dimensions,item,layout){
  const [width,height,depth]=dimensions,c=Math.abs(Math.cos(item.rotation)),s=Math.abs(Math.sin(item.rotation)),scale=item.scale||1;
  const limitX=c>.0001?((layout.width-.2)/scale-depth*s)/c:Infinity;
  const limitZ=s>.0001?((layout.depth-.2)/scale-depth*c)/s:Infinity;
  return [Math.max(.5,Math.min(width,8,limitX,limitZ)),height,depth];
}

// Local boxes are shared by the visible panels, rigid-body colliders and walking.
export function wallSections(def){
  const [w,h,d]=def.size,section=(width,height,depth,x,y,z=0,part='body')=>({width,height,depth,x,y,z,part});
  if(def.model==='doorway-wall'){
    const opening=Math.min(.95,w*.55),top=Math.min(2.12,h*.8),side=(w-opening)/2;
    return [section(side,h,d,-(w+opening)/4,h/2),section(side,h,d,(w+opening)/4,h/2),section(opening,h-top,d,0,(h+top)/2)];
  }
  if(def.model==='window-wall'){
    const opening=w*.55,bottom=h*.35,top=h*.8,side=(w-opening)/2;
    return [section(side,h,d,-(w+opening)/4,h/2),section(side,h,d,(w+opening)/4,h/2),section(opening,bottom,d,0,bottom/2),section(opening,h-top,d,0,(h+top)/2),section(opening,top-bottom,.018,0,(top+bottom)/2,0,'glass')];
  }
  return [section(w,h,d,0,h/2)];
}

export function blocksWallWalk(def,item,point,margin=.17){
  const dx=point.x-item.x,dz=point.z-item.z,c=Math.cos(item.rotation),s=Math.sin(item.rotation),scale=item.scale;
  const x=(dx*c-dz*s)/scale,z=(dx*s+dz*c)/scale;
  return wallSections(itemDefinition(def,item)).some(b=>{
    const minY=item.y+(b.y-b.height/2)*scale,maxY=item.y+(b.y+b.height/2)*scale;
    return minY<1.8&&maxY>.2&&Math.abs(x-b.x)<b.width/2+margin/scale&&Math.abs(z-b.z)<b.depth/2+margin/scale;
  });
}
