import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, Armchair, BookOpen, Box, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Copy, Download, Expand, Eye, Footprints, Grid2X2, Heart, House, Layers3, LayoutDashboard, Lightbulb, LoaderCircle, Maximize, Minus, Moon, MoreHorizontal, MousePointer2, Move, Paintbrush, Plus, Redo2, RotateCcw, RotateCw, Search, Settings2, SlidersHorizontal, Sofa, Sparkles, Sun, Sunset, Trash2, Undo2, Upload, X } from 'lucide-react';
import { CATALOG, CATEGORIES, SWATCHES, WALL_COLORS, FLOOR_TYPES, LAYOUTS, makeItem, DEFAULT_DESIGN, initialItems, validateDesign } from './catalog.js';
import { DesignScene, generateThumbnails } from './scene.js';

const STORAGE_KEY='forma-design-v1';
const readStorage=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
function loadDesign(){try{const v=readStorage(STORAGE_KEY,null);return v?validateDesign(v):DEFAULT_DESIGN();}catch{return DEFAULT_DESIGN();}}
const formatTime=(time)=>`${String(Math.floor(time)%12||12).padStart(2,'0')}:${String(Math.round((time%1)*60)).padStart(2,'0')} ${time>=12?'PM':'AM'}`;
const timeName=t=>t<6?'Nightfall':t<10?'Morning light':t<16?'Afternoon':t<19?'Golden hour':'Evening glow';
const cn=(...parts)=>parts.filter(Boolean).join(' ');

function Logo(){return <a className="brand" href="#" aria-label="Forma home" onClick={e=>e.preventDefault()}><svg width="31" height="35" viewBox="0 0 31 35" fill="none"><path d="M3 31V9L15 3l13 6v10l-13-6v18H3Z" fill="currentColor"/><path d="m16 15 12 5-12 7V15Z" fill="currentColor" opacity=".55"/></svg><span>forma<span className="brand-dot">.</span></span></a>;}
function IconButton({label,children,active,className='',...props}){return <button className={cn('icon-button',active&&'active',className)} aria-label={label} title={label} {...props}>{children}</button>;}
function Plan({layout,large=false}){
  return <svg className={cn('plan',large&&'large')} viewBox="0 0 240 160" aria-hidden="true"><defs><pattern id={`grid-${layout.id}`} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#d7d5c7" strokeWidth=".4"/></pattern></defs><rect x="28" y="19" width="184" height="122" fill={`url(#grid-${layout.id})`} stroke="#7c876e" strokeWidth="5"/><path d="M68 19h70M212 55v44" stroke="#c1d2c2" strokeWidth="6"/>{layout.partitions?<><path d="M144 20v45m0 25v51m0-61h68" stroke="#7c876e" strokeWidth="4"/><rect x="159" y="30" width="38" height="37" rx="3" fill="#c9c1a6"/><path d="M160 40h36" stroke="#f2eee0" strokeWidth="4"/><ellipse cx="184" cy="121" rx="18" ry="8" fill="#d9dfd0"/><rect x="156" y="91" width="12" height="16" rx="3" fill="#d9dfd0"/></>:<><rect x="160" y="25" width="41" height="14" rx="2" fill="#c9c1a6"/><rect x="163" y="51" width="32" height="13" rx="2" fill="#c9c1a6"/></>}<rect x="51" y="54" width="62" height="53" rx="2" fill="#e5deca"/><rect x="49" y="48" width="64" height="21" rx="5" fill="#929b7b"/><rect x="49" y="49" width="7" height="22" rx="3" fill="#7e886b"/><rect x="107" y="49" width="7" height="22" rx="3" fill="#7e886b"/><ellipse cx="82" cy="86" rx="18" ry="10" fill="#b09a72"/><circle cx="40" cy="31" r="8" fill="#a8b38e"/><path d="M85 141h28" stroke="#f5f3e9" strokeWidth="6"/><path d="M85 141v-23a24 24 0 0 1 24 23" stroke="#aaa995" strokeWidth="1" fill="none"/></svg>;
}

function App(){
  const [design,setDesign]=useState(loadDesign),designRef=useRef(design);
  designRef.current=design;
  const [panel,setPanel]=useState('furniture'),[category,setCategory]=useState('all'),[search,setSearch]=useState(''),[favoritesOnly,setFavoritesOnly]=useState(false);
  const [selectedId,setSelectedId]=useState(null),[view,setView]=useState('orbit'),[mode,setMode]=useState('select'),[grid,setGrid]=useState(false),[snap,setSnap]=useState(true),[walls,setWalls]=useState(true);
  const [thumbs,setThumbs]=useState({}),[loading,setLoading]=useState(true),[renderError,setRenderError]=useState(''),[toast,setToast]=useState(''),[saveStatus,setSaveStatus]=useState('saved');
  const [help,setHelp]=useState(false),[spaces,setSpaces]=useState(false),[exportOpen,setExportOpen]=useState(false),[lightOpen,setLightOpen]=useState(false),[intro,setIntro]=useState(!readStorage('forma-onboarded',false));
  const [past,setPast]=useState([]),[future,setFuture]=useState([]),[inspectorTab,setInspectorTab]=useState('appearance');
  const mountRef=useRef(null),engineRef=useRef(null),toastTimer=useRef(null),uploadRef=useRef(null),headerRef=useRef(null);
  const layout=LAYOUTS.find(l=>l.id===design.layoutId),selected=design.items.find(i=>i.uid===selectedId),selectedDef=selected&&CATALOG.find(i=>i.id===selected.catalogId);
  const notify=useCallback(text=>{setToast(text);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),3400);},[]);
  const change=useCallback((fn,history=true)=>{
    const current=designRef.current;const next=typeof fn==='function'?fn(current):fn;
    if(history){setPast(p=>[...p.slice(-39),current]);setFuture([]);}
    designRef.current=next;setDesign(next);
  },[]);
  const checkpoint=useCallback(()=>{setPast(p=>[...p.slice(-39),designRef.current]);setFuture([]);},[]);
  const updateItem=useCallback((uid,values,history=true)=>change(d=>({...d,items:d.items.map(i=>{
    if(i.uid!==uid)return i;
    const next={...i,...values},def=CATALOG.find(c=>c.id===next.catalogId),l=LAYOUTS.find(l=>l.id===d.layoutId);
    const co=Math.abs(Math.cos(next.rotation)),si=Math.abs(Math.sin(next.rotation));
    const halfX=(def.size[0]*co+def.size[2]*si)*next.scale/2,halfZ=(def.size[0]*si+def.size[2]*co)*next.scale/2;
    next.x=Math.max(-l.width/2+halfX+.08,Math.min(l.width/2-halfX-.08,next.x));
    next.z=Math.max(-l.depth/2+halfZ+.08,Math.min(l.depth/2-halfZ-.08,next.z));
    next.y=Math.max(0,Math.min(3,next.y));
    return next;
  })}),history),[change]);
  const undo=useCallback(()=>{setPast(p=>{if(!p.length)return p;const previous=p[p.length-1];setFuture(f=>[designRef.current,...f]);designRef.current=previous;setDesign(previous);return p.slice(0,-1);});},[]);
  const redo=useCallback(()=>{setFuture(f=>{if(!f.length)return f;const next=f[0];setPast(p=>[...p,designRef.current]);designRef.current=next;setDesign(next);return f.slice(1);});},[]);
  useEffect(()=>{
    try{
      const engine=new DesignScene(mountRef.current,{
        onSelect:setSelectedId,onMove:(uid,pos)=>updateItem(uid,pos,false),onDragStart:checkpoint,
        onPhysics:(uid,pos)=>{if(designRef.current.items.some(i=>i.uid===uid))updateItem(uid,pos,false);},onView:setView,
      });
      engineRef.current=engine;engine.setDesign(designRef.current);setLoading(false);
      generateThumbnails((id,url)=>setThumbs(t=>({...t,[id]:url})));
      return ()=>{engine.dispose();clearTimeout(toastTimer.current);};
    }catch(e){console.error(e);setRenderError('Your browser could not start the 3D renderer. Enable hardware acceleration and refresh to enter the studio.');setLoading(false);}
  },[updateItem,checkpoint]);
  useEffect(()=>{engineRef.current?.setDesign(design);setSaveStatus('saving');const timer=setTimeout(()=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(design));localStorage.setItem(`forma-space-${design.layoutId}`,JSON.stringify(design));setSaveStatus('saved');}catch{setSaveStatus('failed');}
  },650);return()=>clearTimeout(timer);},[design]);
  useEffect(()=>{engineRef.current?.select(selectedId);},[selectedId]);
  useEffect(()=>{engineRef.current?.setMode(mode);},[mode]);
  useEffect(()=>{engineRef.current?.setGrid(grid);},[grid]);
  useEffect(()=>{engineRef.current?.setSnap(snap);},[snap]);
  useEffect(()=>{engineRef.current?.setWalls(walls);},[walls]);
  const removeSelected=useCallback(()=>{if(!selectedId)return;change(d=>({...d,items:d.items.filter(i=>i.uid!==selectedId)}));setSelectedId(null);notify('Item removed from your space');},[selectedId,change,notify]);
  const duplicateSelected=useCallback(()=>{
    const i=designRef.current.items.find(i=>i.uid===selectedId);if(!i)return;const def=CATALOG.find(c=>c.id===i.catalogId);const l=LAYOUTS.find(l=>l.id===designRef.current.layoutId);
    const x=Math.min(l.width/2-def.size[0]*i.scale/2-.1,i.x+.4),z=Math.min(l.depth/2-def.size[2]*i.scale/2-.1,i.z+.4);
    const clone=makeItem(i.catalogId,x,z,i.rotation,i.y,{color:i.color,scale:i.scale});change(d=>({...d,items:[...d.items,clone]}));setSelectedId(clone.uid);notify('A little more of a good thing. Item duplicated.');
  },[selectedId,change,notify]);
  useEffect(()=>{const handler=e=>{
    if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicateSelected();}
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected();}
    if(e.key.toLowerCase()==='r'&&selectedId)updateItem(selectedId,{rotation:(selected?.rotation||0)+Math.PI/12});
    if(e.key==='Escape'){setSelectedId(null);setHelp(false);setSpaces(false);setExportOpen(false);setLightOpen(false);}
    if(e.key.toLowerCase()==='v')setMode('select');if(e.key.toLowerCase()==='m')setMode('move');
  };window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[undo,redo,duplicateSelected,removeSelected,selectedId,selected?.rotation,updateItem]);
  useEffect(()=>{if(!exportOpen)return;const handler=e=>{if(!headerRef.current?.contains(e.target))setExportOpen(false);};document.addEventListener('pointerdown',handler);return()=>document.removeEventListener('pointerdown',handler);},[exportOpen]);

  const addItem=def=>{
    if(design.items.length>=400){notify('This space has reached its 400-item limit.');return;}
    const l=LAYOUTS.find(l=>l.id===design.layoutId);let x=0,z=l.depth*.22;
    // Find an unoccupied starting point; players can then move it anywhere.
    for(let attempt=0;attempt<40;attempt++){
      x=((attempt%7)-3)*.55;z=l.depth*.22-Math.floor(attempt/7)*.65;
      if(!design.items.some(i=>{const d=CATALOG.find(c=>c.id===i.catalogId);return !d.rug&&!d.small&&Math.abs(i.x-x)<(d.size[0]*i.scale+def.size[0])*.35&&Math.abs(i.z-z)<(d.size[2]*i.scale+def.size[2])*.35;}))break;
    }
    x=Math.max(-l.width/2+def.size[0]/2+.15,Math.min(l.width/2-def.size[0]/2-.15,x));
    z=Math.max(-l.depth/2+def.size[2]/2+.15,Math.min(l.depth/2-def.size[2]/2-.15,z));
    const item=makeItem(def.id,x,z,0,def.ceiling?2.3:0);
    change(d=>({...d,items:[...d.items,item]}));setSelectedId(item.uid);setMode('move');setInspectorTab('appearance');
    notify(`${def.name} added. Drag it to make it yours.`);
  };
  const toggleFavorite=(e,id)=>{e.stopPropagation();change(d=>({...d,favoriteIds:d.favoriteIds.includes(id)?d.favoriteIds.filter(i=>i!==id):[...d.favoriteIds,id]}),false);};
  const filtered=useMemo(()=>CATALOG.filter(i=>(category==='all'||i.category===category)&&(!favoritesOnly||design.favoriteIds.includes(i.id))&&`${i.name} ${i.finish} ${i.category}`.toLowerCase().includes(search.toLowerCase())),[category,search,favoritesOnly,design.favoriteIds]);
  const selectView=v=>{setView(v);engineRef.current?.setView(v);if(v==='walk')notify('W A S D to move · drag to look · arrow keys to turn');};
  const selectLayout=id=>{
    if(id===design.layoutId){setSpaces(false);return;}
    try{localStorage.setItem(`forma-space-${design.layoutId}`,JSON.stringify(design));}catch{}
    let saved;try{const v=readStorage(`forma-space-${id}`,null);if(v)saved=validateDesign(v);}catch{}
    change(saved||{...DEFAULT_DESIGN(),layoutId:id,items:initialItems(id),name:'A space of my own',favoriteIds:design.favoriteIds});
    setSelectedId(null);setSpaces(false);setIntro(false);notify(`Welcome to ${LAYOUTS.find(l=>l.id===id).name}`);
  };
  const download=(content,name,type)=>{const url=typeof content==='string'&&content.startsWith('data:')?content:URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();if(!url.startsWith('data:'))setTimeout(()=>URL.revokeObjectURL(url),2000);};
  const exportImage=async()=>{if(!engineRef.current)return;const image=await engineRef.current.snapshot();download(image,`forma-${design.layoutId}.png`);setExportOpen(false);notify('Your space, captured. Image downloaded.');};
  const exportDesign=()=>{download(JSON.stringify(design,null,2),`forma-${design.layoutId}.json`,'application/json');setExportOpen(false);notify('Design downloaded. Bring it back any time.');};
  const importDesign=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2e6)throw new Error('Please choose a design smaller than 2 MB.');const imported=validateDesign(JSON.parse(await file.text()));change(imported);setSelectedId(null);notify('Welcome back. Your design is ready.');}catch(err){notify(err instanceof SyntaxError?'That file could not be read. Choose a Forma JSON design.':err.message);}e.target.value='';setExportOpen(false);};
  const dismissIntro=()=>{setIntro(false);try{localStorage.setItem('forma-onboarded','true');}catch{}};

  const lightControls=(compact=false)=><div className={cn('light-controls',compact&&'compact')}>
    <div className="panel-eyebrow">SET THE MOOD</div><h3>A different kind of light.</h3><p>Watch the sunlight move, shadows stretch, and your space come to life.</p>
    <div className="sun-preview"><div className="sun-arc"/><span className="sun-dot" style={{left:`${10+design.time/24*80}%`,bottom:`${18+Math.sin(design.time/24*Math.PI)*38}px`}}><Sun size={25}/></span><span className="horizon"/></div>
    <div className="time-heading"><span>{timeName(design.time)}</span><strong>{formatTime(design.time)}</strong></div>
    <input aria-label="Time of day" className="time-range" type="range" min="0" max="23.75" step=".25" value={design.time} onPointerDown={checkpoint} onChange={e=>change(d=>({...d,time:+e.target.value}),false)}/>
    <div className="range-labels"><span><Moon size={12}/> 12 AM</span><span>12 PM</span><span>12 AM</span></div>
    <div className="time-presets">{[{t:8,label:'Morning',icon:Sun},{t:13,label:'Daylight',icon:Sun},{t:17.5,label:'Golden',icon:Sunset},{t:21,label:'Evening',icon:Moon}].map(({t,label,icon:I})=><button key={t} className={Math.abs(design.time-t)<2?'active':''} onClick={()=>change(d=>({...d,time:t}))}><I size={17}/>{label}</button>)}</div>
    <div className="note"><Sparkles size={16}/><span>Sunlight, shadows and material reflections update in real time.</span></div>
  </div>;

  return <div className="app-shell">
    <header className="app-header" ref={headerRef}>
      <Logo/>
      <div className="header-divider"/>
      <nav className="header-nav"><button className="nav-active" onClick={()=>{setSpaces(false);setPanel('furniture');}}>Design studio</button><button onClick={()=>setSpaces(true)}>My spaces <span className="tiny-badge">4</span></button></nav>
      <div className="project-name"><span className="project-dot"/><input aria-label="Project name" value={design.name} maxLength={80} onChange={e=>change(d=>({...d,name:e.target.value}),false)}/><span className="save-label"><Check size={13}/>{saveStatus==='saving'?'Saving…':saveStatus==='failed'?'Storage full':'Saved locally'}</span></div>
      <div className="header-actions"><div className="history-actions"><IconButton label="Undo (⌘ Z)" disabled={!past.length} onClick={undo}><Undo2 size={17}/></IconButton><IconButton label="Redo (⌘ ⇧ Z)" disabled={!future.length} onClick={redo}><Redo2 size={17}/></IconButton></div><button className="button export-button" aria-expanded={exportOpen} onClick={()=>setExportOpen(!exportOpen)}><Camera size={16}/><span>Export</span><ChevronDown size={13}/></button><button className="avatar" aria-label="Open your saved spaces" onClick={()=>setSpaces(true)}>Y</button></div>
      {exportOpen&&<div className="export-menu popover"><span className="menu-label">TAKE YOUR SPACE WITH YOU</span><button onClick={exportImage}><Camera size={17}/><span>Download a render<small>Capture the current view as PNG</small></span><ArrowDownToLine size={15}/></button><button onClick={exportDesign}><Download size={17}/><span>Save design file<small>Keep an editable copy of your space</small></span></button><button onClick={()=>uploadRef.current.click()}><Upload size={17}/><span>Import a design<small>Continue from a Forma JSON file</small></span></button></div>}
    </header>
    <input ref={uploadRef} type="file" accept=".json,application/json" hidden onChange={importDesign}/>
    <div className="workspace">
      <aside className="tool-rail" aria-label="Design tools">
        <div className="rail-top"><button className={cn('rail-button',panel==='furniture'&&'active')} onClick={()=>setPanel('furniture')} aria-label="Furniture catalog" title="Furniture catalog"><Armchair size={23}/><span>Furnish</span></button><button className={cn('rail-button',panel==='materials'&&'active')} onClick={()=>setPanel('materials')} aria-label="Edit wall and floor materials" title="Materials"><Paintbrush size={22}/><span>Materials</span></button><button className={cn('rail-button',panel==='lighting'&&'active')} onClick={()=>setPanel('lighting')} aria-label="Lighting and time of day" title="Lighting"><Sun size={23}/><span>Lighting</span></button><button className={cn('rail-button',panel==='layouts'&&'active')} onClick={()=>setPanel('layouts')} aria-label="Choose flat layout" title="Flat layouts"><LayoutDashboard size={22}/><span>Layouts</span></button></div>
        <div className="rail-bottom"><button className={cn('rail-button',favoritesOnly&&'active')} onClick={()=>{setFavoritesOnly(!favoritesOnly);setPanel('furniture');setCategory('all');}} title="Your favorites" aria-label="Show favorite items"><Heart size={21} fill={favoritesOnly?'currentColor':'none'}/><span>Favorites</span></button><div className="rail-separator"/><IconButton label="Help and keyboard shortcuts" onClick={()=>setHelp(true)}><CircleHelp size={21}/></IconButton><span className="version-label">v.01</span></div>
      </aside>

      <main className="design-stage">
        <div className="stage-heading"><div className="eyebrow">YOUR CANVAS, YOUR RULES</div><button className="layout-title" onClick={()=>setSpaces(true)}>{layout.name}<ChevronDown size={19}/></button><div className="layout-meta"><span>{layout.area} m²</span><span className="meta-dot"/><span>{layout.style}</span><span className="meta-dot"/><span className="free-tag">Free to create</span></div></div>
        <div className="stage-top-tools"><button className="lighting-chip" onClick={()=>setLightOpen(!lightOpen)} aria-expanded={lightOpen}>{design.time>19||design.time<6?<Moon size={16}/>:<Sun size={17}/>}<span>{formatTime(design.time)}</span><ChevronDown size={12}/></button><IconButton label="Expand studio fullscreen" className="stage-button" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>notify('Fullscreen is unavailable in this view.'));}}><Expand size={18}/></IconButton></div>
        <div ref={mountRef} className="scene-canvas" role="application" aria-label="Interactive 3D apartment. Drag furniture to move it. Use the catalog to add items. Scroll to zoom. Use the view controls for a floor plan or walkthrough."/>
        {(loading||renderError)&&<div className="scene-loading">{loading?<><LoaderCircle className="spin" size={30}/><h3>Making room for you…</h3></>:<><Box size={30}/><h3>The studio needs WebGL</h3><p>{renderError}</p><button className="button" onClick={()=>location.reload()}>Try again</button></>}</div>}
        {lightOpen&&<div className="lighting-popover popover"><IconButton className="popover-close" label="Close light controls" onClick={()=>setLightOpen(false)}><X size={16}/></IconButton>{lightControls(true)}</div>}
        <div className="canvas-tools"><IconButton label="Select tool (V)" active={mode==='select'} onClick={()=>setMode('select')}><MousePointer2 size={18}/></IconButton><IconButton label="Move tool (M)" active={mode==='move'} onClick={()=>setMode('move')}><Move size={18}/></IconButton><span className="tool-divider"/><IconButton label={grid?'Hide placement grid':'Show placement grid'} active={grid} onClick={()=>setGrid(!grid)}><Grid2X2 size={18}/></IconButton><IconButton label={snap?'Turn off grid snapping':'Snap to 10 cm grid'} active={snap} onClick={()=>setSnap(!snap)}><Maximize size={18}/></IconButton><span className="tool-divider"/><IconButton label={walls?'Hide walls':'Show walls'} active={walls} onClick={()=>setWalls(!walls)}><Layers3 size={18}/></IconButton></div>

        {intro&&!selected&&<div className="welcome-card"><button className="close-welcome" aria-label="Dismiss welcome" onClick={dismissIntro}><X size={14}/></button><span className="welcome-icon"><Sparkles size={19}/></span><div><strong>A space of your own.</strong><p>A little rearranging. A lot of possibility.<br/>Pick a piece and make yourself at home.</p><button onClick={()=>{dismissIntro();setHelp(true);}}>A quick look around <ArrowRight size={13}/></button></div></div>}

        {selected&&selectedDef&&<div className="inspector">
          <div className="inspector-header"><span className="selection-dot"/><div><strong>{selectedDef.name}</strong><span>{selectedDef.finish}</span></div><IconButton label="Deselect item" onClick={()=>setSelectedId(null)}><X size={15}/></IconButton></div>
          <div className="inspector-tabs"><button className={inspectorTab==='appearance'?'active':''} onClick={()=>setInspectorTab('appearance')}>Appearance</button><button className={inspectorTab==='position'?'active':''} onClick={()=>setInspectorTab('position')}>Position</button></div>
          {inspectorTab==='appearance'?<><div className="inspector-label">COLOR <label className="custom-color">Custom<input aria-label="Custom item color" type="color" value={selected.color} onChange={e=>updateItem(selectedId,{color:e.target.value})}/></label></div><div className="item-swatches">{SWATCHES.map(c=><button key={c} aria-label={`Color ${c}`} className={cn('swatch',c===selected.color&&'selected')} style={{background:c}} onClick={()=>updateItem(selectedId,{color:c})}>{c===selected.color&&<Check size={12}/>}</button>)}</div><div className="inspector-control"><span>Rotation</span><div className="stepper"><button aria-label="Rotate left 15 degrees" onClick={()=>updateItem(selectedId,{rotation:selected.rotation-Math.PI/12})}><RotateCcw size={14}/></button><span>{Math.round(selected.rotation*180/Math.PI)%360}°</span><button aria-label="Rotate right 15 degrees" onClick={()=>updateItem(selectedId,{rotation:selected.rotation+Math.PI/12})}><RotateCw size={14}/></button></div></div><div className="inspector-control"><span>Scale</span><div className="stepper"><button aria-label="Make item smaller" disabled={selected.scale<=.4} onClick={()=>updateItem(selectedId,{scale:Math.max(.4,+(selected.scale-.1).toFixed(1))})}><Minus size={14}/></button><span>{Math.round(selected.scale*100)}%</span><button aria-label="Make item larger" disabled={selected.scale>=2.5} onClick={()=>updateItem(selectedId,{scale:Math.min(2.5,+(selected.scale+.1).toFixed(1))})}><Plus size={14}/></button></div></div></>:<><div className="position-fields">{['x','y','z'].map((axis,i)=><label key={axis}><span>{['X · left / right','Y · elevation','Z · front / back'][i]}</span><div><input aria-label={`Item ${axis} position in meters`} type="number" min={axis==='y'?0:-10} max={axis==='y'?3:10} step=".05" value={Number(selected[axis].toFixed(2))} onChange={e=>{const n=+e.target.value;if(!Number.isFinite(n))return;const max=axis==='x'?layout.width/2-.1:axis==='z'?layout.depth/2-.1:3;updateItem(selectedId,{[axis]:Math.max(axis==='y'?0:-max,Math.min(max,n))});}}/><span>m</span></div></label>)}</div><p className="position-hint">Small objects snap to surfaces. Set elevation to reach a shelf, or drop them onto a table.</p></>}
          <div className="inspector-footer"><button onClick={duplicateSelected}><Copy size={14}/>Duplicate</button><button className="delete-action" onClick={removeSelected}><Trash2 size={14}/>Remove</button></div>
        </div>}

        <div className="zoom-controls"><IconButton label="Zoom in" onClick={()=>engineRef.current?.zoom(1)}><Plus size={17}/></IconButton><span/><IconButton label="Zoom out" onClick={()=>engineRef.current?.zoom(-1)}><Minus size={17}/></IconButton><span/><IconButton label="Reset camera" onClick={()=>engineRef.current?.resetCamera()}><Maximize size={16}/></IconButton></div>
        <div className="stage-bottom"><div className="scene-status"><span className="live-dot"/><span>Live render</span><span className="status-dot">·</span><span>{design.items.length} objects</span></div><div className="view-switcher"><button className={view==='orbit'?'active':''} onClick={()=>selectView('orbit')}><Box size={15}/><span>3D view</span></button><button className={view==='top'?'active':''} onClick={()=>selectView('top')}><LayoutDashboard size={15}/><span>Floor plan</span></button><button className={view==='walk'?'active':''} onClick={()=>selectView('walk')}><Footprints size={15}/><span>Walkthrough</span></button></div><button className="help-shortcut" onClick={()=>setHelp(true)}><CircleHelp size={15}/><span>Controls</span></button></div>
        <div className="canvas-caption">{view==='walk'?'W A S D to move · drag to look · ← → to turn':'Drag to orbit · scroll to zoom · right-click to pan'}</div>
      </main>

      <aside className="catalog-panel">
        <div className="catalog-heading"><div><span className="panel-eyebrow">THE FINISHING TOUCHES</span><h2>{panel==='furniture'?(favoritesOnly?'Your favorites':'Make it feel like you.') :panel==='materials'?'A beautiful foundation.':panel==='lighting'?'Let the light in.':'Find your kind of space.'}</h2></div><span className="catalog-heading-icon">{panel==='furniture'?<Armchair size={20}/>:panel==='materials'?<Paintbrush size={20}/>:panel==='lighting'?<Sun size={20}/>:<House size={20}/>}</span></div>
        {panel==='furniture'?<>
          <p className="catalog-intro">Considered pieces. Limitless combinations.</p>
          <div className="catalog-search"><Search size={17}/><input aria-label="Search furniture and objects" placeholder="Find something for your space…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Clear search" onClick={()=>setSearch('')}><X size={14}/></button>}<span>⌕</span></div>
          <div className="category-scroll">{CATEGORIES.map(c=><button key={c.id} className={category===c.id?'active':''} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</div>
          <div className="catalog-section-title"><span>{search?`Results for “${search}”`:favoritesOnly?'Saved for later':category==='all'?'Curated essentials':CATEGORIES.find(c=>c.id===category).name}<small>{filtered.length} items</small></span><button aria-label={favoritesOnly?'Show all items':'Show favorites'} className={cn('filter-button',favoritesOnly&&'active')} onClick={()=>setFavoritesOnly(!favoritesOnly)}><Heart size={15} fill={favoritesOnly?'currentColor':'none'}/></button></div>
          <div className="catalog-scroll"><div className="product-grid">{filtered.map(item=><div className="product-card" key={item.id}><button className="product-image" onClick={()=>addItem(item)} aria-label={`Add ${item.name} to your flat`}>{thumbs[item.id]?<img src={thumbs[item.id]} alt={item.name}/>:<Armchair size={35} className="placeholder-icon"/>}{item.tag&&<span className="product-tag">{item.tag}</span>}<span className="add-product"><Plus size={16}/></span></button><button className={cn('favorite-button',design.favoriteIds.includes(item.id)&&'is-favorite')} aria-label={`${design.favoriteIds.includes(item.id)?'Unfavorite':'Favorite'} ${item.name}`} onClick={e=>toggleFavorite(e,item.id)}><Heart size={13} fill={design.favoriteIds.includes(item.id)?'currentColor':'none'}/></button><button className="product-name" onClick={()=>addItem(item)}>{item.name}</button><span className="product-finish"><span style={{background:item.color}}/>{item.finish}</span></div>)}</div>{!filtered.length&&<div className="empty-catalog"><Search size={26}/><h3>A little more room to explore.</h3><p>{favoritesOnly?'Tap the heart on a piece to save it here.':'Try another name, material, or category.'}</p><button className="button" onClick={()=>{setSearch('');setCategory('all');setFavoritesOnly(false);}}>Explore all pieces</button></div>}</div>
          <div className="catalog-footer"><MousePointer2 size={17}/><span>Click a piece to add it. Drag to find its place.</span></div>
        </>:panel==='materials'?<div className="settings-scroll"><p className="settings-intro">The colors and textures that make a house feel like home.</p><div className="setting-section"><div className="section-label"><h3>Wall color</h3><span>All walls</span></div><div className="wall-swatches">{WALL_COLORS.map(c=><button key={c.color} className={design.wallColor===c.color?'selected':''} onClick={()=>change(d=>({...d,wallColor:c.color}))}><span style={{background:c.color}}>{design.wallColor===c.color&&<Check size={17}/>}</span><small>{c.name}</small></button>)}</div><label className="color-field"><span>Your own shade</span><span className="color-value">{design.wallColor}<input type="color" aria-label="Custom wall color" value={design.wallColor} onChange={e=>change(d=>({...d,wallColor:e.target.value}))}/></span></label></div><div className="setting-section"><div className="section-label"><h3>Under your feet</h3><span>Floor material</span></div><div className="floor-grid">{FLOOR_TYPES.map(f=><button className={design.floor===f.id?'selected':''} key={f.id} onClick={()=>change(d=>({...d,floor:f.id}))}><span className={`floor-sample ${f.type}`} style={{backgroundColor:f.color}}>{design.floor===f.id&&<Check size={17}/>}</span><strong>{f.name}</strong></button>)}</div></div><div className="setting-section"><div className="section-label"><h3>Bathroom tiles</h3><span>Glazed ceramic</span></div><div className="tile-swatches">{[{id:'sage',c:'#99a88c'},{id:'cream',c:'#d7cbb3'},{id:'terracotta',c:'#b78268'},{id:'charcoal',c:'#676b63'}].map(t=><button key={t.id} aria-label={`${t.id} bathroom tiles`} title={t.id} className={cn('tile-sample',design.bathTile===t.id&&'selected')} style={{backgroundColor:t.c}} onClick={()=>change(d=>({...d,bathTile:t.id}))}>{design.bathTile===t.id&&<Check size={18}/>}</button>)}</div>{!layout.partitions&&<p className="field-note">Bathroom tiles appear in the Parkside Flat and Skyline Penthouse.</p>}</div><div className="note"><Paintbrush size={17}/><span>Select any object to give it its own color, rotation and size.</span></div></div>:panel==='lighting'?<div className="settings-scroll">{lightControls()}<div className="setting-section"><div className="section-label"><h3>A little atmosphere</h3></div><p className="field-note">Place table lights, floor lamps and pendants from the catalog. Warm ambient lighting fills your flat after sunset.</p><button className="text-link" onClick={()=>{setPanel('furniture');setCategory('lighting');setSearch('');setFavoritesOnly(false);}}>Explore the lighting collection <ArrowRight size={14}/></button></div></div>:<div className="settings-scroll"><p className="settings-intro">Four different canvases. One very good imagination. Each space keeps its own design.</p><div className="layout-list">{LAYOUTS.map(l=><button key={l.id} className={cn('layout-card',l.id===design.layoutId&&'selected')} onClick={()=>selectLayout(l.id)}><div className="layout-plan-wrap"><Plan layout={l}/>{l.id===design.layoutId&&<span className="current-layout"><Check size={12}/>Your current space</span>}</div><div className="layout-card-bottom"><div><h3>{l.name}</h3><p>{l.area} m² <span>·</span> {l.rooms}</p></div>{l.id===design.layoutId?<span className="selected-circle"><Check size={15}/></span>:<ArrowRight size={19}/>}</div></button>)}</div></div>}
      </aside>
    </div>
    {toast&&<div className="toast" role="status"><span><Check size={14}/></span>{toast}</div>}
    {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}><IconButton label="Close help" className="modal-close" onClick={()=>setHelp(false)}><X size={20}/></IconButton><span className="modal-symbol"><House size={27}/></span><span className="panel-eyebrow">WELCOME TO YOUR STUDIO</span><h2 id="help-title">Make yourself at home.</h2><p>There’s no right way to make a space your own.<br/>Here are a few things to get you started.</p><div className="help-grid">{[{icon:Armchair,title:'Find your pieces',text:'Explore over 50 pieces. Click one to add it, then drag it anywhere in your flat.'},{icon:Move,title:'A little rearranging',text:'Select a piece to change its color, rotation and size. Small objects rest on tables and open shelves.'},{icon:Sun,title:'Chase the light',text:'Move the time slider from morning to night to see changing sunlight, reflections and shadows.'},{icon:Eye,title:'A new perspective',text:'Orbit with a drag, scroll to zoom, or step inside with Walkthrough. Use W A S D to move.'}].map(({icon:I,title,text})=><div key={title}><I size={22}/><h3>{title}</h3><p>{text}</p></div>)}</div><div className="shortcut-list"><span><kbd>R</kbd> Rotate</span><span><kbd>⌘ D</kbd> Duplicate</span><span><kbd>⌫</kbd> Remove</span><span><kbd>⌘ Z</kbd> Undo</span><span><kbd>Esc</kbd> Deselect</span></div><button className="button primary" onClick={()=>{setHelp(false);dismissIntro();}}>Let’s make room <ArrowRight size={16}/></button><span className="help-local">Your designs save automatically on this device. Export a file to keep a backup.</span></section></div>}
    {spaces&&<div className="modal-backdrop" onClick={()=>setSpaces(false)}><section className="spaces-modal" role="dialog" aria-modal="true" aria-labelledby="spaces-title" onClick={e=>e.stopPropagation()}><IconButton label="Close layouts" className="modal-close" onClick={()=>setSpaces(false)}><X size={20}/></IconButton><span className="panel-eyebrow">A NEW PERSPECTIVE</span><h2 id="spaces-title">Every great space starts somewhere.</h2><p>Pick your canvas. We’ll keep your designs safe as you explore.</p><div className="spaces-grid">{LAYOUTS.map(l=><button key={l.id} className={cn('space-card',l.id===design.layoutId&&'selected')} onClick={()=>selectLayout(l.id)}><div className="space-plan"><Plan layout={l} large/>{l.id===design.layoutId&&<span className="current-layout"><Check size={12}/>Currently designing</span>}</div><div><span className="space-meta">{l.area} m² <span>·</span> {l.rooms}</span><h3>{l.name}</h3><p>{l.subtitle}</p><span className="space-cta">{l.id===design.layoutId?'Back to your space':'Make it yours'}<ArrowRight size={16}/></span></div></button>)}</div><div className="spaces-note"><Check size={14}/> Each layout remembers your furniture, materials and lighting.</div></section></div>}
  </div>;
}

export default App;
