import React,{useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';

export default function CategoryTabs({categories,value,onChange}){
  const strip=useRef(null),[edges,setEdges]=useState({left:false,right:false});
  useEffect(()=>{
    const element=strip.current;
    const update=()=>setEdges({left:element.scrollLeft>1,right:element.scrollLeft+element.clientWidth<element.scrollWidth-1});
    const wheel=event=>{
      if(Math.abs(event.deltaY)<=Math.abs(event.deltaX)||element.scrollWidth<=element.clientWidth)return;
      const multiplier=event.deltaMode===1?16:event.deltaMode===2?element.clientWidth:1;
      const next=Math.max(0,Math.min(element.scrollWidth-element.clientWidth,element.scrollLeft+event.deltaY*multiplier));
      if(next!==element.scrollLeft){event.preventDefault();element.scrollLeft=next;}
    };
    element.addEventListener('scroll',update);element.addEventListener('wheel',wheel,{passive:false});
    const observer=new ResizeObserver(update);observer.observe(element);update();
    return()=>{observer.disconnect();element.removeEventListener('scroll',update);element.removeEventListener('wheel',wheel);};
  },[categories]);
  return <div className="category-navigation" role="group" aria-label="Item categories">
    <button className="category-arrow" aria-label="Scroll categories left" disabled={!edges.left} onClick={()=>strip.current.scrollBy({left:-180,behavior:'smooth'})}><ChevronLeft size={15}/></button>
    <div className="category-scroll" ref={strip}>{categories.map(category=><button key={category.id} className={value===category.id?'active':''} aria-pressed={value===category.id} onClick={event=>{onChange(category.id);event.currentTarget.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}}>{category.name}</button>)}</div>
    <button className="category-arrow" aria-label="Scroll categories right" disabled={!edges.right} onClick={()=>strip.current.scrollBy({left:180,behavior:'smooth'})}><ChevronRight size={15}/></button>
  </div>;
}
