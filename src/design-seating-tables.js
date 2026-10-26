export function buildSeatingTables(g,def,h){
  const {box,cyl,ball,tube,torus,arc,panel,part}=h,{design:D}=def,[w,H,d]=def.size;
  const wood=part('frame',h.color,'wood'),metal=part('hardware','#646b61','metal'),fabric=part('body',h.color,'cloth'),accent=part('accent','#d6c8ab','cloth');
  if(def.model==='design-chair'){
    const seat=.46,half=w*.39,z=d*.34,base=D.base;
    if(['pedestal','swivel'].includes(base)){cyl(g,.035,.045,.4,0,.22,0,metal);if(base==='pedestal')cyl(g,.22,.25,.035,0,.02,0,metal);else for(let i=0;i<5;i++){const a=i*Math.PI*2/5;tube(g,[0,.08,0],[Math.sin(a)*.26,.025,Math.cos(a)*.26],.018,metal);}}
    else if(['sled','cantilever','bent'].includes(base))for(const x of [-half,half])arc(g,base==='cantilever'?[[x,.43,-z],[x,.43,z],[x,.04,z],[x,.025,-z]]:[[x,.43,-z],[x,.03,-z],[x,.025,z],[x,.43,z]],.018,base==='bent'?wood:metal);
    else for(const x of [-half,half])for(const zz of [-z,z]){
      const offset=base==='splayed'?1.3:base==='eiffel'?1.25:1;
      tube(g,[x*offset,.02,zz*offset],[x,.44,zz],base==='hairpin'?.009:.022,base==='hairpin'||base==='eiffel'?metal:wood);
      if(base==='hairpin')tube(g,[x*offset+.035,.02,zz*offset],[x-.02,.44,zz+.02],.008,metal);
      if(base==='turned')for(const y of [.08,.19,.34])ball(g,x,y,zz,.029,.025,.029,wood);
      if(base==='eiffel')tube(g,[x*offset,.03,zz*offset],[-x,.36,-zz],.006,metal);
    }
    const cushion=D.seat!=='wood';panel(g,D.seat==='round'?'oval':'rectangle',w*.92,d*.85,.045,seat,cushion?fabric:wood);
    if(cushion)box(g,w*.77,.07,d*.67,0,seat+.025,.015,fabric,.045);
    const backY=seat+.09,top=H-.045,bz=-d*.36,a=w*.4,style=D.back;
    if(!['shell','scoop','tub','barrel','wing'].includes(style))for(const x of [-a,a])tube(g,[x,seat-.03,bz],[x,top-.04,bz-.025],.018,wood);
    if(['spindle','fan','sunburst','shaker','ladder','channel','panel','paddle','split','floating'].includes(style)){
      arc(g,[[-a,top-.04,bz],[0,top+.015,bz-.025],[a,top-.04,bz]],.022,wood);
      if(['ladder','shaker'].includes(style))for(let i=0;i<(style==='ladder'?4:3);i++)box(g,w*.75,.035,.03,0,backY+.05+i*(top-backY-.06)/3,bz,wood,.008);
      else if(style==='panel'||style==='paddle')box(g,style==='paddle'?w*.27:w*.7,top-backY-.03,.045,0,(top+backY)/2,bz,wood,.035);
      else if(style==='split'||style==='floating')for(const x of style==='split'?[-a*.48,a*.48]:[0])box(g,style==='split'?w*.32:w*.75,.16,.065,x,top-.075,bz,fabric,.035);
      else for(let i=-3;i<=3;i++){const x=i*w*.105;tube(g,[style==='fan'||style==='sunburst'?x*.2:x,backY,bz],[x,top-.025,bz-.02],style==='channel'?.023:.009,style==='channel'?fabric:wood);}
    }else if(['oval','hoop','double-oval','heart','shield','diamond','geometric','keyhole'].includes(style)){
      const cy=(top+backY)/2,ry=(top-backY)/2,points=[];
      for(let i=0;i<33;i++){const angle=i/32*Math.PI*2;let x=Math.sin(angle)*a,yy=Math.cos(angle)*ry;if(style==='diamond'||style==='geometric'){const t=i/8,quadrant=Math.floor(t)%4,f=t%1;x=[0,a,0,-a,0][quadrant]*(1-f)+[a,0,-a,0,a][quadrant]*f;yy=[ry,0,-ry,0,ry][quadrant]*(1-f)+[0,-ry,0,ry,0][quadrant]*f;}if(style==='heart')yy=ry*(.7*Math.cos(angle)-.3*Math.cos(angle*2));if(style==='shield')x*=.7+.3*Math.cos(angle);points.push([x,cy+yy,bz]);}
      arc(g,points,.022,wood,true);
      if(style==='double-oval')for(const x of [-a*.4,a*.4]){const ring=torus(g,a*.46,.014,x,cy,bz,wood);ring.scale.y=ry/(a*.46);}
      if(style==='keyhole')box(g,w*.72,.07,.04,0,cy-.03,bz,wood,.012);
    }else if(['cross','wishbone','bow','crescent','loop','ribbon'].includes(style)){
      arc(g,[[-a,top-.08,bz],[0,top+.025,bz-.07],[a,top-.08,bz]],.025,wood);
      if(style==='wishbone'){tube(g,[0,backY,bz],[-a*.7,top-.06,bz],.012,wood);tube(g,[0,backY,bz],[a*.7,top-.06,bz],.012,wood);}
      else if(style==='cross'){tube(g,[-a,backY,bz],[a,top-.04,bz],.012,wood);tube(g,[a,backY,bz],[-a,top-.04,bz],.012,wood);}
      else arc(g,[[-a,backY,bz],[style==='ribbon'?a:0,(top+backY)/2,bz+.035],[a,style==='crescent'?backY+.06:top-.05,bz]],.025,wood);
    }else if(['cane','woven','lattice','fret','rope'].includes(style)){
      box(g,w*.8,.035,.04,0,top,bz,wood,.008);box(g,w*.8,.03,.04,0,backY,bz,wood,.008);
      const count=style==='fret'?4:style==='rope'?12:8;
      for(let i=0;i<count;i++){const x=-a+i*2*a/(count-1);tube(g,[x,backY,bz],[style==='lattice'?-x:x,top,bz],.005,accent);if(style!=='rope')tube(g,[-a,backY+i*(top-backY)/(count-1),bz+.005],[a,backY+i*(top-backY)/(count-1),bz+.005],.005,accent);}
    }else{
      const wrap=['tub','barrel','wing'].includes(style);
      for(let i=0;i<(wrap?9:7);i++){const angle=(i/(wrap?8:6)-.5)*(wrap?2.5:1.5),x=Math.sin(angle)*a,y=style==='scallop'?top-Math.abs(i-3)*.025:top;box(g,w*.17,y-backY,.09,x,(y+backY)/2,bz+(1-Math.cos(angle))*.18,fabric,.045,-angle*.35);}
      if(style==='shell'||style==='scoop')box(g,w*.65,.08,.16,0,backY,bz+.03,fabric,.05);
    }
    if(D.arms)for(const x of [-w*.48,w*.48]){tube(g,[x,.46,.12],[x,.67,.12],.018,wood);arc(g,[[x,.67,.16],[x,.68,0],[x,.7,bz]],.025,wood);}
    return true;
  }
  if(def.model!=='design-table')return false;
  const top=part('top',h.color,D.top),frame=D.base==='sled'?metal:wood,baseH=H-.07;
  panel(g,D.shape,w,d,.055,H,top);
  if(D.base==='pedestal'){cyl(g,.09,.16,baseH,0,baseH/2,0,frame);cyl(g,Math.min(w,d)*.3,Math.min(w,d)*.34,.035,0,.02,0,frame);}
  else if(D.base==='trestle')for(const x of [-w*.29,w*.29]){tube(g,[x,0,-d*.38],[x,baseH,0],.04,frame);tube(g,[x,0,d*.38],[x,baseH,0],.04,frame);box(g,.08,.06,d*.85,x,.05,0,frame);tube(g,[-w*.3,.25,0],[w*.3,.25,0],.03,frame);}
  else if(D.base==='cross'){tube(g,[-w*.32,0,-d*.32],[w*.32,baseH,d*.32],.035,frame);tube(g,[w*.32,0,-d*.32],[-w*.32,baseH,d*.32],.035,frame);tube(g,[-w*.32,0,d*.32],[w*.32,baseH,-d*.32],.035,frame);tube(g,[w*.32,0,d*.32],[-w*.32,baseH,-d*.32],.035,frame);}
  else for(const x of [-w*.35,w*.35]){
    if(D.base==='sled')arc(g,[[x,baseH,-d*.35],[x,.03,-d*.35],[x,.03,d*.35],[x,baseH,d*.35]],.025,frame);
    else for(const z of [-d*.35,d*.35]){tube(g,[x*1.05,.01,z*1.05],[x,baseH,z],.03,frame);box(g,.06,.12,.06,x,baseH-.06,z,frame,.008);}
  }
  return true;
}
