(function(){
const W=720,H=640,CX=360,TY=290,SPOT_Y=372;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const FONT='"Comic Sans MS",system-ui,sans-serif';
let S=1,T={};

const robotImg = new Image();
robotImg.src = 'robot3d.png';
const dummyImg = new Image();
dummyImg.src = 'dummy3d.png'; 

function readTheme(){const cs=getComputedStyle(document.documentElement);['bg','ink','muted','grid','grid2','panel','line','accent','neutral','screen','warn'].forEach(k=>T[k]=cs.getPropertyValue('--'+k).trim())}
function resize(){const r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;cv.width=Math.round(r.width*d);cv.height=Math.round(r.width*H/W*d);S=cv.width/W}
window.addEventListener('resize',resize);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',readTheme);

const DOCS=[
{n:'Kardioloq',s:'Sinə ağrısı',c:'#e5484d'},
{n:'Nevroloq',s:'Baş gicəllənməsi',c:'#8e4ec6'},
{n:'Ortoped',s:'Diz ağrısı',c:'#f5a524'},
{n:'Göz həkimi',s:'Görmə bulanıqlığı',c:'#3e63dd'},
{n:'Pediatr',s:'Uşaqda hərarət',c:'#12a594'},
{n:'Terapevt',s:'Boğaz ağrısı',c:'#6e9a1f'}];
DOCS.forEach((d,i)=>{d.x=18+i*116;d.w=104;d.y=24;d.h=80;d.cx=d.x+52;d.count=0;d.flash=0});

let mode='ai',speed=1,rate=30,t=0,acc=0,queue=[],leaving=[],serving=null,serveT=0,serveDur=1,lastMsg=null,route=null;
let stats={ai:{n:0,sum:0},rec:{n:0,sum:0}};
const rnd=Math.random;

function slot(i){const row=i%8,col=Math.floor(i/8),o=[0,42,-42,84,-84,126];return{x:CX+o[col%6],y:SPOT_Y+row*34}}
function spawn(){if(queue.length>=40)return;const d=DOCS[Math.floor(rnd()*DOCS.length)];
const p={x:CX+(rnd()-.5)*20,y:H+24,ang:0,doc:d,arr:t,state:'queue',color:null,path:null,alpha:1};queue.push(p)}
function move(p,tx,ty,sp,dt){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
if(d>.5){const m=Math.min(d,sp*dt);p.x+=dx/d*m;p.y+=dy/d*m;if(d>3){const ta=Math.atan2(dy,dx)+Math.PI/2;let da=ta-p.ang;da=Math.atan2(Math.sin(da),Math.cos(da));p.ang+=da*Math.min(1,dt*10)}}
return d}

function update(dt){
t+=dt;acc+=dt*rate/60;while(acc>=1){acc--;spawn()}
queue.forEach((p,i)=>{const s=slot(i);move(p,s.x,s.y,170,dt)});
if(!serving&&queue[0]){const s=slot(0);if(Math.hypot(queue[0].x-s.x,queue[0].y-s.y)<3){
serving=queue[0];serving.state='service';serveT=0;
serveDur=mode==='ai'?.6+rnd()*.3:3.5+rnd()*3;serving.mode=mode;
stats[mode].n++;stats[mode].sum+=t-serving.arr}}
if(serving){serveT+=dt;if(serveT>=serveDur){const p=serving,d=p.doc;
p.color=d.c;p.state='leave';p.path=[{x:CX,y:350},{x:d.cx,y:350},{x:d.cx,y:112}];
queue.shift();leaving.push(p);serving=null;d.flash=1;
lastMsg={t:t,text:p.doc.s+' → '+d.n,mode:p.mode};route={d:d,t:t};served++}}
for(let i=leaving.length-1;i>=0;i--){const p=leaving[i];
if(p.path.length){const g=p.path[0];if(move(p,g.x,g.y,230,dt)<2)p.path.shift()}
else{p.alpha-=dt*5;if(p.alpha<=0){p.doc.count++;leaving.splice(i,1)}}}
DOCS.forEach(d=>{d.flash=Math.max(0,d.flash-dt*1.4)});
}
let served=0;

function dummy(x, y, ang, col, a){
ctx.save();
ctx.translate(x, y);

ctx.globalAlpha = a * 0.25;
ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.ellipse(2, 4, 15, 10, 0, 0, Math.PI * 2);
ctx.fill();

ctx.rotate(ang);
ctx.globalAlpha = a;

if(dummyImg.complete && dummyImg.naturalWidth !== 0) {
    ctx.drawImage(dummyImg, -30, -25, 60, 60);
} else {
    // Ehtiyat həndəsi fiqur ölçüsü
    ctx.beginPath();
    ctx.roundRect(-20, -125, 28, 36, 10);
    ctx.fillStyle = col || T.neutral;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = T.ink;
    ctx.stroke();
}
ctx.restore();
}

function txt(s,x,y,size,col,w,al){ctx.font=(w||400)+' '+size+'px '+FONT;ctx.fillStyle=col;ctx.textAlign=al||'center';ctx.textBaseline='middle';ctx.fillText(s,x,y)}

function drawGrid(){ctx.lineWidth=1;
for(let pass=0;pass<2;pass++){ctx.beginPath();ctx.strokeStyle=pass?T.grid2:T.grid;
for(let x=0;x<=W;x+=30){if((x%120===0)===!!pass){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H)}}
for(let y=0;y<=H;y+=30){if((y%120===0)===!!pass){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5)}}
ctx.stroke()}}

function drawDocs(){DOCS.forEach(d=>{
ctx.beginPath();ctx.roundRect(d.x,d.y,d.w,d.h,10);ctx.fillStyle=T.panel;ctx.fill();
if(d.flash>0){ctx.globalAlpha=d.flash*.28;ctx.fillStyle=d.c;ctx.fill();ctx.globalAlpha=1}
ctx.lineWidth=1.5;ctx.strokeStyle=T.line;ctx.stroke();
ctx.beginPath();ctx.roundRect(d.x,d.y,d.w,7,[10,10,0,0]);ctx.fillStyle=d.c;ctx.fill();
txt(d.n,d.cx,d.y+30,13.5,T.ink,600);
txt(d.count+' pasiyent',d.cx,d.y+52,12,T.muted,400);
ctx.fillStyle=T.bg;ctx.fillRect(d.cx-14,d.y+d.h-2,28,4);
ctx.fillStyle=d.c;ctx.fillRect(d.cx-14,d.y+d.h-1,28,2)})}

function drawRoute(){if(!route)return;const a=1-(t-route.t)/1.1;if(a<=0){route=null;return}
const d=route.d;ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=d.c;ctx.lineWidth=3;ctx.setLineDash([8,7]);
ctx.lineDashOffset=-t*60;ctx.beginPath();ctx.moveTo(CX,350);ctx.lineTo(d.cx,350);ctx.lineTo(d.cx,106);ctx.stroke();ctx.restore()}

function drawRobot(){
const cx=CX,cy=TY;
const scanning=serving&&mode==='ai';

ctx.save();
if(robotImg.complete && robotImg.naturalWidth !== 0) {
    ctx.drawImage(robotImg, cx - 46, cy - 50, 90, 100);
} else {
    ctx.beginPath();
    ctx.roundRect(cx - 25, cy - 35, 50, 70, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = T.ink;
    ctx.stroke();
}

if(scanning){
const k=serveT/serveDur,y1=cy+10,y2=SPOT_Y-12;
ctx.beginPath();ctx.moveTo(cx-6,y1);ctx.lineTo(cx+6,y1);ctx.lineTo(cx+18,y2);ctx.lineTo(cx-18,y2);ctx.closePath();
ctx.globalAlpha=.18;ctx.fillStyle=T.accent;ctx.fill();
const yy=y1+(y2-y1)*k,hw=6+12*k;ctx.globalAlpha=.95;ctx.strokeStyle=T.accent;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(cx-hw,yy);ctx.lineTo(cx+hw,yy);ctx.stroke();ctx.globalAlpha=1;
}

ctx.restore();
txt('TerminalNous(Mini)', cx, cy + 48, 11, T.ink, 600);
}

function drawDesk(){const cx=CX,cy=TY;
dummy(cx, cy-22, Math.PI, T.warn, 1);
ctx.beginPath();ctx.arc(cx,cy-22,0,0,1);
ctx.beginPath();ctx.roundRect(cx-80,cy-4,160,42,10);ctx.fillStyle=T.panel;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=T.ink;ctx.stroke();
txt('Resepsiyonist',cx,cy+17,12,T.ink,600);
if(serving&&mode==='rec'){const k=Math.min(1,serveT/serveDur);ctx.fillStyle=T.grid2;ctx.fillRect(cx-60,cy+44,120,5);ctx.fillStyle=T.warn;ctx.fillRect(cx-60,cy+44,120*k,5)}}

function bubble(text,x,y,col){ctx.font='500 13px '+FONT;const w=ctx.measureText(text).width+22,h=28;
ctx.beginPath();ctx.roundRect(x,y-h/2,w,h,9);ctx.fillStyle=T.bg;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle=col;ctx.stroke();
txt(text,x+11,y,13,T.ink,500,'left')}

function draw(){ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=T.bg;ctx.fillRect(0,0,W,H);
drawGrid();drawDocs();drawRoute();
if(mode==='ai')drawRobot();else drawDesk();
let msg=null,col=mode==='ai'?T.accent:T.warn;
if(serving)msg=mode==='ai'?'Skan edilir…':'Şikayət dinlənilir…';
else if(lastMsg&&t-lastMsg.t<1.6){msg=lastMsg.text;col=lastMsg.mode==='ai'?T.accent:T.warn}
if(msg)bubble(msg,CX+(mode==='ai'?52:90),TY-8,col);
leaving.forEach(p=>dummy(p.x,p.y,p.ang,p.color,Math.max(0,p.alpha)));
for(let i=queue.length-1;i>=0;i--){const p=queue[i];dummy(p.x,p.y,p.ang,T.neutral,1)}
ctx.setLineDash([6,5]);ctx.strokeStyle=T.muted;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(CX-34,H-30,68,24,6);ctx.stroke();ctx.setLineDash([]);
txt('Giriş',CX,H-18,12,T.muted,500);
if(queue.length>=40)txt('Növbə doludur',CX,H-44,12,T.warn,600)}

const $=id=>document.getElementById(id);
function fmt(s){return s.n?(s.sum/s.n).toFixed(1).replace('.',',')+' san':'—'}
let uiLast=0;
function ui(now){if(now-uiLast<250)return;uiLast=now;
$('wAi').textContent=fmt(stats.ai);$('wRec').textContent=fmt(stats.rec);
$('qLen').textContent=queue.length;$('served').textContent=served}
function setMode(m){mode=m;$('mAi').setAttribute('aria-pressed',m==='ai');$('mRec').setAttribute('aria-pressed',m==='rec')}
$('mAi').onclick=()=>setMode('ai');$('mRec').onclick=()=>setMode('rec');
$('rate').oninput=e=>{rate=+e.target.value;$('rateV').textContent=rate+' pasiyent/dəq'};
document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{speed=+b.dataset.sp;document.querySelectorAll('[data-sp]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
$('reset').onclick=()=>{queue=[];leaving=[];serving=null;lastMsg=null;route=null;t=0;acc=0;served=0;stats={ai:{n:0,sum:0},rec:{n:0,sum:0}};DOCS.forEach(d=>{d.count=0;d.flash=0})};

let last=performance.now();
function frame(now){let dt=Math.min(.1,(now-last)/1000)*speed;last=now;
const n=Math.max(1,Math.ceil(dt/.04)),h=dt/n;for(let i=0;i<n;i++)update(h);
draw();ui(now);requestAnimationFrame(frame)}
readTheme();resize();requestAnimationFrame(frame);
})();
