const timelines=[
  {name:'Main plot',color:'#292b28',y:215,opacity:1,dash:false,width:2},
  {name:'Dr. Vale',color:'#e56745',y:365,opacity:.9,dash:false,width:2},
  {name:'Echo signal',color:'#698e88',y:515,opacity:.8,dash:true,width:2}
];
let events=[
  {id:1,label:'The signal begins',day:3,line:0,color:'#292b28',sub:'DAY 03 · 06:10'},
  {id:2,label:'First contact',day:8,line:0,color:'#e56745',sub:'DAY 08 · 14:30'},
  {id:3,label:'Vale disappears',day:14,line:1,color:'#e56745',sub:'DAY 14 · 23:46'},
  {id:4,label:'Pattern repeats',day:18,line:2,color:'#698e88',sub:'DAY 18 · 03:12',dash:true},
  {id:5,label:'The transmission',day:24,line:0,color:'#292b28',sub:'DAY 24 · 19:05'},
  {id:6,label:'Silence',day:29,line:2,color:'#698e88',sub:'DAY 29 · 00:00',dash:true}
];
let notes=[
  {x:265,y:145,text:'What if the signal isn’t a message — but a memory?',tag:'STORY QUESTION'},
  {x:650,y:405,text:'Vale realizes the intervals match her own heartbeat.',tag:'CHARACTER BEAT'},
  {x:1020,y:580,text:'Keep this moment quiet. Let the absence carry the weight.',tag:'TONE NOTE'}
];
let selected=2,tool='select',scale=1,panX=0,panY=0,drag=null,spaceHeld=false;
const $=s=>document.querySelector(s), canvas=$('#canvas'),world=$('#world');
function renderTimelines(){
  $('#timelineList').innerHTML=timelines.map((t,i)=>`<div class="timeline-row ${i===0?'active':''}" data-line="${i}" title="Double-click to edit style"><span class="drag-dots">⠿</span><span class="swatch" style="background:${t.color}"></span><strong>${t.name}</strong><span class="more">•••</span></div>`).join('');
  $('#timelineCount').textContent=timelines.length;
  $('#timelineSelect').innerHTML=timelines.map(t=>`<option>${t.name}</option>`).join('');
  document.querySelectorAll('.timeline-row').forEach(row=>row.ondblclick=()=>editTimeline(+row.dataset.line));
}
function editTimeline(i){let t=timelines[i];t.name=prompt('Timeline name',t.name)||t.name;t.color=prompt('Color (hex)',t.color)||t.color;t.width=Math.max(1,Math.min(8,+(prompt('Stroke size (1–8)',t.width)||t.width)));t.opacity=Math.max(0,Math.min(1,+(prompt('Opacity (0–1)',t.opacity)||t.opacity)));t.dash=confirm('Use a dashed line?');renderTimelines();render()}
function render(){
  $('#lines').innerHTML=timelines.map(t=>`<div class="line ${t.dash?'dashed':''}" style="top:${t.y}px;--c:${t.color};--o:${t.opacity};--w:${t.width}px"><div class="line-label"><span style="background:${t.color}"></span>${t.name}</div><div class="line-stroke"></div></div>`).join('');
  $('#events').innerHTML=events.map(e=>`<div class="event ${e.dash?'dashed':''} ${e.id===selected?'selected':''}" data-id="${e.id}" style="left:${80+(e.day-1)*(1230/29)}px;top:${timelines[e.line].y-80}px;--c:${e.color};--o:${e.opacity||1}"><div class="event-line"></div><div class="event-label">${e.label}<small>${e.sub}</small></div></div>`).join('');
  $('#notes').innerHTML=notes.map((n,i)=>`<div class="note" data-note="${i}" style="left:${n.x}px;top:${n.y}px"><b>${n.text}</b><small>${n.tag}</small></div>`).join('');
  bindDrags();
}
function updateTransform(){world.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;$('#zoomLabel').textContent=Math.round(scale*100)+'%'}
function selectEvent(id){selected=id;const e=events.find(x=>x.id===id);if(!e)return;$('#labelInput').value=e.label;$('#dayInput').value=e.day;$('#colorInput').value=e.color;$('#timelineSelect').selectedIndex=e.line;render()}
function bindDrags(){
  document.querySelectorAll('.event').forEach(el=>el.onpointerdown=e=>{e.stopPropagation();selectEvent(+el.dataset.id);drag={type:'event',id:+el.dataset.id,start:e.clientX,day:events.find(x=>x.id===+el.dataset.id).day};el.setPointerCapture(e.pointerId)});
  document.querySelectorAll('.note').forEach(el=>el.onpointerdown=e=>{e.stopPropagation();let n=notes[+el.dataset.note];drag={type:'note',index:+el.dataset.note,startX:e.clientX,startY:e.clientY,x:n.x,y:n.y};el.setPointerCapture(e.pointerId)});
  document.querySelectorAll('.note').forEach(el=>el.ondblclick=e=>{e.stopPropagation();let n=notes[+el.dataset.note];n.text=prompt('Edit note',n.text)||n.text;render()});
}
window.onpointermove=e=>{if(!drag)return;if(drag.type==='event'){let ev=events.find(x=>x.id===drag.id);ev.day=Math.max(1,Math.min(30,Math.round(drag.day+(e.clientX-drag.start)/(1230/29)/scale)));ev.sub=`DAY ${String(ev.day).padStart(2,'0')}`;render()}else if(drag.type==='note'){let n=notes[drag.index];n.x=drag.x+(e.clientX-drag.startX)/scale;n.y=drag.y+(e.clientY-drag.startY)/scale;render()}else{panX=drag.x+e.clientX-drag.startX;panY=drag.y+e.clientY-drag.startY;updateTransform()}};
window.onpointerup=()=>{drag=null;activateTool()};
canvas.onpointerdown=e=>{
  if(e.button===1||spaceHeld||tool==='pan'||tool==='select'){e.preventDefault();drag={type:'pan',startX:e.clientX,startY:e.clientY,x:panX,y:panY};canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing';return}
  if(tool==='event'){const r=world.getBoundingClientRect(),x=(e.clientX-r.left)/scale,y=(e.clientY-r.top)/scale;let line=timelines.reduce((a,t,i)=>Math.abs(t.y-y)<Math.abs(timelines[a].y-y)?i:a,0);let day=Math.max(1,Math.min(30,Math.round(1+(x-80)/(1230/29))));let id=Date.now();events.push({id,label:'New event',day,line,color:timelines[line].color,sub:`DAY ${String(day).padStart(2,'0')}`});tool='select';activateTool();selectEvent(id)
  }else if(tool==='note'){const r=world.getBoundingClientRect();notes.push({x:(e.clientX-r.left)/scale,y:(e.clientY-r.top)/scale,text:'Double-click to write a note',tag:'NOTE'});$('#noteCount').textContent=notes.length;tool='select';activateTool();render()}
};
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();spaceHeld=true;canvas.style.cursor='grab'}});
window.addEventListener('keyup',e=>{if(e.code==='Space'){spaceHeld=false;activateTool()}});
canvas.addEventListener('wheel',e=>{e.preventDefault();const old=scale,delta=e.deltaY<0?.1:-.1;scale=Math.max(.5,Math.min(1.7,scale+delta));const rect=canvas.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;panX=mx-(mx-panX)*(scale/old);panY=my-(my-panY)*(scale/old);updateTransform()},{passive:false});
document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;activateTool()});
function activateTool(){document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));canvas.style.cursor=tool==='event'?'crosshair':tool==='note'?'text':tool==='pan'?'grab':'default'}
$('#themeToggle').onclick=()=>document.body.classList.toggle('dark');
$('#zoomIn').onclick=()=>{scale=Math.min(1.7,scale+.1);updateTransform()};$('#zoomOut').onclick=()=>{scale=Math.max(.5,scale-.1);updateTransform()};$('#fitView').onclick=()=>{scale=.72;panX=10;panY=10;updateTransform()};
$('#addTimeline').onclick=()=>{let i=timelines.length;timelines.push({name:`Storyline ${i+1}`,color:['#8a70a1','#c19a55','#5681a5'][i%3],y:215+i*150,opacity:1,dash:false,width:2});renderTimelines();render()};
$('#labelInput').oninput=e=>{let ev=events.find(x=>x.id===selected);if(ev){ev.label=e.target.value;render()}};
$('#dayInput').oninput=e=>{let ev=events.find(x=>x.id===selected);if(ev){ev.day=Math.max(1,Math.min(30,+e.target.value));render()}};
$('#colorInput').oninput=e=>{let ev=events.find(x=>x.id===selected);if(ev){ev.color=e.target.value;render()}};
$('#timelineSelect').onchange=e=>{let ev=events.find(x=>x.id===selected);if(ev){ev.line=e.target.selectedIndex;render()}};
$('#dashInput').onchange=e=>{let ev=events.find(x=>x.id===selected);if(ev){ev.dash=e.target.value!=='Solid';render()}};
$('#opacityInput').onchange=e=>{let ev=events.find(x=>x.id===selected);if(ev){ev.opacity=Math.max(0,Math.min(1,parseFloat(e.target.value)/100));render()}};
$('#deleteEvent').onclick=()=>{events=events.filter(e=>e.id!==selected);selected=events[0]?.id;render()};
function togglePanel(side){const hidden=document.body.classList.toggle(`${side}-panel-hidden`),button=$(`#${side}PanelToggle`);button.textContent=side==='left'?(hidden?'›':'‹'):(hidden?'‹':'›');button.title=`${hidden?'Show':'Hide'} ${side==='left'?'timelines panel':'inspector panel'}`}
$('#leftPanelToggle').onclick=()=>togglePanel('left');
$('#rightPanelToggle').onclick=()=>togglePanel('right');
$('#closeInspector').onclick=()=>togglePanel('right');
renderTimelines();render();updateTransform();
