export const FLOOR_TYPES=[
  {id:'oak',name:'Natural oak',color:'#b8966d',type:'wood'},
  {id:'walnut',name:'Smoked walnut',color:'#73523b',type:'wood'},
  {id:'ash',name:'Whitewashed ash',color:'#d2c4a9',type:'wood'},
  {id:'concrete',name:'Warm concrete',color:'#bab5a9',type:'stone'},
  {id:'terrazzo',name:'Cream terrazzo',color:'#d9d1be',type:'terrazzo'},
  {id:'tiles',name:'Limestone tile',color:'#c4bda8',type:'tile'},
  {id:'oak-herringbone',name:'Oak herringbone',color:'#b79569',type:'herringbone',roughness:.52},
  {id:'walnut-herringbone',name:'Walnut herringbone',color:'#866345',type:'herringbone',roughness:.5},
  {id:'parquet',name:'Basketweave parquet',color:'#b0946d',type:'parquet',roughness:.5},
  {id:'bamboo',name:'Honey bamboo',color:'#c8b17c',type:'bamboo',roughness:.5},
  {id:'cork',name:'Natural cork',color:'#b3986c',type:'cork',roughness:.9},
  {id:'slate',name:'Graphite slate',color:'#646d67',type:'slate',roughness:.85},
  {id:'marble-white',name:'Carrara marble',color:'#e2e0d5',type:'marble',roughness:.22},
  {id:'marble-dark',name:'Smoked marble',color:'#5e635d',type:'marble',roughness:.22},
  {id:'terracotta',name:'Terracotta tile',color:'#b98767',type:'tile',roughness:.8},
  {id:'cement-pattern',name:'Patterned cement tile',color:'#c6c3b2',type:'cement-pattern',roughness:.72},
  {id:'carpet-cream',name:'Cream wool carpet',color:'#cfc4ae',type:'carpet',roughness:1},
  {id:'carpet-sage',name:'Sage woven carpet',color:'#929e84',type:'carpet',roughness:1},
];

export function floorTextureType(floor){return floor.type==='wood'?'floor':floor.type;}
export function floorSurface(floor){return {roughness:floor.roughness??(floor.type==='wood'?.52:.68),bumpScale:floor.type==='carpet'?.025:.012};}

export function drawFloorPattern(ctx,type,random){
  const plank=(x,y,width,height)=>{
    ctx.fillStyle=random()>.5?`rgba(255,241,209,${.04+random()*.13})`:`rgba(46,29,10,${.04+random()*.12})`;ctx.fillRect(x,y,width,height);
    ctx.strokeStyle='rgba(65,43,23,.22)';ctx.lineWidth=.8;ctx.strokeRect(x+.4,y+.4,width-.8,height-.8);
    for(let i=0;i<6;i++){ctx.fillStyle='rgba(72,47,25,.06)';if(width>height)ctx.fillRect(x+2,y+random()*height,width-4,.5);else ctx.fillRect(x+random()*width,y+2,.5,height-4);}
  };
  if(type==='herringbone'){
    for(let i=-8;i<16;i++)for(let j=-40;j<40;j++){const x=i*80-j*16,y=i*48+j*16;plank(x,y,64,16);plank(x+64,y,16,64);}
  }else if(type==='parquet'){
    for(let x=0;x<4;x++)for(let y=0;y<4;y++)for(let i=0;i<4;i++)(x+y)%2?plank(x*128+i*32,y*128,32,128):plank(x*128,y*128+i*32,128,32);
  }else if(type==='bamboo'){
    for(let x=0;x<16;x++){plank(x*32,0,32,512);for(let y=0;y<4;y++){ctx.fillStyle='rgba(62,46,19,.12)';ctx.fillRect(x*32,y*128+(x%2)*64,32,2);}}
  }else if(type==='cork'){
    for(let i=0;i<12000;i++){ctx.fillStyle=random()>.5?'rgba(72,45,17,.1)':'rgba(248,226,176,.2)';ctx.fillRect(random()*512,random()*512,2+random()*7,2+random()*5);}
  }else if(type==='slate'){
    for(let x=0;x<4;x++)for(let y=0;y<4;y++){ctx.fillStyle=`rgba(225,235,220,${random()*.12})`;ctx.fillRect(x*128+1,y*128+1,126,126);ctx.strokeStyle='rgba(36,40,34,.35)';ctx.strokeRect(x*128,y*128,128,128);}
    for(let i=0;i<450;i++){const x=random()*512,y=random()*512;ctx.strokeStyle='rgba(221,229,217,.07)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*40,y+random()*8);ctx.stroke();}
  }else if(type==='cement-pattern'){
    for(let x=0;x<8;x++)for(let y=0;y<8;y++){const cx=x*64+32,cy=y*64+32;ctx.strokeStyle='#7e8a79';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy-24);ctx.lineTo(cx+24,cy);ctx.lineTo(cx,cy+24);ctx.lineTo(cx-24,cy);ctx.closePath();ctx.stroke();ctx.fillStyle='#9a9f8e';ctx.beginPath();ctx.arc(cx,cy,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(243,239,222,.65)';ctx.lineWidth=2;ctx.strokeRect(x*64,y*64,64,64);}
  }else if(type==='carpet'){
    for(let i=0;i<512;i++){ctx.fillStyle='rgba(245,239,219,.09)';ctx.fillRect(i,0,.7,512);ctx.fillStyle='rgba(42,40,27,.07)';ctx.fillRect(0,i,512,.7);}
  }else return false;
  return true;
}
