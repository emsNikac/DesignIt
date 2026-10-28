// A consistent exposure lets night stay dark instead of auto-brightening it.
// Intensities are artistic photometric approximations, not an astronomical model.
export function daylightState(time){
  const t=((time%24)+24)%24,day=Math.max(0,Math.sin((t-6)*Math.PI/12)),night=1-Math.min(1,day*5),golden=day>0&&day<.45;
  return {day,night,golden,celestialIntensity:day>0?day*3.2:.4,
    celestialColor:day>0?(golden?'#ffd4a1':'#fff0db'):'#9eb9ee',
    x:day>0?Math.cos((t-6)*Math.PI/12)*9:Math.sin((t-18)*Math.PI/12)*7,
    height:day>0?1.2+day*9:4+Math.cos(t*Math.PI/12)*2,
    hemisphere:.055+day*1.15,fill:day*.35,environment:.035+day*.62,
    sky:day>.1?(golden?'#d8c5a1':'#d8dfd3'):'#17253e',background:day>.1?'#eeeee7':'#252c39'};
}

export function roomLightPositions(layout){
  return layout.partitions?[[-layout.width*.23,2.92,0],[layout.width*.28,2.92,-layout.depth*.25],[layout.width*.28,2.92,layout.depth*.28]]:[[-layout.width*.24,2.92,-layout.depth*.1],[layout.width*.23,2.92,layout.depth*.08]];
}
