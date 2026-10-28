import React,{useEffect,useRef,useState} from 'react';
import {Armchair} from 'lucide-react';
import {requestThumbnail} from './thumbnails.js';

export default function CatalogThumbnail({item}){
  const ref=useRef(null),[url,setUrl]=useState('');
  useEffect(()=>{
    let cancel=()=>{};
    const request=()=>{cancel=requestThumbnail(item,setUrl);};
    if(!('IntersectionObserver' in window)){request();return()=>cancel();}
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))request();else{cancel();setUrl('');}},{root:ref.current.closest('.catalog-scroll'),rootMargin:'150px'});
    observer.observe(ref.current);return()=>{observer.disconnect();cancel();};
  },[item]);
  return <span className="catalog-thumbnail" ref={ref}>{url?<img draggable={false} src={url} alt={item.name} loading="lazy" decoding="async"/>:<Armchair size={35} className="placeholder-icon"/>}</span>;
}
