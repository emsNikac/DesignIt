export function buildStorageLighting(g,def,h){
  const {box,cyl,ball,tube,torus,arc,part}=h,D=def.design,[w,H,d]=def.size;
  const wood=part('frame',h.color,'wood'),body=part('body',h.color,'wood'),metal=part('hardware','#ae9a76','metal'),paper=part('accent','#e1d6be','cloth'),glass=part('glass','#b2c4b8','glass');
  if(def.model==='design-storage'){
    const levels=D.form==='low'?2:D.form==='wall'?2:4,bottom=D.form==='wall'?0:.13;
    const front=(x,y,width,height,z)=>{
      if(D.front==='open')return;
      if(D.front==='drawers'){const count=Math.max(2,Math.round(width/.28));for(let i=0;i<count;i++){const xx=x-width/2+(i+.5)*width/count;box(g,width/count-.012,height-.012,.025,xx,y,z,body,.005);box(g,width/count*.4,.012,.025,xx,y+.02,z+.02,metal,.004);}}
      if(D.front==='ribbed'){box(g,width,height,.02,x,y,z,body,.006);for(let i=0;i<Math.max(4,width/.035);i++)box(g,.009,height-.012,.014,x-width/2+.02+i*.035,y,z+.018,wood,.003);}
      if(D.front==='glass'){box(g,width-.015,height-.015,.012,x,y,z,glass,0);for(const xx of [x-width/2,x+width/2])box(g,.017,height,.025,xx,y,z,wood,.003);box(g,.015,.08,.025,x+width*.3,y,z+.02,metal,.003);}
      if(D.front==='shoji'){box(g,width,height,.014,x,y,z,paper,.001);for(let i=0;i<5;i++)box(g,.014,height,.02,x-width/2+i*width/4,y,z+.012,wood,.002);for(let i=0;i<3;i++)box(g,width,.014,.02,x,y-height/2+i*height/2,z+.012,wood,.002);}
    };
    if(D.form==='stepped'){
      for(let i=0;i<4;i++){const height=H*(i+1)/4,x=-w/2+(i+.5)*w/4;for(const xx of [x-w/8,x+w/8])box(g,.035,height,d,xx,height/2,0,wood,.005);for(let y=0;y<=i+1;y++)box(g,w/4,.035,d,x,y*height/(i+1),0,wood,.005);front(x,height/2,w/4-.025,height-.04,d/2);}
    }else if(D.form==='corner'){
      for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2]])box(g,.045,H,.045,x,H/2,z,wood,.006);
      for(let i=0;i<=levels;i++){const y=.03+i*(H-.06)/levels;box(g,w,.035,d*.48,0,y,-d*.26,wood,.005);box(g,w*.48,.035,d,-w*.26,y,0,wood,.005);}
      for(let i=0;i<levels;i++){front(0,(i+.5)*H/levels,w,H/levels-.035,0);}
    }else{
      const top=D.form==='arch'?H-w*.3:H;
      box(g,w,top-bottom,.02,0,(top+bottom)/2,-d/2,body,.005);
      for(const x of [-w/2,w/2]){
        if(D.form==='ladder')tube(g,[x,0,d/2],[x,H,-d/2],.025,wood);
        else box(g,.045,top,d,x,top/2,0,wood,.006);
      }
      for(let i=0;i<=levels;i++){
        const y=bottom+i*(top-bottom)/levels,offset=D.form==='offset'?(i%2-.5)*w*.16:0,depth=D.form==='ladder'?d*(1-i*.12):d;
        box(g,w,.035,depth,offset,y,D.form==='ladder'?-i*d*.04:0,wood,.005);
        if(i<levels){const rowH=(top-bottom)/levels,columns=D.form==='offset'?i%2+1:1;for(let j=0;j<columns;j++){const x=offset+(j-(columns-1)/2)*w/columns;front(x,y+rowH/2,w/columns-.04,rowH-.04,depth/2);if(j)box(g,.025,rowH,depth,x-w/columns/2,y+rowH/2,0,wood,.003);}}
      }
      if(D.form==='arch'){
        const points=[];for(let i=0;i<25;i++){const a=Math.PI-i/24*Math.PI;points.push([Math.cos(a)*w/2,top+Math.sin(a)*w*.3,-d/2]);}arc(g,points,.025,wood);box(g,w,.035,d,0,top,0,wood,.005);
      }
      if(!['wall','ladder'].includes(D.form))for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])cyl(g,.02,.025,.13,x,.065,z,metal,12);
    }
    return true;
  }
  if(def.model!=='design-lamp')return false;
  const frame=part('frame',h.color,'metal'),shade=part('shade','#e6dcc5','glow'),fabric=part('body',h.color,'cloth');
  const globe=(x,y,z,size)=>{
    if(D.shade==='orb')ball(g,x,y,z,size,size,size,shade);
    else if(D.shade==='bell')cyl(g,size*.55,size,size*1.25,x,y,z,fabric);
    else if(D.shade==='cone')cyl(g,.025,size,size*1.5,x,y,z,fabric);
    else if(D.shade==='drum'){cyl(g,size,size,size*.9,x,y,z,fabric);for(let i=0;i<24;i++){const a=i*Math.PI/12;tube(g,[x+Math.sin(a)*size,y-size*.45,z+Math.cos(a)*size],[x+Math.sin(a)*size,y+size*.45,z+Math.cos(a)*size],.003,paper);}}
    else for(let i=0;i<6;i++){const a=i*Math.PI/3;const petal=ball(g,x+Math.sin(a)*size*.5,y,z+Math.cos(a)*size*.5,size*.48,size*.85,size*.48,shade);petal.rotation.z=Math.sin(a)*.5;}
    if(D.shade!=='orb')ball(g,x,y-size*.45,z,size*.38,size*.25,size*.38,shade);
  };
  if(D.form==='chandelier'){
    tube(g,[0,.2,0],[0,H,0],.012,metal);for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*w*.34,z=Math.sin(a)*d*.34;tube(g,[0,.22,0],[x,.22,z],.014,frame);globe(x,.18,z,.11);}
  }else if(D.form==='pendant'||D.form==='flush'){
    const size=w*.4;globe(0,D.form==='flush'?size*.6:size*.85,0,size);tube(g,[0,size*.8,0],[0,H,0],.008,metal);cyl(g,.07,.07,.025,0,H,0,frame);
  }else if(D.form==='wall'){
    cyl(g,.1,.1,.025,0,H*.55,-d*.4,metal).rotation.x=Math.PI/2;arc(g,[[0,H*.55,-d*.4],[0,H*.45,0],[0,H*.65,d*.25]],.015,frame);globe(0,H*.65,d*.25,w*.34);
  }else if(D.form==='lantern'){
    cyl(g,w*.4,w*.4,.035,0,.02,0,frame);for(let i=0;i<6;i++){const a=i*Math.PI/3;tube(g,[Math.sin(a)*w*.4,.02,Math.cos(a)*d*.4],[Math.sin(a)*w*.4,H*.8,Math.cos(a)*d*.4],.009,frame);}globe(0,H*.4,0,w*.3);torus(g,w*.2,.012,0,H*.88,0,metal);
  }else{
    cyl(g,w*.3,w*.36,.035,0,.02,0,frame);
    if(D.form==='task'){tube(g,[0,.03,0],[-w*.2,H*.55,0],.018,metal);tube(g,[-w*.2,H*.55,0],[w*.25,H*.8,0],.015,metal);for(const [x,y] of [[-w*.2,H*.55],[w*.25,H*.8]])ball(g,x,y,0,.025,.025,.025,frame);globe(w*.25,H*.8,0,w*.25);}
    else{tube(g,[0,.03,0],[0,H*.78,0],D.form==='table'?.025:.015,metal);if(D.form==='table')ball(g,0,H*.25,0,w*.2,H*.22,d*.2,frame);globe(0,H-w*.3,0,w*.35);}
  }
  return true;
}
