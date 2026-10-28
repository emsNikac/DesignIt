import {MathUtils,Vector3} from 'three';

// Keep the framing inside the largest usable rectangle beside an inspector.
export function focusViewport(canvas,inspector,top=145,bottom=85){
  const area={left:canvas.left+18,top:canvas.top+Math.min(top,canvas.height*.4),width:canvas.width-36,height:canvas.height-Math.min(top,canvas.height*.4)-Math.min(bottom,canvas.height*.2)};
  if(!inspector||inspector.bottom<=area.top||inspector.top>=area.top+area.height||inspector.right<=area.left||inspector.left>=area.left+area.width)return area;
  const candidates=[
    {...area,left:Math.max(area.left,inspector.right+20),width:area.left+area.width-Math.max(area.left,inspector.right+20)},
    {...area,width:Math.min(area.left+area.width,inspector.left-20)-area.left},
    {...area,height:Math.min(area.top+area.height,inspector.top-20)-area.top},
  ].filter(a=>a.width>70&&a.height>60);
  return candidates.sort((a,b)=>b.width*b.height-a.width*a.height)[0]||area;
}

export function frameBounds(camera,bounds,canvas,area,minDistance=3){
  const center=bounds.getCenter(new Vector3()),right=new Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new Vector3(0,1,0).applyQuaternion(camera.quaternion),back=new Vector3(0,0,1).applyQuaternion(camera.quaternion);
  const tan=Math.tan(MathUtils.degToRad(camera.fov/2)),tx=tan*camera.aspect*area.width/canvas.width,ty=tan*area.height/canvas.height;
  let distance=minDistance;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const p=new Vector3(x,y,z).sub(center),depth=p.dot(back);
    distance=Math.max(distance,Math.abs(p.dot(right))*1.18/tx+depth,Math.abs(p.dot(up))*1.18/ty+depth);
  }
  const nx=((area.left+area.width/2-canvas.left)/canvas.width)*2-1,ny=1-((area.top+area.height/2-canvas.top)/canvas.height)*2;
  const target=center.clone().addScaledVector(right,-nx*distance*tan*camera.aspect).addScaledVector(up,-ny*distance*tan);
  return {target,position:target.clone().addScaledVector(back,distance)};
}
