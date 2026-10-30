'use strict';
// Transcribed from the Skills and Languages sections of yimin_resume_Sp26_CG_v03.pdf.
const groups = {
  'CG': ['Autodesk Maya','Arnold','Redshift','V-Ray','Zbrush','Substance Painter','Cinema 4D','Houdini','Massive'],
  'VFX': ['Nuke','After Effects','SynthEyes','Mocha'],
  'Realtime': ['Unity','Unreal Engine','Motive','MotionBuilder','Touch Designer','Embergen'],
  '2D / Video': ['Photoshop','Illustrator','Indesign','Premiere'],
  'Development': ['Python','PySide2 / PyQt','Qt Designer','Unreal Blueprint','Mel','Maya API','C++','C#','JavaScript','VEX','GLSL / HLSL / Spark SL','Perforce / Git','Jira','Shotgun','Claude Code'],
  'Languages': ['English','Chinese']
};
const colors=['#a8f6dd','#c6b8ff','#9cccf8','#ffce9b','#c7e5ed','#f2b6cf'];
const universe=document.querySelector('#universe'), field=document.querySelector('#field'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches, listMode=reduced.matches, category='All', yaw=.3, pitch=-.15, dragging=false, lastX=0,lastY=0,lastTime=0, frame=0, selected=null;
const entries=Object.entries(groups).flatMap(([group,labels],g)=>labels.map(label=>({label,group,color:colors[g]})));
const count=entries.length;
document.querySelector('#detail-category').textContent=`${count} POINTS OF POSSIBILITY`;
const golden=Math.PI*(3-Math.sqrt(5));
entries.forEach((entry,i)=>{
  const y=1-2*(i+.5)/count, r=Math.sqrt(1-y*y), angle=i*golden;
  entry.point=[Math.cos(angle)*r,y,Math.sin(angle)*r];
  const button=document.createElement('button');button.className='skill';button.style.setProperty('--color',entry.color);button.setAttribute('aria-label',`${entry.label}, ${entry.group}`);
  for(let d=0;d<3;d++){const depth=document.createElement('span');depth.className='depth';depth.textContent=entry.label;depth.setAttribute('aria-hidden','true');button.append(depth);}
  const face=document.createElement('span');face.className='face';face.textContent=entry.label;button.append(face);field.append(button);entry.el=button;
  const inspect=()=>{selected=entry;entries.forEach(e=>e.el.classList.toggle('selected',e===entry));document.querySelector('#detail-category').textContent=entry.group.toUpperCase();document.querySelector('#detail').textContent=entry.label+' · From Yimin’s résumé';draw();};
  button.addEventListener('click',inspect);button.addEventListener('focus',inspect);
});
const filters=document.querySelector('#filters');
['All',...Object.keys(groups)].forEach(name=>{const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-pressed',name===category);b.addEventListener('click',()=>{category=name;filters.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',el===b));entries.forEach(e=>{e.el.hidden=category!=='All'&&e.group!==category;});renderList();draw();});filters.append(b);});
function renderList(){const list=document.querySelector('#skill-list');list.replaceChildren();Object.entries(groups).filter(([g])=>category==='All'||g===category).forEach(([g,labels])=>{const h=document.createElement('h3');h.textContent=g;list.append(h);const ul=document.createElement('ul');labels.forEach(label=>{const li=document.createElement('li');li.textContent=label;ul.append(li);});list.append(ul);});}
function sync(){document.querySelector('#pause').textContent=paused?'Resume motion':'Pause motion';document.querySelector('#pause').setAttribute('aria-pressed',paused);document.querySelector('#view').textContent=listMode?'Orbit view':'List view';document.querySelector('#view').setAttribute('aria-pressed',listMode);document.body.classList.toggle('list-mode',listMode);}
document.querySelector('#pause').addEventListener('click',()=>{paused=!paused;sync();schedule();});
document.querySelector('#view').addEventListener('click',()=>{listMode=!listMode;sync();resize();schedule();});
document.querySelector('#reset').addEventListener('click',()=>{yaw=.3;pitch=-.15;draw();});
universe.addEventListener('keydown',e=>{if(e.target!==universe||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();yaw+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;pitch+=e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0;draw();});
universe.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;dragging=true;lastX=e.clientX;lastY=e.clientY;universe.setPointerCapture(e.pointerId);universe.classList.add('dragging');});
universe.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-lastX)*.006;pitch=Math.max(-1.1,Math.min(1.1,pitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;draw();});
function stopDrag(){dragging=false;universe.classList.remove('dragging');}
universe.addEventListener('pointerup',stopDrag);universe.addEventListener('pointercancel',stopDrag);universe.addEventListener('lostpointercapture',stopDrag);
function draw(){if(listMode)return;const w=universe.clientWidth,h=universe.clientHeight,rx=Math.max(50,w*.34),ry=h*.36;entries.forEach(e=>{const [x,y,z]=e.point;const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw),yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch);const scale=.68+(depth+1)*.23;const extent=Math.max(0,w/2-e.el.offsetWidth*scale/2-10);const px=Math.max(-extent,Math.min(extent,xx*rx));e.el.style.transform=`translate(-50%,-50%) translate3d(${px}px,${yy*ry}px,0) scale(${scale})`;e.el.style.opacity=e===selected?1:.35+(depth+1)*.325;e.el.style.zIndex=Math.round((depth+1)*100);});}
const canvas=document.querySelector('#stars'),ctx=canvas.getContext('2d');
function resize(){if(listMode)return;const w=universe.clientWidth,h=universe.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;if(ctx){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);let seed=83;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}for(let i=0;i<160;i++){const x=random()*w,y=random()*h,r=random()*.9+.2;ctx.fillStyle=`rgba(180,220,240,${random()*.5+.1})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}}draw();}
function tick(time){frame=0;if(!paused&&!dragging&&!listMode&&!document.hidden&&!universe.contains(document.activeElement)&&!universe.matches(':hover')){yaw+=Math.min(time-lastTime,40)*.000055;draw();}lastTime=time;schedule();}
function schedule(){if(!frame&&!paused&&!listMode&&!document.hidden)frame=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',e=>{paused=e.matches;if(e.matches)listMode=true;sync();resize();schedule();});
new ResizeObserver(resize).observe(universe);renderList();sync();resize();schedule();
