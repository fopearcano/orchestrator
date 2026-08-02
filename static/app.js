const WORLD_WIDTH=100000, ORIGIN=50000, STEP=90;
let timelines=[
  {name:'Main plot',color:'#292b28',y:240,opacity:1,dash:false,width:2},
  {name:'Dr. Vale',color:'#e56745',y:410,opacity:.9,dash:false,width:2},
  {name:'Echo signal',color:'#698e88',y:580,opacity:.8,dash:true,width:2}
];
let events=[
  {id:1,label:'The signal begins',time:3,line:0,color:'#292b28',hour:'06:10',opacity:1,font:'Manrope',size:13},
  {id:2,label:'First contact',time:8,line:0,color:'#e56745',hour:'14:30',opacity:1,font:'Manrope',size:13},
  {id:3,label:'Vale disappears',time:14,line:1,color:'#e56745',hour:'23:46',opacity:1,font:'Manrope',size:13},
  {id:4,label:'Pattern repeats',time:18,line:2,color:'#698e88',hour:'03:12',opacity:1,font:'DM Mono',size:13,dash:true}
];
let notes=[
  {x:680,y:145,text:'What if the signal isn’t a message — but a memory?',tag:'STORY QUESTION'},
  {x:1180,y:455,text:'Vale realizes the intervals match her own heartbeat.',tag:'CHARACTER BEAT'}
];
let selected=2,tool='select',scale=.85,panX=-42000,panY=0,drag=null,spaceHeld=false,timeUnit='days';
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s), canvas=$('#canvas'),world=$('#world');
const unitName=n=>timeUnit==='days'?`DAY ${String(n).padStart(2,'0')}`:`MONTH ${String(n).padStart(2,'0')}`;
function renderRuler(){let values=[];for(let n=-500;n<=500;n+=5)values.push(`<span style="left:${ORIGIN+n*STEP}px">${unitName(n)}</span>`);$('#ruler').innerHTML=values.join('')+'<i class="playhead"></i>'}
function renderTimelines(){
  $('#timelineList').innerHTML=timelines.map((t,i)=>`<div class="timeline-row" data-line="${i}"><button class="visibility" title="Show/hide">${t.hidden?'○':'●'}</button><span class="swatch" style="background:${t.color}"></span><strong>${t.name}</strong><button class="more" title="Edit timeline">•••</button></div>`).join('');
  $('#timelineCount').textContent=timelines.length;
  $('#timelineSelect').innerHTML=timelines.map(t=>`<option>${t.name}</option>`).join('');
  $$('.timeline-row').forEach(row=>{const i=+row.dataset.line;row.querySelector('.visibility').onclick=e=>{e.stopPropagation();timelines[i].hidden=!timelines[i].hidden;renderTimelines();render()};row.querySelector('.more').onclick=e=>{e.stopPropagation();editTimeline(i)};row.ondblclick=()=>editTimeline(i)});
}
function editTimeline(i){const t=timelines[i],name=prompt('Timeline name',t.name);if(name!==null&&name.trim())t.name=name.trim();const color=prompt('Color (hex)',t.color);if(color)t.color=color;t.width=Math.max(1,Math.min(8,+(prompt('Stroke size (1–8)',t.width)||t.width)));t.opacity=Math.max(0,Math.min(1,+(prompt('Opacity (0–1)',t.opacity)||t.opacity)));t.dash=confirm('Use a dashed line?');renderTimelines();render()}
function render(){
  renderRuler();
  $('#eventCount').textContent=events.length;$('#noteCount').textContent=notes.length;
  $('#lines').innerHTML=timelines.map(t=>`<div class="line ${t.dash?'dashed':''} ${t.hidden?'is-hidden':''}" style="top:${t.y}px;left:0;width:${WORLD_WIDTH}px;--c:${t.color};--o:${t.opacity};--w:${t.width}px"><div class="line-label" style="left:${ORIGIN-10}px"><span style="background:${t.color}"></span>${t.name}</div><div class="line-stroke"></div></div>`).join('');
  $('#events').innerHTML=events.map(e=>{const t=timelines[e.line];return `<div class="event ${e.dash?'dashed':''} ${e.id===selected?'selected':''} ${t?.hidden?'is-hidden':''}" data-id="${e.id}" style="left:${ORIGIN+e.time*STEP}px;top:${t.y-80}px;--c:${e.color};--o:${e.opacity};--fs:${e.size}px;--font:${e.font}"><div class="event-line"></div><div class="event-label">${e.label}<small>${unitName(e.time)} · ${e.hour}</small></div></div>`}).join('');
  $('#notes').innerHTML=notes.map((n,i)=>`<div class="note" data-note="${i}" style="left:${n.x}px;top:${n.y}px"><b>${n.text}</b><small>${n.tag}</small></div>`).join('');
  bindItems();
}
function bindItems(){
  $$('.event').forEach(el=>el.onpointerdown=e=>{e.stopPropagation();selectEvent(+el.dataset.id);const item=events.find(x=>x.id===+el.dataset.id);drag={type:'event',id:item.id,start:e.clientX,time:item.time}});
  $$('.note').forEach(el=>{el.onpointerdown=e=>{e.stopPropagation();const n=notes[+el.dataset.note];drag={type:'note',index:+el.dataset.note,startX:e.clientX,startY:e.clientY,x:n.x,y:n.y}};el.ondblclick=e=>{e.stopPropagation();const n=notes[+el.dataset.note],text=prompt('Edit note',n.text);if(text!==null)n.text=text;render()}});
}
function selectEvent(id){selected=id;const e=events.find(x=>x.id===id);if(!e)return;$('#labelInput').value=e.label;$('#dayInput').value=e.time;$('#colorInput').value=e.color;$('#timelineSelect').selectedIndex=e.line;$('#dashInput').value=e.dash?'Dashed':'Solid';$('#opacityInput').value=Math.round(e.opacity*100)+'%';$('#fontInput').value=e.font;$('#fontSizeInput').value=String(e.size);render()}
function updateTransform(){world.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;$('#zoomLabel').textContent=Math.round(scale*100)+'%'}
window.onpointermove=e=>{if(!drag)return;if(drag.type==='event'){const item=events.find(x=>x.id===drag.id);item.time=Math.round(drag.time+(e.clientX-drag.start)/STEP/scale);render()}else if(drag.type==='note'){const n=notes[drag.index];n.x=drag.x+(e.clientX-drag.startX)/scale;n.y=drag.y+(e.clientY-drag.startY)/scale;render()}else{panX=drag.x+e.clientX-drag.startX;panY=drag.y+e.clientY-drag.startY;updateTransform()}};
window.onpointerup=()=>{drag=null;activateTool()};
canvas.onpointerdown=e=>{if(e.button===1||spaceHeld||tool==='pan'||tool==='select'){e.preventDefault();drag={type:'pan',startX:e.clientX,startY:e.clientY,x:panX,y:panY};canvas.style.cursor='grabbing';return}const r=world.getBoundingClientRect(),x=(e.clientX-r.left)/scale,y=(e.clientY-r.top)/scale;if(tool==='event'){const line=timelines.reduce((a,t,i)=>Math.abs(t.y-y)<Math.abs(timelines[a].y-y)?i:a,0),time=Math.round((x-ORIGIN)/STEP),id=Date.now();events.push({id,label:'New event',time,line,color:timelines[line].color,hour:'12:00',opacity:1,font:'Manrope',size:13});tool='select';activateTool();selectEvent(id)}else if(tool==='note'){notes.push({x,y,text:'Double-click to write a note',tag:'NOTE'});$('#noteCount').textContent=notes.length;tool='select';activateTool();render()}};
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();spaceHeld=true;canvas.style.cursor='grab'}});window.addEventListener('keyup',e=>{if(e.code==='Space'){spaceHeld=false;activateTool()}});
canvas.addEventListener('wheel',e=>{e.preventDefault();const old=scale;scale=Math.max(.25,Math.min(2,scale+(e.deltaY<0?.1:-.1)));const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;panX=x-(x-panX)*scale/old;panY=y-(y-panY)*scale/old;updateTransform()},{passive:false});
$$('.tool').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;activateTool()});function activateTool(){$$('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));canvas.style.cursor=tool==='event'?'crosshair':tool==='note'?'text':tool==='pan'?'grab':'grab'}
$('#zoomIn').onclick=()=>{scale=Math.min(2,scale+.1);updateTransform()};$('#zoomOut').onclick=()=>{scale=Math.max(.25,scale-.1);updateTransform()};$('#fitView').onclick=()=>{scale=.8;panX=-39500;panY=0;updateTransform()};
$('#addTimeline').onclick=()=>{const i=timelines.length;timelines.push({name:`Storyline ${i+1}`,color:['#8a70a1','#c19a55','#5681a5'][i%3],y:240+i*170,opacity:1,dash:false,width:2});renderTimelines();render()};
const bind=(id,key,convert=x=>x)=>$(id).onchange=e=>{const item=events.find(x=>x.id===selected);if(item){item[key]=convert(e.target.value);render()}};
$('#labelInput').oninput=e=>{const item=events.find(x=>x.id===selected);if(item){item.label=e.target.value;render()}};bind('#dayInput','time',Number);bind('#colorInput','color');bind('#timelineSelect','line',(_,e)=>e);
$('#timelineSelect').onchange=e=>{const item=events.find(x=>x.id===selected);if(item){item.line=e.target.selectedIndex;render()}};bind('#dashInput','dash',v=>v!=='Solid');bind('#opacityInput','opacity',v=>Math.max(0,Math.min(1,parseFloat(v)/100)));bind('#fontInput','font');bind('#fontSizeInput','size',Number);
$('#deleteEvent').onclick=()=>{events=events.filter(e=>e.id!==selected);selected=events[0]?.id;render()};
function togglePanel(side){const hidden=document.body.classList.toggle(`${side}-panel-hidden`),button=$(`#${side}PanelToggle`);button.textContent=side==='left'?(hidden?'›':'‹'):(hidden?'‹':'›')}
$('#leftPanelToggle').onclick=()=>togglePanel('left');$('#rightPanelToggle').onclick=()=>togglePanel('right');$('#closeInspector').onclick=()=>togglePanel('right');
function toggleDrawer(id,show){const el=$(id);el.classList.toggle('open',show);el.setAttribute('aria-hidden',String(!show));$('#drawerScrim').classList.toggle('open',show)}
$('#projectsToggle').onclick=()=>toggleDrawer('#projectsDrawer',true);$('#projectsClose').onclick=()=>toggleDrawer('#projectsDrawer',false);$('#drawerScrim').onclick=()=>{toggleDrawer('#projectsDrawer',false);toggleDrawer('#settingsPanel',false)};$('#settingsToggle').onclick=()=>toggleDrawer('#settingsPanel',true);$('#settingsClose').onclick=()=>toggleDrawer('#settingsPanel',false);
function projectData(){return {version:1,title:$('.project-name input').value,timeUnit,timelines,events,notes}}
$('#saveFile').onclick=()=>{const blob=new Blob([JSON.stringify(projectData(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${$('.project-name input').value.replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'story'}.storyline`;a.click();URL.revokeObjectURL(a.href)};
$('#openFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());timelines=data.timelines;events=data.events;notes=data.notes;timeUnit=data.timeUnit||'days';$('.project-name input').value=data.title||'Untitled';$('#timeUnit').value=timeUnit;renderTimelines();render();toggleDrawer('#projectsDrawer',false)}catch{alert('This project file could not be opened.')}};
$('#newProject').onclick=()=>{if(!confirm('Start a new project? Unsaved work will be lost.'))return;events=[];notes=[];$('.project-name input').value='Untitled story';render();toggleDrawer('#projectsDrawer',false)};
$('#timeUnit').onchange=e=>{timeUnit=e.target.value;render()};$('#themeSelect').onchange=e=>document.body.classList.toggle('dark',e.target.value==='dark');$('#themeToggle').onclick=()=>{document.body.classList.toggle('dark');$('#themeSelect').value=document.body.classList.contains('dark')?'dark':'light'};$('#gridToggle').onchange=e=>world.classList.toggle('no-grid',!e.target.checked);
function toggleLayer(button,name){const off=button.classList.toggle('off');document.body.classList.toggle(`hide-${name}`,off);button.querySelector('.eye').textContent=off?'○':'◉'}
$('#eventsLayer').onclick=()=>toggleLayer($('#eventsLayer'),'events');$('#notesLayer').onclick=()=>toggleLayer($('#notesLayer'),'notes');$('#gridLayer').onclick=()=>{const off=$('#gridLayer').classList.toggle('off');world.classList.toggle('no-grid',off);$('#gridLayer .eye').textContent=off?'○':'◉';$('#gridToggle').checked=!off};
renderTimelines();render();updateTransform();
