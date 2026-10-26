export function buildHobbyModel(g,def,h){
  const {box,cyl,ball,tube,torus,legs,part}=h,color=h.color;
  const frame=part('frame',color,'metal'),wood=part('frame',color,'wood'),body=part('body',color,'matte'),
    fabric=part('accent','#b3a386','cloth'),dark=part('details','#343a33','matte'),
    metal=part('hardware','#a7a99a','metal'),ivory=part('accent','#e4dcc7','ceramic'),
    green=part('foliage','#71855d','matte'),glass=part('glass','#a7c5b6','glass');
  const [w,H,d]=def.size;
  const wheel=(x,y,z,r=.32)=>{torus(g,r,.025,x,y,z,dark);torus(g,r-.025,.008,x,y,z,metal);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;tube(g,[x,y,z],[x+Math.sin(a)*r,y+Math.cos(a)*r,z],.003,metal);}cyl(g,.035,.035,.08,x,y,z,metal).rotation.x=Math.PI/2;};
  const caster=(x,z)=>{const o=cyl(g,.035,.035,.025,x,.04,z,dark);o.rotation.x=Math.PI/2;};
  switch(def.model){
    case 'bicycle':{
      wheel(-.59,.34,0);wheel(.59,.34,0);
      const A=[-.59,.34,0],B=[-.12,.33,0],C=[-.24,.77,0],D=[.39,.78,0],E=[.59,.34,0];
      for(const [a,b] of [[A,B],[B,C],[C,A],[C,D],[D,B],[D,E]])tube(g,a,b,.018,frame);
      tube(g,C,[-.27,.91,0],.015,metal);box(g,.24,.045,.13,-.3,.93,0,dark,.025);
      tube(g,D,[.35,1.01,0],.017,metal);tube(g,[.35,1.01,-.2],[.35,1.01,.2],.014,frame);
      torus(g,.085,.008,-.12,.33,.025,metal);tube(g,[-.12,.33,-.12],[-.12,.33,.12],.012,metal);box(g,.09,.025,.06,-.12,.28,.14,dark);
      tube(g,[-.1,.32,0],[.05,0,.18],.01,metal);break;
    }
    case 'spin-bike':{
      for(const z of [-.4,.4])tube(g,[-.28,.05,z],[.28,.05,z],.025,dark);
      tube(g,[0,.06,-.4],[0,.68,-.25],.04,frame);tube(g,[0,.06,.4],[0,.68,-.25],.04,frame);
      const fly=cyl(g,.22,.22,.09,0,.3,-.17,dark);fly.rotation.z=Math.PI/2;
      tube(g,[0,.5,.27],[0,1.02,.2],.025,metal);box(g,.26,.07,.2,0,1.03,.2,dark,.03);
      tube(g,[0,.5,-.3],[0,1.2,-.48],.025,frame);tube(g,[-.26,1.2,-.48],[.26,1.2,-.48],.02,dark);
      for(const x of [-.16,.16])box(g,.12,.03,.14,x,.35,.05,dark);break;
    }
    case 'helmet':ball(g,0,.12,0,.135,.12,.17,body);for(let i=-2;i<=2;i++)box(g,.012,.02,.23,i*.039,.215,0,dark,.005);torus(g,.08,.008,0,.04,.01,dark,Math.PI/2);break;
    case 'treadmill':{
      box(g,.85,.13,1.8,0,.09,0,frame,.04);box(g,.64,.025,1.45,0,.17,.05,dark,.015);box(g,.7,.09,.27,0,.2,-.68,body,.03);
      for(const x of [-.37,.37]){tube(g,[x,.15,-.5],[x,1.18,-.7],.035,frame);tube(g,[x,1.04,-.7],[x,1.04,-.25],.025,dark);}
      const console=box(g,.67,.075,.3,0,1.2,-.66,body,.025);console.rotation.x=-.2;
      box(g,.3,.008,.16,0,1.245,-.66,part('details','#6d958d','lacquer'),.01);for(let i=0;i<18;i++)box(g,.57,.001,.006,0,.184,-.6+i*.075,part('details','#53594d','matte'),0);break;
    }
    case 'shoes':for(const x of [-.09,.09]){box(g,.13,.025,.3,x,.015,0,ivory,.04);ball(g,x,.065,.035,.065,.045,.14,body);ball(g,x,.09,-.08,.06,.055,.06,fabric);for(let i=0;i<5;i++)tube(g,[x-.04,.11,-.02+i*.022],[x+.04,.11,-.02+i*.022],.004,ivory);}break;
    case 'medals':box(g,.65,.07,.04,0,.45,0,wood,.01);for(let i=0;i<5;i++){const x=(i-2)*.11;tube(g,[x-.025,.45,.03],[x,.16,.03],.008,fabric);tube(g,[x+.025,.45,.03],[x,.16,.03],.008,fabric);const medal=cyl(g,.047,.047,.014,x,.12,.03,metal);medal.rotation.x=Math.PI/2;}break;
    case 'weight-rack':{
      for(const x of [-.44,.44]){tube(g,[x,0,-.2],[x,.75,0],.025,frame);tube(g,[x,0,.2],[x,.75,0],.025,frame);}
      for(const y of [.3,.65]){box(g,1,.03,.32,0,y,0,frame,.01);for(let i=0;i<4;i++){const x=(i-1.5)*.22;tube(g,[x-.07,y+.07,0],[x+.07,y+.07,0],.014,metal);for(const sign of [-1,1]){const weight=cyl(g,.065,.065,.04,x+sign*.08,y+.07,0,dark,12);weight.rotation.z=Math.PI/2;}}}break;
    }
    case 'workout-bench':legs(g,.4,1,.3,frame);box(g,.46,.13,.8,0,.37,.2,fabric,.04);const rest=box(g,.46,.12,.6,0,.48,-.45,fabric,.04);rest.rotation.x=.3;tube(g,[0,.05,-.35],[0,.4,-.35],.035,frame);break;
    case 'kettlebells':for(let i=0;i<3;i++){const x=(i-1)*.17,r=.06+i*.012;ball(g,x,r,0,r,r,r,body);torus(g,r*.7,.012,x,r*2,0,metal);}break;
    case 'yoga-mat':box(g,.7,.015,1.85,0,.008,0,part('body',color,'cloth'),.025);for(const x of [-.18,.18])box(g,.18,.09,.12,x,.06,-.6,part('accent','#c3af89','matte'),.015);break;
    case 'foam-roller':{const roll=cyl(g,.08,.08,.5,0,.08,0,body);roll.rotation.z=Math.PI/2;for(let i=0;i<18;i++){const a=i/18*Math.PI*2;tube(g,[-.24,.08+Math.sin(a)*.079,Math.cos(a)*.079],[.24,.08+Math.sin(a)*.079,Math.cos(a)*.079],.004,dark);}break;}
    case 'reformer':box(g,.75,.15,2.1,0,.18,0,wood,.03);box(g,.56,.08,1.15,0,.3,-.08,fabric,.035);for(const x of [-.3,.3])tube(g,[x,.31,-.9],[x,.31,.9],.014,metal);for(const x of [-.23,.23])tube(g,[x,.2,.8],[x,.55,.8],.02,frame);tube(g,[-.23,.55,.8],[.23,.55,.8],.025,dark);for(const x of [-.18,0,.18])tube(g,[x,.26,-.8],[x,.26,-.45],.008,metal);break;
    case 'book-cart':case 'supply-cart':case 'bakers-rack':case 'grow-stand':{
      const levels=def.model==='bakers-rack'?4:3;
      for(const x of [-w*.44,w*.44])for(const z of [-d*.4,d*.4])tube(g,[x,.08,z],[x,H,z],.018,def.model==='grow-stand'?wood:frame);
      for(let i=0;i<levels;i++){const y=.12+i*(H-.25)/(levels-1);box(g,w,.035,d,0,y,0,wood,.008);
        if(def.model==='book-cart')for(let j=0;j<7;j++)box(g,.045,.22,.2,(j-3)*.065,y+.13,0,part('accent',j%2?'#b0a17d':'#7f9276','matte'),.003);
        if(def.model==='supply-cart')for(let j=0;j<3;j++)cyl(g,.05,.05,.11,(j-1)*.15,y+.07,0,body);
        if(def.model==='grow-stand')for(let j=0;j<3;j++){cyl(g,.07,.05,.1,(j-1)*.22,y+.07,0,body);ball(g,(j-1)*.22,y+.19,0,.08,.08,.08,green);}
        if(def.model==='bakers-rack')for(const x of [-.2,.2])cyl(g,.09,.07,.09,x,y+.065,0,ivory);
      }
      if(def.model.includes('cart'))for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])caster(x,z);break;
    }
    case 'book-stand':box(g,.4,.025,.32,0,.02,0,wood,.012);const book=box(g,.35,.045,.25,0,.16,-.02,ivory,.01);book.rotation.x=.55;tube(g,[-.16,.03,-.1],[-.16,.25,-.1],.009,wood);tube(g,[.16,.03,-.1],[.16,.25,-.1],.009,wood);break;
    case 'gaming-desk':box(g,1.5,.055,.7,0,.72,0,wood,.02);legs(g,1.25,.5,.7,frame);box(g,.78,.46,.035,0,1.05,-.2,dark,.012);box(g,.73,.4,.005,0,1.05,-.178,part('body',color,'lacquer'),.005);tube(g,[0,.76,-.2],[0,.85,-.2],.025,frame);box(g,.45,.025,.16,-.1,.765,.13,dark,.009);box(g,.075,.025,.1,.32,.77,.13,body,.02);break;
    case 'game-console':box(g,.13,.38,.22,-.08,.19,0,body,.025);box(g,.025,.33,.2,-.08,.19,.02,dark,.01);for(const x of [.09,.24]){ball(g,x,.04,.04,.065,.035,.045,body);for(const sign of [-1,1])ball(g,x+sign*.025,.073,.04,.009,.005,.009,dark);}break;
    case 'gaming-chair':{
      for(let i=0;i<5;i++){const a=i/5*Math.PI*2;tube(g,[0,.13,0],[Math.sin(a)*.3,.04,Math.cos(a)*.3],.022,frame);caster(Math.sin(a)*.3,Math.cos(a)*.3);}
      tube(g,[0,.1,0],[0,.52,0],.035,metal);box(g,.55,.12,.52,0,.53,0,fabric,.07);box(g,.52,.68,.12,0,.91,-.22,body,.08);for(const x of [-.3,.3])tube(g,[x,.5,0],[x,.7,0],.018,frame);for(const x of [-.3,.3])box(g,.08,.045,.3,x,.71,0,dark,.02);break;
    }
    case 'guitar':ball(g,0,.32,0,.2,.24,.075,wood);ball(g,0,.5,0,.15,.15,.07,wood);const hole=cyl(g,.055,.055,.008,0,.43,.077,dark);hole.rotation.x=Math.PI/2;box(g,.055,.52,.035,0,.8,0,wood,.008);box(g,.085,.15,.035,0,1.12,0,wood,.01);for(let i=0;i<6;i++)tube(g,[-.02+i*.008,.2,.09],[-.02+i*.008,1.15,.025],.001,metal);tube(g,[-.2,0,.08],[0,.4,0],.015,frame);tube(g,[.2,0,.08],[0,.4,0],.015,frame);break;
    case 'piano':box(g,1.35,.14,.45,0,.8,0,wood,.025);for(const x of [-.55,.55])box(g,.07,.75,.35,x,.375,0,wood);for(let i=0;i<36;i++){const x=-.61+i*.035;box(g,.032,.025,.23,x,.88,.09,ivory,.001);if(i%7!==2&&i%7!==6)box(g,.018,.025,.13,x+.017,.9,.035,dark,.001);}box(g,1.15,.13,.025,0,.95,-.18,wood);break;
    case 'drum-kit':{
      const bass=cyl(g,.28,.28,.38,0,.3,.15,body);bass.rotation.x=Math.PI/2;torus(g,.28,.012,0,.3,.35,metal);
      for(const [x,y,z,r] of [[-.28,.73,-.05,.18],[.23,.75,-.08,.16],[.53,.42,.25,.21],[-.48,.45,.23,.16]]){cyl(g,r,r,.25,x,y,z,body);cyl(g,r,r,.008,x,y+.13,z,ivory);for(const dx of [-.08,.08])tube(g,[x+dx,0,z],[x+dx,y-.13,z],.012,metal);}
      for(const x of [-.6,.5]){tube(g,[x,0,-.32],[x,1.15,-.32],.012,metal);cyl(g,.23,.12,.015,x,1.15,-.32,part('hardware','#b49a62','metal'));}break;
    }
    case 'camera-tripod':case 'studio-light':{
      const height=def.model==='studio-light'?1.6:1.2;for(let i=0;i<3;i++){const a=i/3*Math.PI*2;tube(g,[Math.sin(a)*.3,0,Math.cos(a)*.3],[0,height*.72,0],.012,frame);}tube(g,[0,.3,0],[0,height,0],.014,metal);
      if(def.model==='camera-tripod'){box(g,.23,.15,.09,0,height+.08,0,body,.02);const lens=cyl(g,.06,.07,.13,0,height+.08,.1,dark);lens.rotation.x=Math.PI/2;}
      else{box(g,.7,.55,.08,0,height,0,body,.06);box(g,.65,.5,.01,0,height,.047,part('shade','#f0e7cf','glow'),.04);}break;
    }
    case 'equipment-case':box(g,w,H*.85,d,0,H*.43,0,body,.04);box(g,w,.04,d,0,H*.87,0,dark,.025);tube(g,[-w*.2,H,0],[w*.2,H,0],.012,frame);for(const x of [-w*.3,w*.3])box(g,.035,.07,.02,x,H*.65,d/2,metal,.005);break;
    case 'easel':for(const x of [-.32,.32])tube(g,[x,0,.2],[x*.5,1.65,0],.022,wood);tube(g,[0,0,-.3],[0,1.5,0],.02,wood);box(g,.66,.035,.1,0,.6,.035,wood);box(g,.57,.73,.025,0,1.02,.04,ivory,.005);ball(g,-.1,1.11,.058,.13,.2,.003,body);box(g,.15,.32,.003,.13,.91,.059,part('accent','#8c9976','matte'),0);break;
    case 'paint-kit':cyl(g,.08,.06,.13,.1,.065,0,body);for(let i=0;i<8;i++)tube(g,[.1+(i%3)*.01,.08,0],[.06+i*.014,.25,.02],.004,wood);const palette=cyl(g,.16,.16,.015,-.09,.012,0,wood);palette.scale.z=.7;for(let i=0;i<5;i++)ball(g,-.2+i*.045,.024,.04,.015,.004,.015,part('accent',['#916b52','#8a9a73','#d3b484','#8a9e9b','#b48d7e'][i],'matte'));break;
    case 'sewing-machine':box(g,.4,.025,.22,0,.015,0,body,.018);box(g,.1,.27,.15,.12,.15,0,body,.025);box(g,.31,.08,.15,0,.27,0,body,.03);tube(g,[-.12,.07,0],[-.12,.24,0],.005,metal);cyl(g,.025,.025,.065,.09,.33,0,fabric);break;
    case 'yarn-basket':cyl(g,.2,.16,.22,0,.11,0,wood);for(let i=0;i<6;i++){const a=i*2.4;ball(g,Math.sin(a)*.1,.24+i%2*.04,Math.cos(a)*.1,.07,.07,.07,part('accent',i%2?'#a3ad8f':'#c5ab91','cloth'));}tube(g,[0,.15,0],[-.06,.4,.03],.004,wood);tube(g,[0,.15,0],[.06,.4,.03],.004,wood);break;
    case 'loom':for(const x of [-.25,.25])box(g,.035,.4,.035,x,.23,0,wood);for(const y of [.06,.42])box(g,.55,.035,.035,0,y,0,wood);for(let i=0;i<25;i++)tube(g,[-.23+i*.019,.08,.01],[-.23+i*.019,.4,.01],.003,fabric);for(let i=0;i<12;i++)box(g,.45,.015,.01,0,.1+i*.017,.017,part('accent',i%3?'#b39b7d':'#8b9c7b','cloth'),0);break;
    case 'utensils':cyl(g,.085,.07,.18,0,.09,0,body);for(let i=0;i<7;i++){const x=(i-3)*.017;tube(g,[x,.08,0],[x,.34,.015],.006,wood);ball(g,x,.35,.015,.018,.045,.007,wood);}break;
    case 'baking-kit':box(g,.55,.025,.38,0,.014,0,wood,.025);const pin=cyl(g,.025,.025,.32,0,.055,.05,wood);pin.rotation.z=Math.PI/2;for(const x of [-.2,.2])tube(g,[x-.04,.055,.05],[x+.04,.055,.05],.012,wood);for(let i=0;i<4;i++)ball(g,-.18+i*.12,.05,-.1,.04,.025,.04,ivory);break;
    case 'herb-planter':box(g,.65,.18,.25,0,.09,0,wood,.025);for(let i=0;i<5;i++){const x=(i-2)*.115;tube(g,[x,.18,0],[x,.38,0],.005,green);for(let j=0;j<5;j++)ball(g,x+Math.sin(j*2.4)*.04,.25+j*.025,Math.cos(j*2.4)*.04,.04,.012,.025,green);}break;
    case 'watering-can':cyl(g,.1,.1,.22,0,.11,0,body);tube(g,[.08,.08,0],[.28,.25,0],.022,frame);torus(g,.095,.012,-.11,.14,0,frame);break;
    case 'backpack':box(g,.4,.58,.25,0,.3,0,fabric,.08);box(g,.3,.24,.07,0,.21,.15,body,.045);for(const x of [-.13,.13])tube(g,[x,.1,-.16],[x,.55,-.16],.025,dark);tube(g,[-.08,.59,0],[.08,.59,0],.012,frame);break;
    case 'camp-chair':for(const x of [-.25,.25]){tube(g,[x,0,-.25],[x,.6,.2],.016,frame);tube(g,[x,0,.25],[x,.85,-.22],.016,frame);}box(g,.52,.035,.47,0,.42,0,fabric,.02);box(g,.52,.37,.025,0,.67,-.21,fabric,.02);break;
    case 'camping-kit':{
      const bag=cyl(g,.17,.17,.55,-.12,.17,0,fabric);bag.rotation.z=Math.PI/2;for(const x of [-.28,.06])torus(g,.175,.012,x,.17,0,dark,Math.PI/2).rotation.y=Math.PI/2;
      cyl(g,.09,.09,.24,.28,.12,.05,body);ball(g,.28,.3,.05,.07,.07,.07,ivory);break;
    }
    case 'rod-rack':box(g,.7,.06,.3,0,.03,0,wood);box(g,.7,.035,.12,0,.6,0,wood);for(let i=0;i<4;i++){const x=(i-1.5)*.16;tube(g,[x,.05,0],[x+.035,2,0],.006,frame);cyl(g,.018,.018,.3,x,.2,0,wood);torus(g,.035,.01,x,.36,.025,metal);}break;
    case 'fishing-net':tube(g,[0,0,0],[0,.8,0],.018,wood);const hoop=torus(g,.23,.012,0,1,0,frame);hoop.scale.y=1.3;for(let i=-4;i<=4;i++){const x=i*.043,span=Math.sqrt(Math.max(0,.23*.23-x*x))*1.3;tube(g,[x,1-span,0],[x,1+span,0],.002,fabric);}break;
    case 'suitcases':for(let i=0;i<2;i++){const x=i?.24:-.2,h=i?.58:.75;box(g,.36,h,.27,x,h/2+.04,0,body,.045);for(const xx of [-.12,.12])caster(x+xx,0);tube(g,[x-.09,h+.04,0],[x-.09,h+.16,0],.008,metal);tube(g,[x+.09,h+.04,0],[x+.09,h+.16,0],.008,metal);tube(g,[x-.09,h+.16,0],[x+.09,h+.16,0],.012,dark);for(let j=-2;j<=2;j++)box(g,.007,h-.1,.01,x+j*.055,h/2+.04,.142,metal,.002);}break;
    case 'globe':cyl(g,.13,.13,.025,0,.014,0,wood);tube(g,[0,.02,0],[0,.2,0],.018,metal);ball(g,0,.33,0,.16,.16,.16,body);torus(g,.17,.008,0,.33,0,metal);for(let i=-2;i<=2;i++)torus(g,.16*Math.sqrt(1-(i*.3)**2),.002,0,.33+i*.048,0,ivory,Math.PI/2);break;
    case 'world-map':box(g,1.1,.7,.045,0,.35,0,wood,.012);box(g,1.04,.64,.008,0,.35,.028,ivory,.002);for(const [x,y,a,b] of [[-.29,.43,.13,.13],[-.19,.22,.07,.13],[.04,.42,.1,.09],[.08,.24,.08,.12],[.25,.42,.18,.12],[.35,.17,.09,.045]])ball(g,x,y,.036,a,b,.003,body);break;
    case 'chess-set':box(g,.45,.025,.45,0,.014,0,wood,.008);for(let x=0;x<8;x++)for(let z=0;z<8;z++)if((x+z)%2===0)box(g,.053,.001,.053,-.185+x*.053,.028,-.185+z*.053,ivory,0);for(const sign of [-1,1])for(let i=0;i<8;i++){const x=-.185+i*.053,m=sign===1?dark:ivory;for(const z of [sign*.185,sign*.132]){cyl(g,.016,.019,.035,x,.046,z,m);ball(g,x,.073,z,.014,.014,.014,m);}}break;
    case 'game-boxes':for(let i=0;i<4;i++){box(g,.42,.06,.3,0,.03+i*.061,0,part('body',i%2?color:'#c4b494','matte'),.008,i*.035);box(g,.22,.008,.004,0,.04+i*.061,.154,ivory,.001);}break;
    case 'projector':box(g,.35,.14,.27,0,.075,0,body,.035);const lens=cyl(g,.045,.045,.03,-.07,.08,.145,dark);lens.rotation.x=Math.PI/2;for(let i=0;i<12;i++)box(g,.008,.055,.005,.05+i*.009,.08,.139,dark,.001);break;
    case 'speakers':for(const x of [-.27,.27]){box(g,.25,.95,.3,x,.48,0,wood,.015);for(const [y,r] of [[.22,.08],[.51,.08],[.8,.035]]){const cone=cyl(g,r,r,.02,x,y,.16,dark);cone.rotation.x=Math.PI/2;torus(g,r,.006,x,y,.174,metal);}}break;
    case 'cinema-screen':box(g,1.9,.07,.08,0,1.26,0,frame,.025);box(g,1.84,1.2,.012,0,.62,0,ivory,.003);box(g,1.87,.025,.03,0,.02,0,frame,.003);break;
    case 'ballet-barre':for(const x of [-.65,.65]){tube(g,[x,0,-.25],[x,0,.25],.02,frame);tube(g,[x,0,0],[x,1.07,0],.02,frame);}tube(g,[-.8,1.08,0],[.8,1.08,0],.025,wood);tube(g,[-.8,.75,0],[.8,.75,0],.022,wood);break;
    case 'dance-kit':box(g,.4,.035,.3,0,.035,0,wood);tube(g,[0,.05,0],[0,.6,0],.012,frame);for(const x of [-.12,.12]){ball(g,x,.18,.02,.055,.12,.025,fabric);tube(g,[x,.29,.02],[0,.56,0],.006,fabric);}break;
    case 'figures':for(let i=0;i<3;i++){const x=(i-1)*.15;cyl(g,.05,.05,.015,x,.01,0,wood);cyl(g,.025,.04,.13,x,.08,0,body);ball(g,x,.19,0,.04,.045,.04,body);tube(g,[x-.06,.1,0],[x+.06,.15,0],.012,body);}break;
    case 'record-crate':box(g,.45,.025,.4,0,.015,0,wood);for(const x of [-.215,.215])for(let i=0;i<4;i++)box(g,.025,.04,.4,x,.07+i*.07,0,wood,.005);for(let i=0;i<9;i++)box(g,.37,.35,.016,0,.2,-.15+i*.035,part('accent',i%2?'#586650':'#b4a080','matte'),.003);break;
    case 'cat-tree':box(g,.7,.045,.6,0,.023,0,wood,.025);for(const [x,y,z] of [[-.18,.45,0],[.16,.9,.1],[-.05,1.4,-.12]]){cyl(g,.05,.05,y,x,y/2,z,fabric);box(g,.4,.045,.36,x,y,z,fabric,.025);}box(g,.32,.3,.3,-.18,.24,0,body,.04);const door=cyl(g,.08,.08,.007,-.18,.25,.155,dark);door.rotation.x=Math.PI/2;break;
    case 'pet-bed':box(g,.7,.08,.55,-.1,.04,0,fabric,.08);for(const x of [-.43,.23])box(g,.08,.13,.5,x,.1,0,body,.04);box(g,.67,.13,.08,-.1,.1,-.23,body,.04);for(const z of [-.13,.13]){cyl(g,.075,.05,.04,.38,.025,z,metal);cyl(g,.055,.055,.005,.38,.05,z,dark);}break;
    case 'aquarium':box(g,.9,.65,.4,0,.325,0,wood,.018);box(g,.9,.045,.4,0,.68,0,dark);for(const x of [-.44,.44])box(g,.012,.52,.4,x,.96,0,glass,0);for(const z of [-.195,.195])box(g,.88,.52,.012,0,.96,z,glass,0);box(g,.87,.035,.37,0,.73,0,part('details','#bba886','stone'));for(let i=0;i<7;i++)tube(g,[-.32+i*.1,.75,0],[-.3+i*.1,1.03+i%2*.1,.04],.01,green);for(const x of [-.2,.16]){ball(g,x,.98,.05,.06,.025,.015,part('accent','#b69768','matte'));const tail=box(g,.04,.04,.004,x-.065,.98,.05,ivory,0);tail.rotation.z=Math.PI/4;}break;
    default:return false;
  }
  return true;
}
