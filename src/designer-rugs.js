export function drawDesignerRug(ctx,type){
  if(!type.startsWith('designer-rug|'))return false;
  const [,motif,accent]=type.split('|');ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=10;
  const line=points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  if(motif==='medallion'){
    for(const r of [205,155,110,65])line([[256,256-r],[256+r*.75,256],[256,256+r],[256-r*.75,256],[256,256-r]]);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.arc(256+Math.sin(a)*195,256+Math.cos(a)*195,12,0,Math.PI*2);ctx.fill();}
  }else if(motif==='kilim'){
    for(let row=0;row<7;row++)for(let col=0;col<5;col++){const x=col*110+(row%2)*55-30,y=row*82;line([[x-30,y],[x-30,y-13],[x-15,y-13],[x-15,y-27],[x,y-27],[x,y-40],[x+15,y-27],[x+30,y-27],[x+30,y-13],[x+45,y-13],[x+45,y]]);}
  }else if(motif==='chevron'){
    ctx.lineWidth=12;for(let y=-80;y<600;y+=65){const p=[];for(let x=-64;x<600;x+=64)p.push([x,y+(Math.round(x/64)%2)*45]);line(p);}
  }else if(motif==='arches'){
    for(let y=-100;y<600;y+=100)for(let x=-60;x<600;x+=120)for(const r of [22,35,48]){ctx.beginPath();ctx.arc(x+(Math.round(y/100)%2)*60,y,r,Math.PI,Math.PI*2);ctx.stroke();}
  }else if(motif==='dots'){
    for(let y=30;y<512;y+=56)for(let x=30;x<512;x+=56){ctx.beginPath();ctx.ellipse(x+(y%3)*3,y,8+(x%3)*2,7,((x+y)%4)*.5,0,Math.PI*2);ctx.fill();}
  }else if(motif==='greek'){
    for(let i=0;i<8;i++){const p=i*64;line([[p,35],[p+48,35],[p+48,70],[p+16,70],[p+16,52],[p+32,52]]);line([[p,477],[p+48,477],[p+48,442],[p+16,442],[p+16,460],[p+32,460]]);line([[35,p],[35,p+48],[70,p+48],[70,p+16],[52,p+16],[52,p+32]]);line([[477,p],[477,p+48],[442,p+48],[442,p+16],[460,p+16],[460,p+32]]);}ctx.lineWidth=2;ctx.strokeRect(100,100,312,312);
  }else if(motif==='sunburst'){
    for(let i=0;i<32;i++){const a=i*Math.PI/16;line([[256+Math.sin(a)*55,256+Math.cos(a)*55],[256+Math.sin(a)*340,256+Math.cos(a)*340]]);}ctx.beginPath();ctx.arc(256,256,38,0,Math.PI*2);ctx.fill();
  }else if(motif==='botanical'){
    for(let j=0;j<4;j++){const x=60+j*125;line([[x,512],[x+25,0]]);for(let i=0;i<9;i++){const y=i*60+15;ctx.beginPath();ctx.ellipse(x+(i%2?23:-12),y,12,25,i%2?.7:-.7,0,Math.PI*2);ctx.fill();}}
  }else if(motif==='patchwork'){
    for(let y=0;y<6;y++)for(let x=0;x<6;x++){if((x+y)%3===0)ctx.fillRect(x*86+4,y*86+4,78,78);else if((x+y)%3===1)line([[x*86+4,y*86+78],[x*86+78,y*86+4]]);else{ctx.beginPath();ctx.arc(x*86+43,y*86+43,28,0,Math.PI*2);ctx.stroke();}}
  }else if(motif==='maze'){
    ctx.lineWidth=9;for(let y=0;y<8;y++)for(let x=0;x<8;x++){const xx=x*64,yy=y*64;line((x+y)%2?[[xx+16,yy+16],[xx+48,yy+16],[xx+48,yy+64]]:[[xx,yy+48],[xx+16,yy+48],[xx+16,yy+16]]);}
  }
  ctx.strokeStyle=accent;ctx.lineWidth=6;ctx.strokeRect(12,12,488,488);
  for(let i=0;i<512;i+=3){ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(i,0,1,512);ctx.fillStyle='rgba(34,28,17,.035)';ctx.fillRect(0,i,512,1);}
  return true;
}
export function buildDesignerRug(g,def,h){
  if(def.model!=='design-rug')return false;
  const [w,,d]=def.size,{shape,motif}=def.design,accentColor=h.appearance?.accent?.color||'#ded2b8';
  const body=h.part('body',h.color,`designer-rug|${motif}|${accentColor}`),accent=h.part('accent',accentColor,'cloth');
  h.panel(g,shape==='runner'?'rectangle':shape,w,d,.02,.024,body);
  const points=h.outline(shape==='runner'?'rectangle':shape,w*.98,d*.98).getSpacedPoints(80).map(p=>[p.x,.026,p.y]);h.arc(g,points,.004,accent,true);
  if(['rectangle','runner'].includes(shape))for(const side of [-1,1])for(let i=0;i<40;i++)h.box(g,.008,.008,.07,-w*.48+i*w*.96/39,.01,side*(d/2+.025),accent,0);
  return true;
}
