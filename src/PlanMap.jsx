import React from 'react';
import {planGeometry,planBounds} from './floor-plans.js';
export const regionFill=r=>r.type==='garden'?'#b1c596':r.type==='terrace'?'#d9c5a6':r.type==='path'?'#c4c3b7':r.use==='bathroom'?'#b8ccc5':'#e7e2d2';
export const pathData=polygons=>polygons.map(poly=>poly.map(ring=>`M ${ring.map(p=>p.join(' ')).join(' L ')} Z`).join(' ')).join(' ');
export default function PlanMap({plan,large=false}){
  const b=planBounds(plan),g=planGeometry(plan),pad=.5;
  return <svg className={`plan plan-map${large?' large':''}`} viewBox={`${b.minX-pad} ${b.minZ-pad} ${b.maxX-b.minX+pad*2} ${b.maxZ-b.minZ+pad*2}`} aria-hidden="true">
    {g.floors.map(f=><path key={f.region.id} d={pathData(f.polygons)} fill={regionFill(f.region)} fillRule="evenodd"/>)}
    {g.segments.map(s=><line key={s.id} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={s.style==='open'?'#b5c49d':s.style==='window'||s.style==='glass'?'#84aba5':'#76836a'} strokeWidth={s.interior?.12:.18} strokeDasharray={['open','doorway','archway'].includes(s.style)?'.3 .2':undefined}/>)}
  </svg>;
}
