import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowRight, Armchair, Box, Camera, Check, ChevronDown, CircleHelp, Copy, Download, Expand, Eye, Footprints, Grid2X2, Hand, Heart, House, LockKeyhole, Layers3, LayoutDashboard, Lightbulb, LoaderCircle, Maximize, Minus, Moon, MousePointer2, Move, Paintbrush, Plus, Redo2, RotateCcw, RotateCw, Search, Settings2, Sparkles, Sun, Sunset, Trash2, Undo2, Upload, X } from 'lucide-react';
import { CATALOG, CATEGORIES, SWATCHES, WALL_COLORS, FLOOR_TYPES, LAYOUTS, makeItem, validateDesign, getLayout } from './catalog.js';
import { DesignScene } from './scene.js';
import PlanEditor,{PLAN_DRAFT_KEY} from './PlanEditor.jsx';
import PlanMap from './PlanMap.jsx';
import {draftFromLayout,layoutWallSegments,footprintOnFloor,wallItemPosition,OUTDOOR_SURFACES} from './floor-plans.js';
import CatalogThumbnail from './CatalogThumbnail.jsx';
import {acquireThumbnails} from './thumbnails.js';
import CategoryTabs from './CategoryTabs.jsx';
import {itemDefinition,fitWallDimensions} from './architecture.js';
import {FINISHES,PATTERNS} from './appearance.js';
import {HOBBIES} from './hobbies.js';
import {findPlacement,itemElevation} from './placement.js';
import {BATH_TILES,bathTileColor,isTileColor} from './tiles.js';
import {GRAPHICS_KEY,GRAPHICS_PRESETS,DEFAULT_GRAPHICS,loadGraphics} from './graphics.js';
import { createDemo, createBlankDesign, personalCopy, readLibrary, loadWorkspace, saveWorkspace, deleteSavedDesign, createCustomDesign } from './designs.js';

const readStorage=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
function loadDesign(){try{return loadWorkspace(localStorage);}catch{return createDemo('loft');}}
const formatTime=(time)=>`${String(Math.floor(time)%12||12).padStart(2,'0')}:${String(Math.round((time%1)*60)).padStart(2,'0')} ${time>=12?'PM':'AM'}`;
const timeName=t=>t<6||t>=20?'Moonlight':t<10?'Morning light':t<16?'Afternoon':t<19?'Golden hour':'Evening glow';
const cn=(...parts)=>parts.filter(Boolean).join(' ');

function Logo(){return <a className="brand" href="#" aria-label="Forma home" onClick={e=>e.preventDefault()}><svg width="31" height="35" viewBox="0 0 31 35" fill="none"><path d="M3 31V9L15 3l13 6v10l-13-6v18H3Z" fill="currentColor"/><path d="m16 15 12 5-12 7V15Z" fill="currentColor" opacity=".55"/></svg><span>forma<span className="brand-dot">.</span></span></a>;}
function IconButton({label,children,active,className='',...props}){return <button className={cn('icon-button',active&&'active',className)} aria-label={label} title={label} {...props}>{children}</button>;}
function Plan({layout,large=false,furnished=true}){
  if(layout.plan)return <PlanMap plan={layout.plan} large={large}/>;
  return <svg className={cn('plan',large&&'large')} viewBox="0 0 240 160" aria-hidden="true">
    <defs><pattern id={`grid-${layout.id}`} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#d7d5c7" strokeWidth=".4"/></pattern></defs>
    <rect x="28" y="19" width="184" height="122" fill={`url(#grid-${layout.id})`} stroke="#7c876e" strokeWidth="5"/>
    <path d="M68 19h70M212 55v44" stroke="#c1d2c2" strokeWidth="6"/>
    {layout.partitions&&<path d="M144 20v45m0 25v51m0-61h68" stroke="#7c876e" strokeWidth="4"/>}
    {furnished&&<>{layout.partitions?<><rect x="159" y="30" width="38" height="37" rx="3" fill="#c9c1a6"/><path d="M160 40h36" stroke="#f2eee0" strokeWidth="4"/><ellipse cx="184" cy="121" rx="18" ry="8" fill="#d9dfd0"/><rect x="156" y="91" width="12" height="16" rx="3" fill="#d9dfd0"/></>:<><rect x="160" y="25" width="41" height="14" rx="2" fill="#c9c1a6"/><rect x="163" y="51" width="32" height="13" rx="2" fill="#c9c1a6"/></>}
      <rect x="51" y="54" width="62" height="53" rx="2" fill="#e5deca"/><rect x="49" y="48" width="64" height="21" rx="5" fill="#929b7b"/><rect x="49" y="49" width="7" height="22" rx="3" fill="#7e886b"/><rect x="107" y="49" width="7" height="22" rx="3" fill="#7e886b"/><ellipse cx="82" cy="86" rx="18" ry="10" fill="#b09a72"/><circle cx="40" cy="31" r="8" fill="#a8b38e"/>
    </>}
    <path d="M85 141h28" stroke="#f5f3e9" strokeWidth="6"/><path d="M85 141v-23a24 24 0 0 1 24 23" stroke="#aaa995" strokeWidth="1" fill="none"/>
  </svg>;
}

function GraphicsPanel({settings,onChange}){
  const edit=values=>onChange(current=>({...current,...values,preset:'custom'}));
  return <div className="settings-scroll graphics-panel"><p className="settings-intro">Keep the original look, or trade visual detail for smoother play. These settings stay on this device.</p>
    <div className="graphics-presets">{Object.entries(GRAPHICS_PRESETS).map(([id,p])=><button key={id} className={settings.preset===id?'selected':''} onClick={()=>onChange({...p,preset:id})}><strong>{p.label}{id==='original'&&<span>Default look</span>}</strong><small>{p.description}</small>{settings.preset===id&&<Check size={15}/>}</button>)}</div>
    <div className="setting-section"><div className="section-label"><h3>Fine-tune the visuals</h3></div>
      <label className="graphics-field">Render resolution<select aria-label="Render resolution" value={settings.pixelRatio} onChange={e=>edit({pixelRatio:+e.target.value})}>{[.5,.75,1,1.25,1.5,1.75,2].map(n=><option key={n} value={n}>{Math.round(n*100)}%{n===1.75?' · original':''}</option>)}</select></label>
      <label className="graphics-field">Anti-aliasing<select aria-label="Anti-aliasing" value={settings.antialias} onChange={e=>edit({antialias:e.target.value})}><option value="off">Off</option><option value="fxaa">Fast · FXAA</option><option value="smaa">High · SMAA</option></select></label>
      <label className="graphics-field">Shadow detail<select aria-label="Shadow detail" value={settings.shadows} onChange={e=>edit({shadows:+e.target.value})}>{[[0,'Off'],[512,'Low'],[1024,'Medium'],[2048,'Original'],[4096,'Ultra']].map(([n,label])=><option key={n} value={n}>{label}</option>)}</select></label>
      <label className="graphics-field graphics-toggle">Contact shading<input aria-label="Contact shading" type="checkbox" checked={settings.ao} onChange={e=>edit({ao:e.target.checked})}/></label>
      <label className="graphics-field">Shading quality<select aria-label="Shading quality" disabled={!settings.ao} value={settings.aoSamples} onChange={e=>edit({aoSamples:+e.target.value})}>{[[4,'Low'],[6,'Balanced'],[8,'Medium'],[12,'Original'],[16,'Ultra']].map(([n,label])=><option key={n} value={n}>{label}</option>)}</select></label>
      <label className="graphics-field">Frame-rate limit<select aria-label="Frame-rate limit" value={settings.fps} onChange={e=>edit({fps:+e.target.value})}><option value={30}>30 FPS</option><option value={60}>60 FPS</option></select></label>
      <p className="field-note">Lower resolution, shadows and contact shading reduce GPU use. 100% resolution renders one pixel per screen pixel, capped by your display.</p>
    </div><button className="button graphics-reset" onClick={()=>onChange({...DEFAULT_GRAPHICS})}><RotateCcw size={14}/>Restore original visuals</button>
    <div className="note"><Sparkles size={16}/><span>The renderer rests when nothing changes and pauses drawing in hidden tabs. Your furniture and materials stay the same.</span></div>
  </div>;
}

function WallDimensions({item,definition,onChange}){
  const dimensions=item.dimensions||definition.size;
  return <div className="wall-dimensions">{['Length','Height','Thickness'].map((label,index)=><label key={label}>{label}<span><input aria-label={`Wall ${label.toLowerCase()} in meters`} type="number" min={[.5,.4,.06][index]} max={[8,3.1,.4][index]} step={index===2?.01:.1} value={dimensions[index]} onChange={event=>{const value=+event.target.value;if(!Number.isFinite(value))return;onChange(dimensions.map((n,i)=>i===index?Math.max([.5,.4,.06][i],Math.min([8,3.1,.4][i],value)):n));}}/>m</span></label>)}</div>;
}

function TileColorPicker({value,onChange,onCheckpoint}){
  const [draft,setDraft]=useState(value);useEffect(()=>setDraft(value),[value]);
  const edit=color=>{setDraft(color);if(isTileColor(color))onChange(color);};
  return <div className="color-field"><span>Custom tile color</span><span className="color-value"><input className="tile-hex" aria-label="Bathroom tile hex color" type="text" maxLength={7} spellCheck={false} value={draft} aria-invalid={!isTileColor(draft)} onFocus={onCheckpoint} onChange={e=>edit(e.target.value)}/><input type="color" aria-label="Custom bathroom tile color" value={value} onPointerDown={onCheckpoint} onInput={e=>edit(e.target.value)} onChange={e=>edit(e.target.value)}/></span></div>;
}

function ConfirmDesignDelete({design,onCancel,onConfirm}){
  const cancelRef=useRef(null),confirmRef=useRef(null);
  useEffect(()=>{const previous=document.activeElement;cancelRef.current?.focus();return()=>previous?.focus?.();},[]);
  return <div className="modal-backdrop delete-backdrop" onClick={onCancel}><section className="delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onCancel();}if(e.key==='Tab'){e.preventDefault();(document.activeElement===cancelRef.current?confirmRef:cancelRef).current?.focus();}}}>
    <Trash2 size={26}/><h2 id="delete-title">Delete this design?</h2><p id="delete-description">“{design.name}” will be removed from this device. This cannot be undone. Export a design file first if you want to keep a copy.</p>
    <div className="delete-modal-actions"><button ref={cancelRef} className="button" onClick={onCancel}>Keep design</button><button ref={confirmRef} className="button danger-button" onClick={onConfirm}>Delete design</button></div>
  </section></div>;
}

function App(){
  const [design,setDesign]=useState(loadDesign),designRef=useRef(design);
  designRef.current=design;
  const [panel,setPanel]=useState('furniture'),[category,setCategory]=useState('all'),[search,setSearch]=useState(''),[favoritesOnly,setFavoritesOnly]=useState(false);
  const [shapeEditor,setShapeEditor]=useState(null),[wallSelection,setWallSelection]=useState(null);
  const [selection,setSelection]=useState({uid:null,focus:false}),selectedId=selection.uid;
  const [view,setView]=useState('orbit'),[mode,setMode]=useState('navigate'),[grid,setGrid]=useState(false),[snap,setSnap]=useState(true),[walls,setWalls]=useState(true);
  const selectItem=useCallback((uid,focus=true)=>{setWallSelection(null);setSelection({uid,focus});setMode(current=>current==='move'?'move':uid?'select':'navigate');},[]);
  const [loading,setLoading]=useState(true),[renderError,setRenderError]=useState(''),[toast,setToast]=useState(''),[saveStatus,setSaveStatus]=useState('saved');
  const [rendererVersion,setRendererVersion]=useState(0);
  const [deleteTarget,setDeleteTarget]=useState(null),[catalogDrag,setCatalogDrag]=useState(null),catalogDragRef=useRef(null);
  const [help,setHelp]=useState(false),[spaces,setSpaces]=useState(false),[exportOpen,setExportOpen]=useState(false),[lightOpen,setLightOpen]=useState(false),[intro,setIntro]=useState(!readStorage('forma-onboarded',false));
  const [past,setPast]=useState([]),[future,setFuture]=useState([]),[inspectorTab,setInspectorTab]=useState('appearance');
  const [lookState,setLookState]=useState('paused'),[spacesTab,setSpacesTab]=useState('saved');
  const [selectedPart,setSelectedPart]=useState('body'),[hobby,setHobby]=useState('');
  const [partOptions,setPartOptions]=useState([]);
  const [graphics,setGraphics]=useState(()=>{try{return loadGraphics(localStorage);}catch{return DEFAULT_GRAPHICS;}});
  const initialGraphics=useRef(graphics);
  initialGraphics.current=graphics;
  const [newLayout,setNewLayout]=useState('loft'),[newName,setNewName]=useState('');
  const [savedDesigns,setSavedDesigns]=useState(()=>{try{return readLibrary(localStorage).designs;}catch{return [];}});
  const mountRef=useRef(null),engineRef=useRef(null),toastTimer=useRef(null),uploadRef=useRef(null),headerRef=useRef(null),dragImageRef=useRef(null);
  const layout=getLayout(design),selected=design.items.find(i=>i.uid===selectedId),selectedDef=selected&&CATALOG.find(i=>i.id===selected.catalogId);
  const appearanceParts=partOptions;
  const activePart=appearanceParts.find(p=>p.id===selectedPart)||appearanceParts[0];
  const partColor=selected?.appearance?.[activePart?.id]?.color||activePart?.color||selected?.color;
  const structuralWall=wallSelection?layoutWallSegments(layout).find(w=>w.id===wallSelection.uid):null;
  const notify=useCallback(text=>{setToast(text);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),3400);},[]);
  const change=useCallback((fn,history=true)=>{
    const current=designRef.current;let next=typeof fn==='function'?fn(current):fn;
    if(current.kind==='demo')next=personalCopy(next);
    if(history){setPast(p=>[...p.slice(-39),current]);setFuture([]);}
    designRef.current=next;setDesign(next);
  },[]);
  const checkpoint=useCallback(()=>{setPast(p=>[...p.slice(-39),designRef.current]);setFuture([]);},[]);
  const updateItem=useCallback((uid,values,history=true)=>change(d=>({...d,items:d.items.map(i=>{
    if(i.uid!==uid)return i;
    const next={...i,...values},base=CATALOG.find(c=>c.id===next.catalogId),l=getLayout(d);
    if(base.architecture)next.dimensions=fitWallDimensions(next.dimensions||base.size,next,l);
    const def=itemDefinition(base,next);
    const co=Math.abs(Math.cos(next.rotation)),si=Math.abs(Math.sin(next.rotation));
    const halfX=(def.size[0]*co+def.size[2]*si)*next.scale/2,halfZ=(def.size[0]*si+def.size[2]*co)*next.scale/2;
    next.x=Math.max(-l.width/2+halfX+.08,Math.min(l.width/2-halfX-.08,next.x));
    next.z=Math.max(-l.depth/2+halfZ+.08,Math.min(l.depth/2-halfZ-.08,next.z));
    next.y=Math.max(0,Math.min(3,next.y));
    if(l.plan&&!footprintOnFloor(l,def,next,base.wall?0:.025))return {...next,x:i.x,y:i.y,z:i.z,rotation:i.rotation,scale:i.scale,...(i.dimensions?{dimensions:i.dimensions}:{})};
    return next;
  })}),history),[change]);
  const undo=useCallback(()=>{setPast(p=>{if(!p.length)return p;const previous=p[p.length-1];setFuture(f=>[designRef.current,...f]);designRef.current=previous;setDesign(previous);return p.slice(0,-1);});},[]);
  const redo=useCallback(()=>{setFuture(f=>{if(!f.length)return f;const next=f[0];setPast(p=>[...p,designRef.current]);designRef.current=next;setDesign(next);return f.slice(1);});},[]);
  useEffect(()=>acquireThumbnails(),[]);
  useEffect(()=>{
    let engine;
    try{
      engine=new DesignScene(mountRef.current,{
        onSelect:selectItem,onWallSelect:(uid,side)=>setWallSelection(uid?{uid,side}:null),onWalkNotice:notify,onMove:(uid,pos)=>updateItem(uid,pos,false),onDragStart:checkpoint,
        onRenderStatus:status=>{setLoading(false);setRenderError(status==='ready'?'':'Your device interrupted the 3D view. Your design is safe. Restore the view or choose lighter graphics settings.');},
        onPhysics:(uid,pos)=>{if(designRef.current.kind!=='demo'&&designRef.current.items.some(i=>i.uid===uid))updateItem(uid,pos,false);},onView:setView,onLookState:setLookState,onPartSelect:setSelectedPart,
      },initialGraphics.current);
      engineRef.current=engine;engine.setDesign(designRef.current);engine.setGrid(grid);engine.setSnap(snap);engine.setWalls(walls);engine.setMode(mode);setLoading(false);
      return ()=>{engineRef.current=null;engine.dispose();clearTimeout(toastTimer.current);};
    }catch(e){engine?.dispose();engineRef.current=null;console.error(e);setRenderError('Your browser could not start the 3D renderer. Enable hardware acceleration, then restore the view to try again.');setLoading(false);}
  },[updateItem,checkpoint,selectItem,rendererVersion]);
  useEffect(()=>{setSaveStatus('saving');const timer=setTimeout(()=>{
    try{setSavedDesigns(saveWorkspace(localStorage,design).designs);setSaveStatus('saved');}catch{setSaveStatus('failed');}
  },650);return()=>clearTimeout(timer);},[design]);
  useLayoutEffect(()=>{engineRef.current?.setDesign(design);engineRef.current?.select(selectedId,selection.focus);engineRef.current?.selectWall(wallSelection?.uid);},[design,selection,wallSelection]);
  useEffect(()=>{engineRef.current?.setInputBlocked(help||spaces||intro||!!deleteTarget||!!shapeEditor);},[help,spaces,intro,deleteTarget,shapeEditor,rendererVersion]);
  useEffect(()=>{if(selectedId&&!selected)selectItem(null);},[selectedId,selected,selectItem]);
  useEffect(()=>{setPartOptions(engineRef.current?.getAppearanceParts(selectedId)||[]);},[selectedId,design]);
  useEffect(()=>{engineRef.current?.setMode(mode);},[mode]);
  useEffect(()=>{engineRef.current?.setGrid(grid);},[grid]);
  useEffect(()=>{engineRef.current?.setSnap(snap);},[snap]);
  useEffect(()=>{engineRef.current?.setWalls(walls);},[walls]);
  useEffect(()=>{engineRef.current?.applyGraphics(graphics);try{localStorage.setItem(GRAPHICS_KEY,JSON.stringify(graphics));}catch{}},[graphics]);
  const removeSelected=useCallback(()=>{if(!selectedId)return;change(d=>({...d,items:d.items.filter(i=>i.uid!==selectedId)}));selectItem(null);notify('Item removed from your space');},[selectedId,change,notify]);
  const duplicateSelected=useCallback(()=>{
    if(designRef.current.items.length>=400){notify('This space has reached its 400-item limit.');return;}
    const i=designRef.current.items.find(i=>i.uid===selectedId);if(!i)return;const def=itemDefinition(CATALOG.find(c=>c.id===i.catalogId),i);const l=getLayout(designRef.current);
    let x=Math.min(l.width/2-def.size[0]*i.scale/2-.1,i.x+.4),z=Math.min(l.depth/2-def.size[2]*i.scale/2-.1,i.z+.4);
    if(l.plan&&!footprintOnFloor(l,def,{...i,x,z})){const c=Math.abs(Math.cos(i.rotation)),s=Math.abs(Math.sin(i.rotation)),p=findPlacement({...def,size:[(def.size[0]*c+def.size[2]*s)*i.scale,def.size[1]*i.scale,(def.size[0]*s+def.size[2]*c)*i.scale]},designRef.current);if(!p){notify('There is no clear floor space for a duplicate.');return;}({x,z}=p);}
    const clone=makeItem(i.catalogId,x,z,i.rotation,i.y,{color:i.color,scale:i.scale,appearance:structuredClone(i.appearance||{}),...(i.dimensions?{dimensions:[...i.dimensions]}:{}),...(i.pattern?{pattern:i.pattern}:{})});change(d=>({...d,items:[...d.items,clone]}));selectItem(clone.uid);notify('A little more of a good thing. Item duplicated.');
  },[selectedId,change,notify]);
  useEffect(()=>{const handler=e=>{
    if(shapeEditor)return;
    if(e.key==='Escape'){
      if(deleteTarget){setDeleteTarget(null);return;}
      if(help||spaces||intro){setHelp(false);setSpaces(false);setIntro(false);return;}
      engineRef.current?.cancelCatalogDrag();catalogDragRef.current=null;setCatalogDrag(null);engineRef.current?.releaseMouse();selectItem(null);setExportOpen(false);setLightOpen(false);return;
    }
    if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||deleteTarget||help||spaces||intro)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicateSelected();}
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected();}
    if(e.key.toLowerCase()==='r'&&selectedId)updateItem(selectedId,{rotation:(selected?.rotation||0)+Math.PI/12});
    if(e.key.toLowerCase()==='h'){selectItem(null);setMode('navigate');}if(e.key.toLowerCase()==='v')setMode('select');if(e.key.toLowerCase()==='m')setMode('move');
  };window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[undo,redo,duplicateSelected,removeSelected,selectedId,selected?.rotation,updateItem,deleteTarget,help,spaces,intro,shapeEditor]);
  useEffect(()=>{if(!exportOpen)return;const handler=e=>{if(!headerRef.current?.contains(e.target))setExportOpen(false);};document.addEventListener('pointerdown',handler);return()=>document.removeEventListener('pointerdown',handler);},[exportOpen]);

  const addItem=(def,dropPosition)=>{
    if(design.items.length>=400){notify('This space has reached its 400-item limit.');return;}
    const l=getLayout(design),position=dropPosition||(def.wall&&l.plan?wallItemPosition(l,def):findPlacement(def,design));
    if(l.plan&&!position){notify(def.wall?'Choose a layout with a solid wall long enough for this piece.':'There is no clear floor space for this piece. Try a smaller item or move existing furniture.');return;}
    let x=position?.x||0,z=position?.z||0;
    // Wall pieces begin at a useful height against the rear wall.
    if(def.wall&&!dropPosition&&!l.plan){x=0;z=-l.depth/2+def.size[2]/2+.11;}
    const item=makeItem(def.id,x,z,position?.rotation||0,dropPosition?.y??itemElevation(def));
    change(d=>({...d,items:[...d.items,item]}));selectItem(item.uid,!dropPosition);setMode('move');setInspectorTab('appearance');
    notify(`${def.name} added. Drag it to make it yours.`);
  };
  const endCatalogDrag=()=>{engineRef.current?.cancelCatalogDrag();catalogDragRef.current=null;setCatalogDrag(null);};
  const startCatalogDrag=(event,def)=>{
    if(renderError||loading){event.preventDefault();return;}
    if(view==='walk'){engineRef.current?.releaseMouse();engineRef.current?.setView('orbit');setView('orbit');}
    event.dataTransfer.effectAllowed='copy';event.dataTransfer.setData('application/x-forma-item',def.id);
    // The scene supplies the 3D preview; suppress the browser's card snapshot.
    event.dataTransfer.setDragImage(dragImageRef.current,0,0);
    catalogDragRef.current=def;engineRef.current?.beginCatalogDrag(def);setCatalogDrag({name:def.name,valid:false});
  };
  const overCatalogDrop=event=>{
    if(!catalogDragRef.current)return;event.preventDefault();const position=engineRef.current?.updateCatalogDrag(event.nativeEvent);
    event.dataTransfer.dropEffect=position?.valid?'copy':'none';setCatalogDrag(current=>current?.valid===!!position?.valid?current:{name:catalogDragRef.current.name,valid:!!position?.valid});
  };
  const dropCatalogItem=event=>{
    event.preventDefault();const def=catalogDragRef.current,position=engineRef.current?.updateCatalogDrag(event.nativeEvent);endCatalogDrag();
    if(def&&position?.valid)addItem(def,position);else if(def)notify('Choose a clear place inside the flat to drop this piece.');
  };
  const confirmDelete=()=>{
    if(!deleteTarget)return;
    try{
      const library=deleteSavedDesign(localStorage,deleteTarget.designId);setSavedDesigns(library.designs);
      if(designRef.current.designId===deleteTarget.designId){const next=loadWorkspace(localStorage);designRef.current=next;setDesign(next);setPast([]);setFuture([]);selectItem(null);engineRef.current?.setView('orbit');setView('orbit');}
      setDeleteTarget(null);notify('Design deleted from this device.');
    }catch{notify('The design could not be deleted. Please try again.');}
  };
  const toggleFavorite=(e,id)=>{e.stopPropagation();change(d=>({...d,favoriteIds:d.favoriteIds.includes(id)?d.favoriteIds.filter(i=>i!==id):[...d.favoriteIds,id]}),false);};
  const filtered=useMemo(()=>CATALOG.filter(i=>(category==='all'||i.category===category)&&(category!=='hobbies'||!hobby||i.hobby===hobby)&&(!favoritesOnly||design.favoriteIds.includes(i.id))&&`${i.name} ${i.finish} ${i.category}`.toLowerCase().includes(search.toLowerCase())),[category,hobby,search,favoritesOnly,design.favoriteIds]);
  const selectView=v=>{setView(v);engineRef.current?.setView(v);if(v==='walk'){selectItem(null);setLightOpen(false);setExportOpen(false);engineRef.current?.captureMouse();}};
  const openSpaces=(tab='saved',layoutId=design.layoutId)=>{engineRef.current?.releaseMouse();setSpacesTab(tab);setNewLayout(LAYOUTS.some(l=>l.id===layoutId)?layoutId:LAYOUTS[0].id);setNewName('');setSpaces(true);};
  const activateDesign=next=>{
    engineRef.current?.releaseMouse();
    try{saveWorkspace(localStorage,designRef.current);setSavedDesigns(saveWorkspace(localStorage,next).designs);}catch{notify('Browser storage is full. Export your current design to keep a backup.');return false;}
    designRef.current=next;setDesign(next);setPast([]);setFuture([]);selectItem(null);setSpaces(false);setIntro(false);
    engineRef.current?.setView('orbit');setView('orbit');
    return true;
  };
  const openShape=source=>{
    engineRef.current?.releaseMouse();setSpaces(false);setShapeEditor({seed:source?draftFromLayout(source):null});
  };
  const finishShape=draft=>{const next=createCustomDesign(draft,draft.name);if(!activateDesign(next))return false;setShapeEditor(null);setPanel('furniture');notify('Layout confirmed. Its shape is fixed; make it yours with furniture and finishes.');return true;};
  const editWall=(values,history=true)=>change(d=>({...d,wallFinishes:{...d.wallFinishes,[wallSelection.uid]:{...d.wallFinishes?.[wallSelection.uid],...values}}}),history);
  const paintAllWalls=color=>change(d=>({...d,wallColor:color,wallFinishes:Object.fromEntries(Object.entries(d.wallFinishes||{}).map(([id,finish])=>[id,{...finish,a:color,b:color}]))}));
  const selectLayout=id=>{if(activateDesign({...createDemo(id),favoriteIds:design.favoriteIds}))notify('Demo opened. Your changes will save as a personal copy.');};
  const startBlank=()=>{if(activateDesign({...createBlankDesign(newLayout,newName),favoriteIds:design.favoriteIds}))notify('An empty canvas. Make yourself at home.');};
  const download=(content,name,type)=>{const url=typeof content==='string'&&content.startsWith('data:')?content:URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();if(!url.startsWith('data:'))setTimeout(()=>URL.revokeObjectURL(url),2000);};
  const exportImage=async()=>{if(!engineRef.current)return;const image=await engineRef.current.snapshot();if(!image){notify('Restore the 3D view before exporting an image.');return;}download(image,`forma-${design.layoutId}.png`);setExportOpen(false);notify('Your space, captured. Image downloaded.');};
  const exportDesign=()=>{download(JSON.stringify(design,null,2),`forma-${design.layoutId}.json`,'application/json');setExportOpen(false);notify('Design downloaded. Bring it back any time.');};
  const importDesign=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2e6)throw new Error('Please choose a design smaller than 2 MB.');const imported=personalCopy(validateDesign(JSON.parse(await file.text())));activateDesign(imported);notify('Welcome back. Your design is ready.');}catch(err){notify(err instanceof SyntaxError?'That file could not be read. Choose a Forma JSON design.':err.message);}e.target.value='';setExportOpen(false);};
  const dismissIntro=()=>{setIntro(false);try{localStorage.setItem('forma-onboarded','true');}catch{}};

  const lightControls=(compact=false)=><div className={cn('light-controls',compact&&'compact')}>
    <div className="panel-eyebrow">SET THE MOOD</div><h3>A different kind of light.</h3><p>Watch the sunlight move, shadows stretch, and your space come to life.</p>
    <div className="sun-preview"><div className="sun-arc"/><span className="sun-dot" style={{left:`${10+design.time/24*80}%`,bottom:`${18+Math.sin(design.time/24*Math.PI)*38}px`}}>{design.time<6||design.time>=18?<Moon size={25}/>:<Sun size={25}/>}</span><span className="horizon"/></div>
    <div className="time-heading"><span>{timeName(design.time)}</span><strong>{formatTime(design.time)}</strong></div>
    <input aria-label="Time of day" className="time-range" type="range" min="0" max="23.75" step=".25" value={design.time} onPointerDown={checkpoint} onChange={e=>change(d=>({...d,time:+e.target.value}),false)}/>
    <div className="range-labels"><span><Moon size={12}/> 12 AM</span><span>12 PM</span><span>12 AM</span></div>
    <div className="time-presets">{[{t:8,label:'Morning',icon:Sun},{t:13,label:'Daylight',icon:Sun},{t:17.5,label:'Golden',icon:Sunset},{t:21,label:'Evening',icon:Moon}].map(({t,label,icon:I})=><button key={t} className={Math.abs(design.time-t)<2?'active':''} onClick={()=>change(d=>({...d,time:t}))}><I size={17}/>{label}</button>)}</div>
    <div className="note"><Sparkles size={16}/><span>Switch the interior lights off to see sunlight or directional moonlight through the windows.</span></div>
  </div>;

  return <div className="app-shell">
    <canvas ref={dragImageRef} className="catalog-native-drag-image" width={1} height={1} aria-hidden="true"/>
    <header className="app-header" ref={headerRef}>
      <Logo/>
      <div className="header-divider"/>
      <nav className="header-nav"><button className="nav-active" onClick={()=>{setSpaces(false);setPanel('furniture');}}>Design studio</button><button onClick={()=>openSpaces()}>My spaces <span className="tiny-badge">{savedDesigns.length}</span></button></nav>
      <div className="project-name"><span className="project-dot"/><input aria-label="Project name" value={design.name} maxLength={80} onChange={e=>change(d=>({...d,name:e.target.value}),false)}/><span className="save-label"><Check size={13}/>{saveStatus==='saving'?'Saving…':saveStatus==='failed'?'Storage full':'Saved locally'}</span></div>
      <div className="header-actions"><button className="button new-design-button" onClick={()=>openSpaces('new')}><Plus size={15}/><span>New design</span></button><div className="history-actions"><IconButton label="Undo (⌘ Z)" disabled={!past.length} onClick={undo}><Undo2 size={17}/></IconButton><IconButton label="Redo (⌘ ⇧ Z)" disabled={!future.length} onClick={redo}><Redo2 size={17}/></IconButton></div><button className="button export-button" aria-expanded={exportOpen} onClick={()=>setExportOpen(!exportOpen)}><Camera size={16}/><span>Export</span><ChevronDown size={13}/></button><button className="avatar" aria-label="Open your saved spaces" onClick={()=>openSpaces()}>Y</button></div>
      {exportOpen&&<div className="export-menu popover"><span className="menu-label">TAKE YOUR SPACE WITH YOU</span><button onClick={exportImage}><Camera size={17}/><span>Download a render<small>Capture the current view as PNG</small></span><ArrowDownToLine size={15}/></button><button onClick={exportDesign}><Download size={17}/><span>Save design file<small>Keep an editable copy of your space</small></span></button><button onClick={()=>uploadRef.current.click()}><Upload size={17}/><span>Import a design<small>Continue from a Forma JSON file</small></span></button></div>}
    </header>
    <input ref={uploadRef} type="file" accept=".json,application/json" hidden onChange={importDesign}/>
    <div className="workspace">
      <aside className="tool-rail" aria-label="Design tools">
        <div className="rail-top"><button className={cn('rail-button',panel==='furniture'&&'active')} onClick={()=>setPanel('furniture')} aria-label="Furniture catalog" title="Furniture catalog"><Armchair size={23}/><span>Furnish</span></button><button className={cn('rail-button',panel==='materials'&&'active')} onClick={()=>setPanel('materials')} aria-label="Edit wall and floor materials" title="Materials"><Paintbrush size={22}/><span>Materials</span></button><button className={cn('rail-button',panel==='lighting'&&'active')} onClick={()=>setPanel('lighting')} aria-label="Lighting and time of day" title="Lighting"><Sun size={23}/><span>Lighting</span></button><button className={cn('rail-button',panel==='layouts'&&'active')} onClick={()=>setPanel('layouts')} aria-label="Choose flat layout" title="Flat layouts"><LayoutDashboard size={22}/><span>Layouts</span></button></div>
        <div className="rail-bottom"><button className={cn('rail-button',favoritesOnly&&'active')} onClick={()=>{setFavoritesOnly(!favoritesOnly);setPanel('furniture');setCategory('all');}} title="Your favorites" aria-label="Show favorite items"><Heart size={21} fill={favoritesOnly?'currentColor':'none'}/><span>Favorites</span></button><div className="rail-separator"/><IconButton label="Help and keyboard shortcuts" onClick={()=>setHelp(true)}><CircleHelp size={21}/></IconButton><IconButton label="Graphics settings" active={panel==='settings'} onClick={()=>setPanel('settings')}><Settings2 size={21}/></IconButton><span className="version-label">v.02</span></div>
      </aside>

      <main className={cn('design-stage',(design.time<6||design.time>=18)&&'night-stage')}>
        <div className="stage-heading"><div className="eyebrow">YOUR CANVAS, YOUR RULES</div><button className="layout-title" onClick={()=>openSpaces()}>{layout.name}<ChevronDown size={19}/></button><div className="layout-meta"><span>{layout.area} m²</span><span className="meta-dot"/><span>{layout.style}</span><span className="meta-dot"/><span className="free-tag">{design.kind==='demo'?'Demo home':'Your design'}</span><span className="fixed-layout-label" title="Copy this shape to create a new editable draft"><LockKeyhole size={10}/>Fixed layout</span></div></div>
        <div className="stage-top-tools"><button className="light-switch" role="switch" aria-checked={design.lightsOn!==false} aria-label="Light switch" onClick={()=>change(d=>({...d,lightsOn:d.lightsOn===false}))}><Lightbulb size={16}/><span>Light switch</span><strong>{design.lightsOn===false?'Off':'On'}</strong></button><button className="lighting-chip" onClick={()=>setLightOpen(!lightOpen)} aria-expanded={lightOpen}>{design.time>19||design.time<6?<Moon size={16}/>:<Sun size={17}/>}<span>{formatTime(design.time)}</span><ChevronDown size={12}/></button><IconButton label="Expand studio fullscreen" className="stage-button" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>notify('Fullscreen is unavailable in this view.'));}}><Expand size={18}/></IconButton></div>
        <div ref={mountRef} onDragOver={overCatalogDrop} onDrop={dropCatalogItem} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget)){engineRef.current?.hideCatalogPreview();setCatalogDrag(current=>current?{...current,valid:false}:null);}}} className="scene-canvas" role="application" aria-label="Interactive 3D apartment. Drag to orbit the view. WASD pans the 3D view. Select an item to focus it; Escape restores your view. Use Move to reposition it. Drag catalog pieces into the flat, or click to add. Scroll to zoom. Use the view controls for a floor plan or walkthrough."/>
        {(loading||renderError)&&<div className={cn('scene-loading',renderError&&'render-interrupted')}>{loading?<><LoaderCircle className="spin" size={30}/><h3>Making room for you…</h3></>:<><Box size={30}/><h3>The 3D view needs a fresh start</h3><p>{renderError}</p><button className="button" onClick={()=>{selectItem(null);setView('orbit');setRenderError('');setLoading(true);setRendererVersion(value=>value+1);}}>Restore 3D view</button></>}</div>}
        {lightOpen&&<div className="lighting-popover popover"><IconButton className="popover-close" label="Close light controls" onClick={()=>setLightOpen(false)}><X size={16}/></IconButton>{lightControls(true)}</div>}
        {view==='walk'&&<>
          {['locked','soft'].includes(lookState)?<div className="walk-crosshair" aria-hidden="true"/>:<div className="walk-start"><Footprints size={21}/><strong>{lookState==='fallback'?'Explore at your own pace':'Step inside your space'}</strong><p>{lookState==='fallback'?'Move the mouse over the room to look around. W A S D to walk, Esc to pause. Touch players can drag to look.':'Click to look around with your mouse. W A S D to walk. Press Esc to free the cursor.'}</p><button className="button primary" onClick={()=>lookState==='fallback'?engineRef.current?.enableFallbackLook():engineRef.current?.captureMouse()}>{lookState==='fallback'?'Use mouse-look':'Start exploring'} <ArrowRight size={14}/></button></div>}
          <div className="walk-hud">{['locked','soft'].includes(lookState)?'Mouse to look · W A S D to walk · Shift to walk faster · Esc to release':'Walkthrough paused · click the room to continue'}</div>
        </>}
        <div className={cn('canvas-tools',view==='walk'&&'walk-hidden')}><IconButton label="Navigate view (H)" active={mode==='navigate'} onClick={()=>{selectItem(null);setMode('navigate');}}><Hand size={18}/></IconButton><IconButton label="Select tool (V)" active={mode==='select'} onClick={()=>setMode('select')}><MousePointer2 size={18}/></IconButton><IconButton label="Move tool (M)" active={mode==='move'} onClick={()=>setMode('move')}><Move size={18}/></IconButton><span className="tool-divider"/><IconButton label={grid?'Hide placement grid':'Show placement grid'} active={grid} onClick={()=>setGrid(!grid)}><Grid2X2 size={18}/></IconButton><IconButton label={snap?'Turn off grid snapping':'Snap to 10 cm grid'} active={snap} onClick={()=>setSnap(!snap)}><Maximize size={18}/></IconButton><span className="tool-divider"/><IconButton label={walls?'Hide walls':'Show walls'} active={walls} onClick={()=>setWalls(!walls)}><Layers3 size={18}/></IconButton></div>

        {intro&&!selected&&<div className="welcome-card"><button className="close-welcome" aria-label="Dismiss welcome" onClick={dismissIntro}><X size={14}/></button><span className="welcome-icon"><Sparkles size={19}/></span><div><strong>A space of your own.</strong><p>A little rearranging. A lot of possibility.<br/>Pick a piece and make yourself at home.</p><button onClick={()=>{dismissIntro();setHelp(true);}}>A quick look around <ArrowRight size={13}/></button></div></div>}

        {catalogDrag&&<div className={cn('catalog-drop-hint',catalogDrag.valid&&'valid')} role="status">{catalogDrag.valid?'Release to place':'Drag to a clear place in the flat'} · {catalogDrag.name}</div>}
        {selected&&selectedDef&&<div className="inspector" aria-label="Selected item inspector">
          <div className="inspector-header"><span className="selection-dot"/><div><strong>{selectedDef.name}</strong><span>{selectedDef.finish}</span></div><IconButton label="Deselect item" onClick={()=>selectItem(null)}><X size={15}/></IconButton></div>
          <button className="focus-item" onClick={()=>engineRef.current?.focusSelection(true)}><Maximize size={13}/>Focus item <small>Esc returns to your view</small></button>
          <div className="inspector-tabs"><button className={inspectorTab==='appearance'?'active':''} onClick={()=>setInspectorTab('appearance')}>Appearance</button><button className={inspectorTab==='position'?'active':''} onClick={()=>setInspectorTab('position')}>Position</button></div>
          {inspectorTab==='appearance'?<>
            <label className="part-select">Customize part<select aria-label="Object part" value={activePart?.id||''} onChange={e=>setSelectedPart(e.target.value)}>{appearanceParts.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
            <div className="inspector-label">COLOR <label className="custom-color">Custom<input aria-label="Custom part color" type="color" value={partColor} onPointerDown={checkpoint} onChange={e=>{const id=activePart?.id;if(!id)return;updateItem(selectedId,{appearance:{...selected.appearance,[id]:{...selected.appearance?.[id],color:e.target.value}}},false);}}/></label></div>
            <div className="item-swatches">{SWATCHES.map(c=><button key={c} aria-label={`Color ${c}`} className={cn('swatch',c===partColor&&'selected')} style={{background:c}} onClick={()=>{const id=activePart?.id;if(id)updateItem(selectedId,{appearance:{...selected.appearance,[id]:{...selected.appearance?.[id],color:c}}});}}>{c===partColor&&<Check size={12}/>}</button>)}</div>
            <label className="part-select finish-select">Finish<select aria-label="Part finish" value={selected.appearance?.[activePart?.id]?.finish||''} onChange={e=>{const id=activePart?.id;if(!id)return;const next={...selected.appearance?.[id]};if(e.target.value)next.finish=e.target.value;else delete next.finish;updateItem(selectedId,{appearance:{...selected.appearance,[id]:next}});}}><option value="">Original finish</option>{FINISHES.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
            {selectedDef.model==='rug'&&<label className="part-select">Pattern<select aria-label="Rug pattern" value={selected.pattern||''} onChange={e=>updateItem(selectedId,{pattern:e.target.value||undefined})}><option value="">Original pattern</option>{PATTERNS.map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></label>}
            <button className="reset-appearance" onClick={()=>{const appearance={...selected.appearance};delete appearance[activePart?.id];updateItem(selectedId,{appearance});}}>Restore this part</button>
            <div className="inspector-control"><span>Rotation</span><div className="stepper"><button aria-label="Rotate left 15 degrees" onClick={()=>updateItem(selectedId,{rotation:selected.rotation-Math.PI/12})}><RotateCcw size={14}/></button><span>{Math.round(selected.rotation*180/Math.PI)%360}°</span><button aria-label="Rotate right 15 degrees" onClick={()=>updateItem(selectedId,{rotation:selected.rotation+Math.PI/12})}><RotateCw size={14}/></button></div></div>{selectedDef.architecture?<WallDimensions item={selected} definition={selectedDef} onChange={dimensions=>updateItem(selectedId,{dimensions})}/>:<div className="inspector-control"><span>Scale</span><div className="stepper"><button aria-label="Make item smaller" disabled={selected.scale<=.4} onClick={()=>updateItem(selectedId,{scale:Math.max(.4,+(selected.scale-.1).toFixed(1))})}><Minus size={14}/></button><span>{Math.round(selected.scale*100)}%</span><button aria-label="Make item larger" disabled={selected.scale>=2.5} onClick={()=>updateItem(selectedId,{scale:Math.min(2.5,+(selected.scale+.1).toFixed(1))})}><Plus size={14}/></button></div></div>}</>:<><div className="position-fields">{['x','y','z'].map((axis,i)=><label key={axis}><span>{['X · left / right','Y · elevation','Z · front / back'][i]}</span><div><input aria-label={`Item ${axis} position in meters`} type="number" min={axis==='y'?0:-10} max={axis==='y'?3:10} step=".05" value={Number(selected[axis].toFixed(2))} onChange={e=>{const n=+e.target.value;if(!Number.isFinite(n))return;const max=axis==='x'?layout.width/2-.1:axis==='z'?layout.depth/2-.1:3;updateItem(selectedId,{[axis]:Math.max(axis==='y'?0:-max,Math.min(max,n))});}}/><span>m</span></div></label>)}</div><p className="position-hint">Small objects snap to surfaces. Set elevation to reach a shelf, or drop them onto a table.</p></>}
          <div className="inspector-footer"><button onClick={duplicateSelected}><Copy size={14}/>Duplicate</button><button className="delete-action" onClick={removeSelected}><Trash2 size={14}/>Remove</button></div>
        </div>}

        {structuralWall&&!selected&&<div className="inspector structural-wall-inspector"><div className="inspector-header"><span className="selection-dot"/><div><strong>Fixed layout wall</strong><span>{structuralWall.length.toFixed(2)} m · {structuralWall.interior?'Interior divider':'Outer wall'}</span></div><IconButton label="Deselect wall" onClick={()=>setWallSelection(null)}><X size={15}/></IconButton></div><label className="part-select">Paint side<select aria-label="Wall paint side" value={wallSelection.side} onChange={e=>setWallSelection(s=>({...s,side:e.target.value}))}><option value="a">Side A</option><option value="b">Side B</option><option value="both">Both sides</option></select></label><div className="inspector-label">COLOR <label className="custom-color">Custom<input aria-label="Custom selected wall color" type="color" value={design.wallFinishes?.[structuralWall.id]?.[wallSelection.side==='b'?'b':'a']||design.wallColor} onPointerDown={checkpoint} onChange={e=>editWall(wallSelection.side==='both'?{a:e.target.value,b:e.target.value}:{[wallSelection.side]:e.target.value},false)}/></label></div><div className="item-swatches">{SWATCHES.map(c=><button key={c} className="swatch" style={{background:c}} aria-label={`Wall color ${c}`} onClick={()=>editWall(wallSelection.side==='both'?{a:c,b:c}:{[wallSelection.side]:c})}/>)}</div><label className="part-select">Wall finish<select aria-label="Selected wall finish" value={design.wallFinishes?.[structuralWall.id]?.finish||'paint'} onChange={e=>editWall({finish:e.target.value})}>{[['paint','Painted plaster'],['wood','Timber'],['tile','Ceramic tiles'],['stone','Stone']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><p className="position-hint"><LockKeyhole size={12}/>The wall design and position are fixed. Copy this shape to create a new layout.</p></div>}
        <div className="zoom-controls"><IconButton label="Zoom in" onClick={()=>engineRef.current?.zoom(1)}><Plus size={17}/></IconButton><span/><IconButton label="Zoom out" onClick={()=>engineRef.current?.zoom(-1)}><Minus size={17}/></IconButton><span/><IconButton label="Reset camera" onClick={()=>engineRef.current?.resetCamera()}><Maximize size={16}/></IconButton></div>
        <div className="stage-bottom"><div className="scene-status"><span className="live-dot"/><span>Live render</span><span className="status-dot">·</span><span>{design.items.length} objects</span></div><div className="view-switcher"><button className={view==='orbit'?'active':''} onClick={()=>selectView('orbit')}><Box size={15}/><span>3D view</span></button><button className={view==='top'?'active':''} onClick={()=>selectView('top')}><LayoutDashboard size={15}/><span>Floor plan</span></button><button className={view==='walk'?'active':''} onClick={()=>selectView('walk')}><Footprints size={15}/><span>Walkthrough</span></button></div><button className="help-shortcut" onClick={()=>setHelp(true)}><CircleHelp size={15}/><span>Controls</span></button></div>
        <div className="canvas-caption">{view==='walk'?'Click room to capture mouse · Esc to release':mode==='move'?'Drag objects to move · Move stays active when deselecting':'Drag to orbit · WASD to pan · scroll to zoom · Esc restores the view'}</div>
      </main>

      <aside className="catalog-panel">
        <div className="catalog-heading"><div><span className="panel-eyebrow">THE FINISHING TOUCHES</span><h2>{panel==='furniture'?(favoritesOnly?'Your favorites':'Make it feel like you.') :panel==='materials'?'A beautiful foundation.':panel==='lighting'?'Let the light in.':panel==='settings'?'Make it run your way.':'Find your kind of space.'}</h2></div><span className="catalog-heading-icon">{panel==='furniture'?<Armchair size={20}/>:panel==='materials'?<Paintbrush size={20}/>:panel==='lighting'?<Sun size={20}/>:panel==='settings'?<Settings2 size={20}/>:<House size={20}/>}</span></div>
        {panel==='furniture'?<>
          <p className="catalog-intro">Considered pieces. Limitless combinations.</p>
          <div className="catalog-search"><Search size={17}/><input aria-label="Search furniture and objects" placeholder="Find something for your space…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Clear search" onClick={()=>setSearch('')}><X size={14}/></button>}<span>⌕</span></div>
          <CategoryTabs categories={CATEGORIES} value={category} onChange={setCategory}/>
          {category==='hobbies'&&<label className="hobby-filter">Find your hobby<select aria-label="Hobby theme" value={hobby} onChange={e=>setHobby(e.target.value)}><option value="">All 20 hobbies</option>{HOBBIES.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>}
          <div className="catalog-section-title"><span>{search?`Results for “${search}”`:favoritesOnly?'Saved for later':category==='all'?'Curated essentials':CATEGORIES.find(c=>c.id===category).name}<small>{filtered.length} items</small></span><button aria-label={favoritesOnly?'Show all items':'Show favorites'} className={cn('filter-button',favoritesOnly&&'active')} onClick={()=>setFavoritesOnly(!favoritesOnly)}><Heart size={15} fill={favoritesOnly?'currentColor':'none'}/></button></div>
          <div className="catalog-scroll"><div className="product-grid">{filtered.map(item=><div className="product-card" key={item.id}><button className="product-image" draggable onDragStart={e=>startCatalogDrag(e,item)} onDragEnd={endCatalogDrag} onClick={()=>addItem(item)} aria-label={`Add ${item.name} to your flat`}><CatalogThumbnail item={item}/>{item.tag&&<span className="product-tag">{item.tag}</span>}<span className="add-product"><Plus size={16}/></span></button><button className={cn('favorite-button',design.favoriteIds.includes(item.id)&&'is-favorite')} aria-label={`${design.favoriteIds.includes(item.id)?'Unfavorite':'Favorite'} ${item.name}`} onClick={e=>toggleFavorite(e,item.id)}><Heart size={13} fill={design.favoriteIds.includes(item.id)?'currentColor':'none'}/></button><button className="product-name" draggable onDragStart={e=>startCatalogDrag(e,item)} onDragEnd={endCatalogDrag} onClick={()=>addItem(item)}>{item.name}</button><span className="product-finish"><span style={{background:item.color}}/>{item.finish}</span></div>)}</div>{!filtered.length&&<div className="empty-catalog"><Search size={26}/><h3>A little more room to explore.</h3><p>{favoritesOnly?'Tap the heart on a piece to save it here.':'Try another name, material, or category.'}</p><button className="button" onClick={()=>{setSearch('');setCategory('all');setFavoritesOnly(false);}}>Explore all pieces</button></div>}</div>
          <div className="catalog-footer"><MousePointer2 size={17}/><span>Drag a piece into your flat, or click to add it.</span></div>
        </>:panel==='settings'?<GraphicsPanel settings={graphics} onChange={setGraphics}/>:panel==='materials'?<div className="settings-scroll"><p className="settings-intro">The colors and textures that make a house feel like home.</p><div className="setting-section"><div className="section-label"><h3>Wall color</h3><span>All walls</span></div><div className="wall-swatches">{WALL_COLORS.map(c=><button key={c.color} className={design.wallColor===c.color?'selected':''} onClick={()=>paintAllWalls(c.color)}><span style={{background:c.color}}>{design.wallColor===c.color&&<Check size={17}/>}</span><small>{c.name}</small></button>)}</div><label className="color-field"><span>Your own shade</span><span className="color-value">{design.wallColor}<input type="color" aria-label="Custom wall color" value={design.wallColor} onChange={e=>paintAllWalls(e.target.value)}/></span></label></div><div className="setting-section"><div className="section-label"><h3>Under your feet</h3><span>Floor material</span></div><div className="floor-grid">{FLOOR_TYPES.map(f=><button className={design.floor===f.id?'selected':''} key={f.id} onClick={()=>change(d=>({...d,floor:f.id}))}><span className={`floor-sample ${f.type}`} style={{backgroundColor:f.color}}>{design.floor===f.id&&<Check size={17}/>}</span><strong>{f.name}</strong></button>)}</div></div><div className="setting-section"><div className="section-label"><h3>Bathroom tiles</h3><span>Glazed ceramic</span></div><div className="tile-swatches">{BATH_TILES.map(t=><button key={t.id} aria-label={`${t.name} bathroom tiles`} title={t.name} className={cn('tile-sample',design.bathTile===t.id&&'selected')} style={{backgroundColor:t.color}} onClick={()=>change(d=>({...d,bathTile:t.id}))}>{design.bathTile===t.id&&<Check size={18}/>}</button>)}</div><TileColorPicker value={bathTileColor(design.bathTile)} onCheckpoint={checkpoint} onChange={color=>change(d=>d.bathTile===color?d:{...d,bathTile:color},false)}/>{!layout.partitions&&!layout.plan?.regions.some(r=>r.type==='indoor'&&r.use==='bathroom')&&<p className="field-note">This layout has no separate bathroom floor. Choose a home with a bathroom, or mark a bathroom in your own floor plan.</p>}</div><div className="outdoor-surface-settings">{layout.plan?.regions.some(r=>r.type!=='indoor')&&<div className="setting-section"><div className="section-label"><h3>Outdoor surfaces</h3></div>{layout.plan.regions.filter(r=>r.type!=='indoor').map(r=><label key={r.id} className="graphics-field">{r.name}<select aria-label={`Surface for ${r.name}`} value={design.zoneSurfaces?.[r.id]||r.surface} onChange={e=>change(d=>({...d,zoneSurfaces:{...d.zoneSurfaces,[r.id]:e.target.value}}))}>{OUTDOOR_SURFACES.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>)}</div>}</div><div className="note"><Paintbrush size={17}/><span>Select any object to give it its own color, rotation and size.</span></div></div>:panel==='lighting'?<div className="settings-scroll">{lightControls()}<div className="setting-section"><div className="section-label"><h3>A little atmosphere</h3></div><p className="field-note">Place table lights, floor lamps and pendants from the catalog. The light switch controls installed ceiling lights and placed lamps, independently of the time of day.</p><button className="text-link" onClick={()=>{setPanel('furniture');setCategory('lighting');setSearch('');setFavoritesOnly(false);}}>Explore the lighting collection <ArrowRight size={14}/></button></div></div>:<div className="settings-scroll"><p className="settings-intro">Ten distinct floor plans. One very good imagination. Keep the furnished demos, start empty, or draw your own shape.</p><button className="create-floor-plan-button" onClick={()=>openShape()}><Plus size={16}/>{readStorage(PLAN_DRAFT_KEY,null)?'Continue floor-plan draft':'Create a floor plan'}</button><div className="layout-lock-note"><LockKeyhole size={13}/>Confirmed layouts stay fixed. Copy a shape to make structural changes.</div><div className="layout-list">{LAYOUTS.map(l=><div key={l.id} className={cn('layout-card',l.id===design.layoutId&&'selected')}><div className="layout-plan-wrap"><Plan layout={l}/>{l.id===design.layoutId&&<span className="current-layout"><Check size={12}/>Your current space</span>}</div><div className="layout-card-bottom"><div><h3>{l.name}</h3><p>{l.area} m² <span>·</span> {l.rooms}</p></div>{l.id===design.layoutId?<span className="selected-circle"><Check size={15}/></span>:<ArrowRight size={19}/>}</div><div className="layout-card-actions"><button onClick={()=>selectLayout(l.id)}><Eye size={12}/>Open demo</button><button onClick={()=>openSpaces('new',l.id)}><Plus size={12}/>New design</button><button onClick={()=>openShape(l)}><Copy size={12}/>Copy shape</button></div></div>)}</div></div>}
      </aside>
    </div>
    {toast&&<div className="toast" role="status"><span><Check size={14}/></span>{toast}</div>}
    {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}><IconButton label="Close help" className="modal-close" onClick={()=>setHelp(false)}><X size={20}/></IconButton><span className="modal-symbol"><House size={27}/></span><span className="panel-eyebrow">WELCOME TO YOUR STUDIO</span><h2 id="help-title">Make yourself at home.</h2><p>There’s no right way to make a space your own.<br/>Here are a few things to get you started.</p><div className="help-grid">{[{icon:Armchair,title:'Find your pieces',text:`Explore ${CATALOG.length} pieces. Drag one from the catalog into your flat, or click to add it.`},{icon:Move,title:'A little rearranging',text:'Drag to orbit the view. Click a piece to select it; choose Move to drag it. Move stays active on deselection. H returns to navigation; Esc restores the view from before selection.'},{icon:Sun,title:'Chase the light',text:'Move the time slider from morning to night to see changing sunlight, reflections and shadows.'},{icon:Eye,title:'A new perspective',text:'WASD pans the 3D view. Click Walkthrough for mouse-look controls. W A S D moves, mouse looks up and down, and Esc releases the cursor.'}].map(({icon:I,title,text})=><div key={title}><I size={22}/><h3>{title}</h3><p>{text}</p></div>)}</div><div className="shortcut-list"><span><kbd>H</kbd> Navigate</span><span><kbd>M</kbd> Move</span><span><kbd>R</kbd> Rotate</span><span><kbd>⌘ D</kbd> Duplicate</span><span><kbd>⌫</kbd> Remove</span><span><kbd>⌘ Z</kbd> Undo</span><span><kbd>Esc</kbd> Deselect</span></div><button className="button primary" onClick={()=>{setHelp(false);dismissIntro();}}>Let’s make room <ArrowRight size={16}/></button><span className="help-local">Your designs save automatically on this device. Export a file to keep a backup.</span></section></div>}
    {spaces&&<div className="modal-backdrop" onClick={()=>setSpaces(false)}><section className="spaces-modal" role="dialog" aria-modal="true" aria-labelledby="spaces-title" onClick={e=>e.stopPropagation()}>
      <IconButton label="Close spaces" className="modal-close" onClick={()=>setSpaces(false)}><X size={20}/></IconButton>
      <span className="panel-eyebrow">ROOM FOR YOUR IDEAS</span><h2 id="spaces-title">{spacesTab==='new'?'Start with a little possibility.':spacesTab==='demos'?'A little inspiration, always here.':'Your spaces, all together.'}</h2>
      <p>{spacesTab==='new'?'Pick an empty flat and give your new design a name.':spacesTab==='demos'?'Explore our furnished homes. Any edits save as your own copy.':'Continue a design, explore a demo, or make a fresh start.'}</p>
      <div className="spaces-tabs" role="tablist" aria-label="Spaces library">
        {[['saved',`Your designs (${savedDesigns.length})`],['demos','Demo homes'],['new','New design']].map(([id,label])=><button key={id} role="tab" aria-selected={spacesTab===id} onClick={()=>setSpacesTab(id)}>{id==='new'&&<Plus size={13}/>} {label}</button>)}
      </div>
      {spacesTab==='saved'?<>
        {savedDesigns.length?<div className="spaces-grid saved-spaces-grid">{savedDesigns.map(saved=><div className="saved-space" key={saved.designId}><button className={cn('space-card',saved.designId===design.designId&&'selected')} onClick={()=>activateDesign(saved)}>
          <div className="space-plan"><Plan layout={getLayout(saved)} large furnished={saved.items.length>0}/>{saved.designId===design.designId&&<span className="current-layout"><Check size={12}/>Currently designing</span>}</div>
          <div><span className="space-meta">{getLayout(saved).name} · {saved.items.length} objects</span><h3>{saved.name}</h3><span className="space-cta">Continue designing <ArrowRight size={16}/></span></div>
        </button><div className="saved-shape-actions"><button className="copy-saved-shape" aria-label={`Copy shape of ${saved.name}`} onClick={()=>openShape(getLayout(saved))}><Copy size={14}/>Copy shape</button><button className="delete-design" aria-label={`Delete design ${saved.name}`} onClick={()=>setDeleteTarget(saved)}><Trash2 size={14}/>Delete</button></div></div>)}</div>:<div className="empty-spaces"><House size={31}/><h3>Your next favorite place starts here.</h3><p>Create an empty flat, or make a demo your own. Everything saves on this device.</p><button className="button primary" onClick={()=>setSpacesTab('new')}><Plus size={15}/>Create a new design</button><button className="text-link" onClick={()=>setSpacesTab('demos')}>Explore furnished demos <ArrowRight size={13}/></button></div>}
      </>:<>
        <div className="spaces-grid">{LAYOUTS.map(l=><button key={l.id} className={cn('space-card',spacesTab==='new'&&newLayout===l.id&&'selected')} aria-pressed={spacesTab==='new'?newLayout===l.id:undefined} onClick={()=>spacesTab==='new'?setNewLayout(l.id):selectLayout(l.id)}>
          <div className="space-plan"><Plan layout={l} large furnished={spacesTab==='demos'}/>{spacesTab==='new'&&newLayout===l.id&&<span className="current-layout"><Check size={12}/>Selected floor plan</span>}{spacesTab==='demos'&&<span className="current-layout">Furnished demo</span>}</div>
          <div><span className="space-meta">{l.area} m² <span>·</span> {l.rooms}</span><h3>{l.name}</h3><p>{l.subtitle}</p><span className="space-cta">{spacesTab==='new'?'Empty floor plan':'Explore demo'}{spacesTab==='new'&&newLayout===l.id?<Check size={16}/>:<ArrowRight size={16}/>}</span></div>
        </button>)}</div>
        {spacesTab==='new'&&<div className="new-floor-plan-options"><button className="button" onClick={()=>openShape()}><Plus size={14}/>{readStorage(PLAN_DRAFT_KEY,null)?'Continue floor-plan draft':'Draw my own shape'}</button><button className="button" onClick={()=>openShape(LAYOUTS.find(l=>l.id===newLayout))}><Copy size={14}/>Copy selected shape</button></div>}
        {spacesTab==='new'&&<form className="new-design-form" onSubmit={e=>{e.preventDefault();startBlank();}}><label>Design name<input aria-label="New design name" maxLength={80} value={newName} onChange={e=>setNewName(e.target.value)} placeholder={`${LAYOUTS.find(l=>l.id===newLayout).name} — my design`}/></label><button type="submit" className="button primary">Create empty design <ArrowRight size={16}/></button></form>}
      </>}
      <div className="spaces-note"><Check size={14}/>{spacesTab==='demos'?'Original demos stay furnished. Your edits become a separate personal design.':'New designs and existing homes save separately on this device.'}</div>
    </section></div>}
    {shapeEditor&&<PlanEditor seed={shapeEditor.seed} onClose={()=>setShapeEditor(null)} onConfirm={finishShape}/>}
    {deleteTarget&&<ConfirmDesignDelete design={deleteTarget} onCancel={()=>setDeleteTarget(null)} onConfirm={confirmDelete}/>}
  </div>;
}

export default App;
