export function buildDesignerDecor(g,def,h){
  if(def.model!=='design-decor')return false;
  const {box,cyl,ball,tube,torus,arc,panel,part}=h,F=def.design.form,[w,H,d]=def.size;
  const wood=part('frame',h.color,'wood'),body=part('body',h.color,'ceramic'),metal=part('hardware','#af9972','metal'),dark=part('details','#3f483e','matte'),paper=part('accent','#d9ceb5','cloth'),glass=part('glass','#b7c9bd','glass'),green=part('foliage','#788c65','matte');
  if(['palm','snake','bonsai','fern','bird'].includes(F)){
    cyl(g,.18,.14,.28,0,.14,0,body);cyl(g,.16,.16,.02,0,.28,0,dark);
    if(F==='snake'){for(let i=0;i<11;i++){const a=i*2.4,x=Math.sin(a)*.1,z=Math.cos(a)*.1;const leaf=box(g,.06,.45+i%3*.18,.012,x,.48+i%3*.09,z,green,.025);leaf.rotation.z=Math.sin(a)*.16;}}
    else if(F==='bonsai'){arc(g,[[0,.28,0],[.07,.5,.02],[-.05,.75,0],[.08,.95,0]],.035,wood);for(let i=0;i<7;i++){const a=i*2.4,y=.55+i*.065,x=Math.sin(a)*.22,z=Math.cos(a)*.16;tube(g,[0,y-.1,0],[x,y,z],.012,wood);ball(g,x,y,z,.16,.065,.12,green);}}
    else if(F==='fern'){for(let i=0;i<18;i++){const a=i*2.4;arc(g,[[0,.25,0],[Math.sin(a)*.15,.5,Math.cos(a)*.15],[Math.sin(a)*.35,.16,Math.cos(a)*.35]],.005,green);for(let j=1;j<6;j++)ball(g,Math.sin(a)*j*.055,.4-j*.035,Math.cos(a)*j*.055,.065,.012,.025,green);}for(const x of [-.15,.15])tube(g,[x,.25,0],[0,.8,0],.004,metal);}
    else{tube(g,[0,.25,0],[0,1,0],.018,wood);for(let i=0;i<12;i++){const a=i*2.4,y=F==='palm'?1.04:.55+i*.05,x=Math.sin(a)*.3,z=Math.cos(a)*.3;arc(g,[[0,y-.1,0],[x*.5,y+.1,z*.5],[x,y-.03,z]],.005,green);const leaf=ball(g,x*.72,y,z*.72,F==='palm'?.2:.13,.02,F==='palm'?.035:.09,green);leaf.rotation.y=-a;leaf.rotation.z=Math.sin(a)*.25;}}
  }else switch(F){
    case 'typewriter':box(g,.4,.12,.3,0,.06,0,body,.035);box(g,.38,.1,.13,0,.17,-.09,dark,.02);for(let y=0;y<4;y++)for(let x=0;x<10;x++)cyl(g,.011,.011,.012,-.16+x*.035,.13+y*.006,.1-y*.035,paper,12);const roll=cyl(g,.025,.025,.39,0,.23,-.1,dark);roll.rotation.z=Math.PI/2;box(g,.25,.12,.004,0,.26,-.11,paper,0);break;
    case 'gramophone':box(g,.4,.17,.35,0,.1,0,wood,.02);cyl(g,.12,.12,.01,0,.19,0,dark);arc(g,[[.15,.22,-.1],[.18,.38,-.1],[.06,.55,-.1]],.016,metal);const horn=cyl(g,.2,.035,.3,-.04,.65,-.1,metal);horn.rotation.z=.9;break;
    case 'telescope':for(let i=0;i<3;i++){const a=i*Math.PI*2/3;tube(g,[Math.sin(a)*.24,0,Math.cos(a)*.24],[0,.6,0],.016,wood);}const lens=cyl(g,.08,.06,.65,0,.77,0,metal);lens.rotation.x=1.1;torus(g,.08,.012,0,.92,.28,dark,1.1);break;
    case 'mantel':for(const x of [-.5,.5]){box(g,.16,.85,.25,x,.425,0,body,.015);for(let i=0;i<5;i++)box(g,.008,.7,.01,x-.06+i*.03,.43,.13,paper,.002);}box(g,1.3,.12,.35,0,.9,0,body,.018);box(g,.8,.06,.28,0,.03,0,dark);box(g,.75,.7,.015,0,.4,-.1,dark);break;
    case 'fireplace':box(g,1.3,.7,.28,0,.35,0,dark,.025);box(g,1.14,.48,.01,0,.37,.146,glass,.006);for(let i=0;i<9;i++){const log=cyl(g,.025,.025,.18,(i-4)*.1,.17,.12,wood,12);log.rotation.z=.3;ball(g,(i-4)*.1,.23,.13,.018,.05,.012,part('shade','#c6a365','glow'));}break;
    case 'blind':for(let i=0;i<24;i++)box(g,1,.035,.05,0,i*.045,0,wood,.003);for(const x of [-.35,.35])tube(g,[x,0,.035],[x,1.08,.035],.003,paper);box(g,1.08,.07,.08,0,1.1,0,wood);break;
    case 'roman':for(let i=0;i<9;i++){box(g,1,.15,.025,0,i*.12,Math.sin(i)*.005,paper,.02);tube(g,[-.48,i*.12,.025],[.48,i*.12,.025],.005,wood);}break;
    case 'tapestry':tube(g,[-.55,1.2,0],[.55,1.2,0],.012,wood);box(g,1,1.1,.012,0,.63,0,paper,0);for(let i=0;i<10;i++)box(g,.9,.025,.004,0,.13+i*.1,.012,body,0);for(let i=0;i<45;i++)tube(g,[-.48+i*.022,.08,0],[-.48+i*.022,0,0],.003,paper);break;
    case 'mobile':for(let i=0;i<5;i++){const x=(i%2?1:-1)*(.15+i*.04),y=.1+i*.14;tube(g,[-x,y,0],[x,y,.05],.005,metal);tube(g,[x,y,0],[x,y-.12,0],.003,metal);const disk=cyl(g,.08,.08,.01,x,y-.17,0,i%2?body:paper);disk.rotation.x=Math.PI/2;}tube(g,[0,.5,0],[0,1,0],.003,metal);break;
    case 'geometric-art':box(g,1,1.2,.04,0,.6,0,wood,.008);for(let i=0;i<5;i++){const disk=cyl(g,.15+i*.018,.15+i*.018,.01,Math.sin(i*2)*.22,.25+i*.15,.03+i*.006,i%2?body:paper);disk.rotation.x=Math.PI/2;}break;
    case 'vase-ring':{const ring=torus(g,.16,.045,0,.21,0,body);ring.scale.y=1.25;cyl(g,.05,.05,.12,0,.4,0,body);cyl(g,.1,.11,.03,0,.02,0,body);break;}
    case 'vase-branch':cyl(g,.08,.12,.3,0,.15,0,body);for(const x of [-.12,0,.12]){arc(g,[[0,.2,0],[x,.36,0],[x,.52,.03]],.026,body);torus(g,.026,.008,x,.52,.03,body,Math.PI/2);}break;
    case 'bust':box(g,.2,.07,.18,0,.035,0,wood);ball(g,0,.16,0,.16,.09,.1,body);cyl(g,.045,.06,.12,0,.24,0,body);ball(g,0,.37,0,.075,.1,.07,body);ball(g,0,.37,.065,.015,.025,.02,body);break;
    case 'hourglass':for(const y of [.02,.46])cyl(g,.12,.12,.025,0,y,0,metal);for(const x of [-.09,.09])tube(g,[x,.03,0],[x,.45,0],.007,metal);cyl(g,.09,.015,.2,0,.34,0,glass);cyl(g,.015,.09,.2,0,.13,0,glass);cyl(g,.005,.07,.13,0,.09,0,paper);break;
    case 'terrarium':for(let i=0;i<6;i++){const a=i*Math.PI/3,b=(i+1)*Math.PI/3;tube(g,[Math.sin(a)*.18,.03,Math.cos(a)*.18],[Math.sin(b)*.18,.03,Math.cos(b)*.18],.006,metal);tube(g,[Math.sin(a)*.18,.03,Math.cos(a)*.18],[0,.4,0],.006,metal);}cyl(g,.17,.17,.04,0,.03,0,body,6);for(let i=0;i<5;i++)ball(g,Math.sin(i*2)*.08,.12,Math.cos(i*2)*.08,.045,.07,.045,green);break;
    case 'chess-art':cyl(g,.12,.14,.04,0,.02,0,body);cyl(g,.05,.1,.25,0,.16,0,body);cyl(g,.1,.06,.05,0,.3,0,body);ball(g,0,.4,0,.1,.1,.1,body);break;
    case 'wall-baskets':for(const [x,y,r] of [[-.25,.6,.22],[.25,.8,.2],[.15,.25,.18]]){const basket=cyl(g,r,r*.9,.04,x,y,0,wood,48);basket.rotation.x=Math.PI/2;for(let i=1;i<7;i++)torus(g,r*i/7,.004,x,y,.025,paper);}break;
    case 'record-stand':box(g,.36,.025,.22,0,.015,0,wood);box(g,.025,.28,.025,-.15,.15,-.07,wood);box(g,.025,.28,.025,.15,.15,-.07,wood);box(g,.3,.3,.015,0,.19,-.04,body,.003);const disc=cyl(g,.1,.1,.004,0,.19,-.028,dark);disc.rotation.x=Math.PI/2;break;
    case 'umbrella-rack':for(const y of [.03,.45])torus(g,.13,.012,0,y,0,metal,Math.PI/2);for(let i=0;i<10;i++){const a=i*Math.PI/5;tube(g,[Math.sin(a)*.13,.03,Math.cos(a)*.13],[Math.sin(a)*.13,.45,Math.cos(a)*.13],.006,metal);}for(const x of [-.04,.04])tube(g,[x,.04,0],[x,.65,0],.009,wood);break;
    case 'mirror-arch':box(g,.65,1.3,.04,0,.65,0,wood,.015);arc(g,[[-.325,1.3,0],[0,1.62,0],[.325,1.3,0]],.03,wood);box(g,.59,1.3,.006,0,.7,.025,part('glass','#bacac1','mirror'),.02);const top=cyl(g,.295,.295,.006,0,1.3,.025,part('glass','#bacac1','mirror'));top.rotation.x=Math.PI/2;break;
  }
  return true;
}
