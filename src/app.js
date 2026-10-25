import {examples} from './examples.js';
const $=s=>document.querySelector(s),canvas=$('#arena'),ctx=canvas.getContext('2d'),chart=$('#chart'),cc=chart.getContext('2d');
let worker,ready=false,busy=false,state=null,samples=[],allSamples=[],lastSource='',lastFrame=0,previous=null,blobURL='',faultTimer;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const colors={MN9:'#986613',L:'#276f7a',R:'#a44b35',GF:'#6d6385',DA:'#8e3e90'};
const fallback={time:0,x:440,y:200,angle:0,foods:[],obstacles:[],zones:[],trace:[],drives:{},feed:0,jump:0,velocity:0,mode:'출발 대기'};
$('#theme').setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='dark'));
$('#theme').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').setAttribute('aria-pressed',String(dark));drawArena(performance.now());drawChart();};
for(const ex of examples){const o=document.createElement('option');o.value=ex.id;o.textContent=ex.title;$('#example').append(o);}
// 동현랭 편집기와 같은 문법 색 표시
const DH_TOKEN=/(ㅋㅋ.*$)|(나는 동현이냐\?|동현이구나)|(오겡끼데스까)|(신중동역|신중동|뭉치)|(뿡뿡뿡|뿡뿡|포동이)|(꽥꽥)|(동+현아)|(동+현)|(도오*옹)|(ㅠ+)|(뚱띠|또치)/g;
const DH_CLS=[null,'t-cmt','t-frame','t-halt','t-ctl','t-out','t-in','t-assign','t-var','t-num','t-minus','t-op'];
const dhEsc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function dhLine(line){let html='',last=0;line.replace(DH_TOKEN,(m,...g)=>{const idx=g[g.length-2];html+=dhEsc(line.slice(last,idx));const k=g.slice(0,11).findIndex(x=>x!==undefined)+1;html+=`<span class="${DH_CLS[k]}">${dhEsc(m)}</span>`;last=idx+m.length;return m;});return html+dhEsc(line.slice(last));}
const dhCode=document.getElementById('code');
const dhArea=document.createElement('div');dhArea.className='code-area';
const dhHl=document.createElement('div');dhHl.id='hl';dhHl.setAttribute('aria-hidden','true');
dhCode.parentNode.insertBefore(dhArea,dhCode);dhArea.append(dhHl,dhCode);
function dhSync(){dhHl.scrollTop=dhCode.scrollTop;dhHl.scrollLeft=dhCode.scrollLeft;}
function dhMetrics(){const cs=getComputedStyle(dhCode);for(const p of ['paddingTop','paddingRight','paddingBottom','paddingLeft','fontFamily','fontSize','lineHeight','tabSize','letterSpacing'])dhHl.style[p]=cs[p];}
function dhHighlight(){dhMetrics();dhHl.innerHTML=dhCode.value.split('\n').map(l=>`<span class="ln">${dhLine(l)||' '}</span>`).join('')+'<span class="ln"> </span>';dhSync();}
dhCode.addEventListener('scroll',dhSync);addEventListener('resize',dhHighlight);
function codeChanged(){const count=$('#code').value.split('\n').length;$('#line-count').textContent=`${count}줄` ;$('#lines').textContent=Array.from({length:count},(_,i)=>i+1).join('\n');dhHighlight();}
function selectExample(){
  const ex=examples.find(x=>x.id===$('#example').value);
  $('#code').value=ex.code;$('#example-note').textContent=ex.note;codeChanged();
  if(!$('#welcome').hidden){$('#welcome h3').textContent=ex.title.slice(5);$('#welcome p').textContent=ex.id==='blank'?'자극과 보행이 없는 1초 대조 실험이다. 여기에 나만의 코드를 더해 보자.':'코드를 몰라도 시작할 수 있다. 실행을 누르고 초파리의 산책을 지켜보자.';}
}
selectExample();$('#example').onchange=selectExample;$('#code').addEventListener('input',codeChanged);
$('#code').onscroll=()=>{$('#lines').scrollTop=$('#code').scrollTop;};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);if(x===b)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!=='tab-'+b.dataset.tab);
  if(b.dataset.tab==='lab'){drawArena(performance.now());drawChart();}
});
function showReference(key){
  document.querySelectorAll('[data-reference]').forEach(b=>{
    const active=b.dataset.reference===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-reference-panel]').forEach(p=>p.hidden=p.dataset.referencePanel!==key);
}
document.querySelectorAll('[data-reference]').forEach(b=>b.onclick=()=>showReference(b.dataset.reference));
function openReferenceTarget(hash){
  let id;try{id=decodeURIComponent(hash.slice(1));}catch{return false;}
  const target=document.getElementById(id),panel=target?.closest('[data-reference-panel]');
  if(!panel)return false;
  document.querySelector('[data-tab="science"]').click();showReference(panel.dataset.referencePanel);
  for(let node=target;node&&node!==panel.parentElement;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
  requestAnimationFrame(()=>{target.scrollIntoView({block:'start'});if(target.hasAttribute('tabindex'))target.focus({preventScroll:true});});
  return true;
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  if(openReferenceTarget(a.getAttribute('href'))){
    e.preventDefault();try{history.replaceState(null,'',a.getAttribute('href'));}catch{}
  }
}));
window.addEventListener('hashchange',()=>openReferenceTarget(location.hash));
if(location.hash)openReferenceTarget(location.hash);
$('.brand').onclick=e=>{e.preventDefault();document.querySelector('[data-tab="lab"]').click();window.scrollTo(0,0);};
function setBusy(b){busy=b;$('#run').disabled=!ready||b;$('#start').disabled=!ready||b;$('#halt').disabled=!b;}
function run(){
  if(!ready||busy)return;
  const code=$('#code').value;
  if(code.length>100000){$('#result').textContent='코드는 100,000자까지다.';$('#result').className='result error';return;}
  lastSource=code;allSamples=[];samples=[];$('#csv').disabled=true;
  $('#welcome').hidden=true;$('#result').className='result';$('#result').textContent='동현랭 코드 실행 중. 편집 내용은 다음 실행에 적용된다.';
  $('#status').textContent='실험 중';$('#status').className='status running';
  setBusy(true);worker.postMessage({type:'run',code});clearTimeout(faultTimer);
}
$('#run').onclick=run;$('#start').onclick=run;
$('#halt').onclick=()=>{
  if(!busy)return;worker.postMessage({type:'halt'});
  // Infrastructure watchdog is not an alternative experiment control.
  faultTimer=setTimeout(()=>{if(busy){worker.terminate();ready=false;setBusy(false);$('#result').textContent='계산 스레드가 응답하지 않아 종료했다. 페이지를 새로고침하라.';$('#result').className='result error';}},1500);
};
$('#code').addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();run();}});
function download(name,type,content){const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);}
$('#save').onclick=()=>download('초파리-실험.dh','text/plain;charset=utf-8',$('#code').value);
$('#open').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  if(f.size>400000){$('#result').textContent='코드 파일이 너무 크다. 400 KB 이하 파일을 골라라.';$('#result').className='result error';e.target.value='';return;}
  const txt=await f.text();if(txt.length>100000){$('#result').textContent='코드는 100,000자까지다.';e.target.value='';return;}
  $('#code').value=txt;codeChanged();$('#example-note').textContent=`불러온 파일: ${f.name}. 실행 전까지 환경은 바뀌지 않는다.`;e.target.value='';
};
$('#csv').onclick=()=>{
  const rows=allSamples.length?allSamples:samples,keys=['ms','MN9_L','MN9_R','DNa02_L','DNa02_R','GF_L','GF_R','DA','x','y','active','distance','velocity','dopamineStim','sugarStim','bitterStim','collision'];
  const quote=x=>'"'+String(x).replaceAll('"','""')+'"';
  const meta=[['# model','동현초 1.1 / FlyWire v783 / 1758 neurons / 121135 edges'],['# data','FlyWire Consortium / reduced, reindexed; not endorsed by FlyWire. Noncommercial use following FlyWire guidelines (CC BY-NC 4.0); Zenodo 10676866 metadata lists CC BY 4.0. See credits for discrepancy.'],['# credits','https://flywire.ai/guidelines'],['# seed',state?.seed],['# code',lastSource]];
  download('초파리-관측.csv','text/csv;charset=utf-8','\ufeff'+meta.map(r=>r.map(quote).join(',')).join('\n')+'\n'+keys.join(',')+'\n'+rows.map(r=>keys.map(k=>Number(r[k]).toFixed(k==='ms'?0:3)).join(',')).join('\n'));
};
function receive(m){
  clearTimeout(faultTimer);
  if(m.state){previous=state;state=m.state;lastFrame=performance.now();}
  if(m.samples)samples=m.samples;if(m.allSamples)allSamples=m.allSamples;
  const r=state?.rates||{};
  $('#clock').textContent=((state?.time||0)/1000).toFixed(2)+' s';
  $('#behavior').textContent=state?.mode||'대기';
  $('#mn9').innerHTML=((r.MN9_L+r.MN9_R)/2||0).toFixed(0)+' <small>Hz</small>';
  $('#dna').innerHTML=(r.DNa02_L||0).toFixed(0)+' / '+(r.DNa02_R||0).toFixed(0)+' <small>Hz</small>';
  $('#gf').innerHTML=((r.GF_L+r.GF_R)/2||0).toFixed(0)+' <small>Hz</small>';
  $('#da').innerHTML=(r.DA||0).toFixed(0)+' <small>Hz</small>';
  $('#travel').textContent=`${(state?.distance||0).toFixed(0)} 단위 이동`;
  const daZone=state?.zoneContacts?.some(i=>state.zones[i]?.group===10);
  $('#zone-status').textContent=daZone?'DA 구역 · 도파민성 뉴런 자극 중':'';
  $('#steps').textContent=(m.steps||0).toLocaleString()+'문장';
  if(m.logs?.length){$('#log').replaceChildren(...m.logs.map(l=>{const li=document.createElement('li'),t=document.createElement('time'),s=document.createElement('span');t.textContent=(l.time/1000).toFixed(2);s.textContent=l.text;li.append(t,s);return li;}));$('#log').scrollTop=$('#log').scrollHeight;}
  if(m.type==='ready'){ready=true;setBusy(false);$('#status').textContent='회로 준비 완료';}
  if(m.type==='frame'){$('#status').textContent='실험 중';$('#status').className='status running';}
  if(['done','halted','error'].includes(m.type)){
    setBusy(false);$('#status').className='status'+(m.type==='error'?' error':'');$('#status').textContent=m.type==='error'?'실행 오류':m.type==='halted'?'중단됨':'실험 완료';
    $('#result').className='result'+(m.type==='error'?' error':'');
    $('#result').textContent=m.type==='error'?`${m.line||'?'}번 문장: ${m.error}`:m.type==='halted'?'오겡끼데스까. 실험을 멈췄다. 다시 실행하면 처음부터 시작한다.':`${(state.time/1000).toFixed(1)}초 동안 ${state.distance.toFixed(0)} 단위 이동했다. 다른 예제나 코드로 다시 실험해 보자.`;
    $('#csv').disabled=!(samples.length||allSamples.length);
  }
  drawChart();drawArena(performance.now());
}
async function init(){
  try{
    let text,data;
    if(window.FLY_EMBED){text=window.FLY_EMBED.worker;data=window.FLY_EMBED.data;}
    else{
      const [wr,dr]=await Promise.all([fetch('./worker.bundle.js'),fetch('./connectome.json')]);
      if(!wr.ok||!dr.ok)throw new Error('회로 또는 실행기 파일을 읽지 못했다.');
      text=await wr.text();data=await dr.json();
    }
    if(data.n!==1758||data.post.length!==121135)throw new Error('회로 데이터 검증 실패');
    blobURL=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));worker=new Worker(blobURL);
    worker.onmessage=e=>receive(e.data);
    worker.onerror=e=>{ready=false;setBusy(false);$('#status').textContent='실행기 오류';$('#result').textContent='계산 스레드를 시작하지 못했다. 페이지를 새로고침하라.';$('#result').className='result error';};
    worker.postMessage({type:'init',data});
  }catch(e){$('#status').textContent='불러오기 실패';$('#status').className='status error';$('#result').textContent=e.message+' 새로고침하여 다시 시도하라.';$('#result').className='result error';}
}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function sugarCube(x,y,scale=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineWidth=1.7;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.fillStyle='#fff9e7';ctx.strokeStyle='#9b8054';ctx.beginPath();ctx.roundRect(-16,-15,32,30,7);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#dfcd9d';ctx.beginPath();ctx.moveTo(-10,-9);ctx.lineTo(7,-9);ctx.stroke();
  circle(-6,-1,1.7,'#69513b');circle(6,-1,1.7,'#69513b');
  circle(-10,5,2.5,'#edb7a0');circle(10,5,2.5,'#edb7a0');
  ctx.strokeStyle='#69513b';ctx.beginPath();ctx.arc(0,3,3.5,0,Math.PI);ctx.stroke();ctx.restore();
}
function bitterBottle(x,y,scale=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineWidth=1.7;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.fillStyle='#f6e3d9';ctx.strokeStyle='#956b60';ctx.beginPath();ctx.roundRect(-14,-9,28,27,9);ctx.fill();ctx.stroke();
  ctx.fillStyle='#e6a694';ctx.beginPath();ctx.roundRect(-10,1,20,13,6);ctx.fill();
  ctx.fillStyle='#bdceb3';ctx.beginPath();ctx.roundRect(-7,-18,14,10,3);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#785145';ctx.beginPath();ctx.moveTo(-7,-1);ctx.lineTo(-4,1);ctx.lineTo(-7,3);ctx.moveTo(7,-1);ctx.lineTo(4,1);ctx.lineTo(7,3);ctx.stroke();
  ctx.beginPath();ctx.arc(0,10,3,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();
}
function pebble(o){
  ctx.save();ctx.translate(o.x,o.y);ctx.lineWidth=1.8;ctx.lineCap='round';
  circle(0,0,o.r,'#b8c5a8','#758365');
  ctx.strokeStyle='#dce5cc';ctx.lineWidth=Math.max(2,o.r*.08);ctx.beginPath();ctx.arc(0,0,o.r*.77,3.7,4.6);ctx.stroke();
  const k=o.r/35;ctx.scale(k,k);ctx.lineWidth=1.8;ctx.strokeStyle='#58614b';
  for(const x of [-9,9]){ctx.beginPath();ctx.arc(x,0,3.2,0,Math.PI);ctx.stroke();}
  circle(-15,7,3,'#d8bfa2');circle(15,7,3,'#d8bfa2');
  ctx.beginPath();ctx.arc(0,5,3.2,0,Math.PI);ctx.stroke();
  ctx.restore();
}
// v0.9 (2026-10-25): a cartoon pixel-art fly redrawn from a reference sketch. Segmented orange abdomen, thorax and a round
// head (head : thorax = 3 : 2) with big round eyes, three pairs of legs, toned-down see-through wings under the body,
// and the exaggerated sipping straw. Drawn cell by cell (head +x). Physics and the collision radius are unchanged.
const FLY_PX=1.1786,flySprites=new Map();
const FLY_FRAMES=[[".........................................", "..........l..........l...................", "..........ll.........l........l..........", "...........ll........l.......l...........", "............l........l.....ll............", ".............ll......ll....l.............", "..............lll.....l....l.............", "................ll....l....l..ooooooo....", "........ooooo....ll...l...lloofffooooo...", ".....ooobbsbbooo..lloolo.l.offffokeeeooaa", "...oobsbbbsbbbsboo.lttttl.offffokkwnneao.", "..obbsbbbsbbbbsbbbotthhttooffffokennneao.", ".obbbsbbbsbbbsbbbbothhhttofffhfokknnneoo.", ".obbbsbbbsbbbsbbbotttttttoffhhhfokeeeoo..", ".obbbsbbbsbbbsbbbotttttttoffhhhffoooofo..", ".obbbsbbbsbbbsbbbotttttttoffhhhfooeeooo..", ".obbbsbbbsbbbsbbbotttttttofffhffokwnnao..", "..obbsbbbsbbbbsbbbottttttooffffokknnneao.", "...obsbbbbsbbbsbbo.ltttttooffffokknnneao.", "....oosbbbsbbbsoo.llottool.offffokeeeooaa", "......ooooooooo..ll..ol...llofffooeeooo..", "................ll....l....l.ooooooooo...", "..............lll.....l....l......oo.....", ".............ll......ll....l.............", "............l........l.....ll............", "...........ll........l.......l...........", "..........ll.........l........l..........", "..........l..........l...................", "........................................."], [".........................................", ".........l.........ll....................", ".........ll.........l.........ll.........", "...........l........ll.......ll..........", "............l........l.....lll...........", ".............ll......ll....l.............", "..............lll.....l....l.............", "................ll....l....l..ooooooo....", "........ooooo....ll...l...lloofffooooo...", ".....ooobbsbbooo..lloolo.l.offffokeeeooaa", "...oobsbbbsbbbsboo.lttttl.offffokkwnneao.", "..obbsbbbsbbbbsbbbotthhttooffffokennneao.", ".obbbsbbbsbbbsbbbbothhhttofffhfokknnneoo.", ".obbbsbbbsbbbsbbbotttttttoffhhhfokeeeoo..", ".obbbsbbbsbbbsbbbotttttttoffhhhffoooofo..", ".obbbsbbbsbbbsbbbotttttttoffhhhfooeeooo..", ".obbbsbbbsbbbsbbbotttttttofffhffokwnnao..", "..obbsbbbsbbbbsbbbottttttooffffokknnneao.", "...obsbbbbsbbbsbbo.ltttttooffffokknnneao.", "....oosbbbsbbbsoo.llottool.offffokeeeooaa", "......ooooooooo..ll..ol...llofffooeeooo..", "................ll....l....l.ooooooooo...", "..............lll.....l....l......oo.....", ".............ll......ll....l.............", "............l........l.....lll...........", "...........l........ll.......ll..........", ".........ll.........l.........ll.........", ".........l.........ll....................", "........................................."]];
const FLY_WINGS=[".........................................", ".........................................", "......ggggggg............................", ".....gWWWWWWWgg..........................", ".....gWWWQQQWWWgg........................", ".....gWWWWQQQWWWWg.......................", "......gWWWWWWWWWWWg......................", ".......gWWWWWWWWWWWg.....................", ".............WWWWWWg.....................", "................WWWW.....................", "..................WW.....................", ".........................................", ".........................................", ".........................................", ".........................................", ".........................................", ".........................................", ".........................................", "..................Wg.....................", ".................WWW.....................", "...............WWWWWg....................", ".......gWWWWWWWWWWWg.....................", "......gWWWWWWWWWWWg......................", "......gWWWWQQWWWWg.......................", ".....gWWWQQQWWWWg........................", ".....gWWQQWWWWgg.........................", "......ggWWgggg...........................", "........gg...............................", "........................................."];
function flySprite(leg,feed,dark,sip=0){
  const key=leg+'|'+feed+'|'+dark+'|'+sip;if(flySprites.has(key))return flySprites.get(key);
  const col={o:'#4a3328',b:'#e8662a',s:'#a8461f',t:'#ec6f2c',h:'#f8a866',f:'#f07a2e',e:'#fffaf2',k:'#bcd3da',n:'#2b211d',w:'#ffffff',
    l:dark?'#d8bd9d':'#4a3328',a:dark?'#d8bd9d':'#4a3328',W:dark?'rgba(150,160,156,.74)':'rgba(178,186,182,.78)',Q:dark?'rgba(196,204,198,.8)':'rgba(214,220,214,.84)',g:dark?'#a3aca8':'#686e6a'};
  const rows=FLY_FRAMES[leg],mouth=37,straw=feed?18:0,w=feed?mouth+straw:rows[0].length,h=rows.length,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  const paint=(r,y)=>[...r].forEach((c,x)=>{if(c==='.')return;g.fillStyle=col[c];g.fillRect(x,y,1,1);});
  rows.forEach(paint);FLY_WINGS.forEach(paint);
  if(feed){ // Cartoon straw: real flies sponge food with a short proboscis.
    const x0=mouth,c=(h-1)/2;
    for(let x=x0;x<x0+straw;x++){
      const end=x>=x0+straw-3,half=end?3:2; // same on-screen straw as before, in the finer cells
      g.fillStyle='#7d5c43';g.fillRect(x,c-half-1,1,half*2+3);
      for(let y=c-half;y<=c+half;y++){g.fillStyle=((x+y+sip)%4<2)?'#e2493a':'#fff6ec';g.fillRect(x,y,1,1);}
    }
    g.fillStyle='#f3cf63';g.fillRect(x0+straw-4-((sip*4)%(straw-4)),c,3,1); // a sugar sip travelling to the mouth
  }
  const out={canvas:cv,x0:-24,y0:-h/2*FLY_PX,w,h};flySprites.set(key,out);return out;
}
function drawArena(now){
  const s=state||fallback,ratio=Math.min(1,(now-lastFrame)/100);
  const arenaFont=Math.max(12,12*640/(canvas.getBoundingClientRect().width||640));
  let x=s.x,y=s.y,a=s.angle;
  if(previous&&busy&&!reduced&&Math.hypot(s.x-previous.x,s.y-previous.y)<20){x=previous.x+(s.x-previous.x)*ratio;y=previous.y+(s.y-previous.y)*ratio;a=previous.angle+(s.angle-previous.angle)*ratio;}
  ctx.setTransform(1.5,0,0,1.5,0,0);ctx.clearRect(0,0,640,400);
  const dark=document.documentElement.dataset.theme==='dark';
  ctx.fillStyle=dark?'#2b2621':'#efe7d8';ctx.fillRect(0,0,640,400);
  ctx.strokeStyle=dark?'#3d362f':'#e4d8c3';ctx.lineWidth=.55;
  for(let i=20;i<640;i+=20){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,400);ctx.stroke();}
  for(let i=20;i<400;i+=20){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(640,i);ctx.stroke();}
  ctx.strokeStyle=dark?'#544b40':'#d0c2aa';ctx.lineWidth=1;ctx.strokeRect(12,12,616,376);
  for(const [i,f]of s.foods.entries()){
    circle(f.x,f.y,f.r,f.bitter?'#bd857630':'#e2bd4c38',f.bitter?'#b1786899':'#c7a34499');
    const iconScale=Math.min(1.15,f.r/(f.bitter&&f.sugar?32:23));
    if(f.bitter&&f.sugar){sugarCube(f.x-12*iconScale,f.y+3*iconScale,iconScale*.8);bitterBottle(f.x+12*iconScale,f.y-2*iconScale,iconScale*.8);}
    else if(f.bitter)bitterBottle(f.x,f.y,iconScale);
    else if(f.sugar)sugarCube(f.x,f.y,iconScale);
    else {circle(f.x,f.y,4,dark?'#d0c2aa':'#9b8d78');}
    ctx.fillStyle=dark?'#efe6d8':'#6e6356';ctx.font=arenaFont+'px "Pretendard"';
    ctx.textAlign='center';ctx.fillText((f.bitter?(f.sugar?'쓴맛 혼합':'쓴맛'):f.sugar?'설탕':'무자극 먹이')+' '+(i+1),f.x,f.y-f.r-7);
  }
  for(const [i,z]of (s.zones||[]).entries()){
    const hit=s.zoneContacts?.includes(i);
    ctx.setLineDash([5,4]);circle(z.x,z.y,z.r,hit?'#aa65b12b':'#aa65b115',dark?'#c7a0d4':'#9b65a6');ctx.setLineDash([]);
    ctx.fillStyle=dark?'#dfb6ea':'#82518d';ctx.font=arenaFont+'px "Pretendard"';ctx.textAlign='center';
    ctx.fillText(z.group===10?'DA 자극 구역':`자극 구역 ${i+1}`,z.x,z.y-z.r-7);
    ctx.font=(arenaFont*.9)+'px "Nanum Gothic Coding"';ctx.fillText(z.hz+' Hz',z.x,z.y+z.r+arenaFont);
  }
  for(const o of s.obstacles)pebble(o);
  if(s.trace.length>1){ctx.strokeStyle='#75866c80';ctx.lineWidth=1.1;ctx.setLineDash([2,3]);ctx.beginPath();s.trace.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.stroke();ctx.setLineDash([]);}
  // Loom arcs represent direct stimulation, not an optical forward model.
  if(s.drives[3]||s.drives[4]){
    ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle='#a44b35aa';ctx.lineWidth=2;
    for(const [g,sign]of [[3,-1],[4,1]])if(s.drives[g])for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(0,0,30+j*9,sign>0?.35:-2.8,sign>0?2.8:-.35);ctx.stroke();}
    ctx.restore();
  }
  // v0.9: cartoon pixel-art fly. Physics and the collision radius are unchanged.
  const moving=busy&&s.velocity>0&&!reduced;
  const sprite=flySprite(moving?Math.floor(now/110)%2:0,!!s.feed,dark,reduced?0:Math.floor(now/90)%4);
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(.94*.95,.94*.95);ctx.imageSmoothingEnabled=false;
  if(s.jump){ctx.shadowColor='#a87d3566';ctx.shadowBlur=8;}
  ctx.drawImage(sprite.canvas,sprite.x0,sprite.y0,sprite.w*FLY_PX,sprite.h*FLY_PX);
  ctx.restore();
  ctx.textAlign='left';ctx.font=(arenaFont*.85)+'px "Nanum Gothic Coding"';ctx.fillStyle=dark?'#efe6d8':'#6e6356';ctx.fillText('01',x+24,y-21);
}
function drawChart(){
  const box=chart.getBoundingClientRect();if(box.width===0)return;
  const dpr=Math.min(2,devicePixelRatio||1),w=box.width,h=box.height,left=35,right=w-12,top=18,bottom=h-26;
  chart.width=Math.round(w*dpr);chart.height=Math.round(h*dpr);cc.setTransform(dpr,0,0,dpr,0,0);
  const dark=document.documentElement.dataset.theme==='dark';
  const palette=dark?{MN9:'#f0b35a',L:'#7cc0f0',R:'#f0705c',GF:'#b1b0ca',DA:'#e7a7ed'}:colors;
  cc.clearRect(0,0,w,h);cc.font='12px "Nanum Gothic Coding"';cc.fillStyle=dark?'#a89c8c':'#6e6356';cc.textAlign='right';
  const value=(r,k)=>k==='MN9'?(r.MN9_L+r.MN9_R)/2:k==='GF'?(r.GF_L+r.GF_R)/2:k==='DA'?(r.DA||0):r[k==='L'?'DNa02_L':'DNa02_R'];
  const max=Math.max(100,Math.ceil(Math.max(0,...samples.flatMap(r=>Object.keys(colors).map(k=>value(r,k))))/50)*50);
  for(let j=0;j<=2;j++){let y=bottom-(bottom-top)*j/2;cc.strokeStyle=dark?'#3d362f':'#e4d8c3';cc.beginPath();cc.moveTo(left,y);cc.lineTo(right,y);cc.stroke();cc.fillText(String(Math.round(max*j/2)),left-9,y+5);}
  const end=Math.max(10000,state?.time||0),start=end-10000;
  for(const [k,col]of Object.entries(palette)){cc.strokeStyle=col;cc.lineWidth=1.6;cc.beginPath();samples.forEach((r,i)=>{const x=left+(r.ms-start)/10000*(right-left),y=bottom-value(r,k)/max*(bottom-top);if(i)cc.lineTo(x,y);else cc.moveTo(x,y);});cc.stroke();}
  cc.textAlign='left';cc.fillText((start/1000).toFixed(0)+' s',left,h-8);cc.textAlign='right';cc.fillText((end/1000).toFixed(0)+' s',right,h-8);
  if(!samples.length){cc.textAlign='center';cc.font='12px "Pretendard"';cc.fillText('실행 후 신경 출력이 여기에 기록된다',(left+right)/2,(top+bottom)/2);}
}
function animate(now){if(!$('#tab-lab').hidden&&busy&&!reduced)drawArena(now);requestAnimationFrame(animate);}
drawArena(performance.now());drawChart();requestAnimationFrame(animate);init();
document.fonts.ready.then(()=>{drawArena(performance.now());drawChart();});
window.addEventListener('resize',()=>{drawArena(performance.now());drawChart();});
window.addEventListener('pagehide',()=>{worker?.terminate();if(blobURL)URL.revokeObjectURL(blobURL);});
window.addEventListener('pageshow',e=>{
  if(e.persisted){ready=false;setBusy(false);state=null;previous=null;samples=[];allSamples=[];$('#csv').disabled=true;$('#status').textContent='회로 다시 불러오는 중';$('#result').textContent='다시 돌아왔다. 편집한 코드는 유지되며, 실행하면 새 실험을 시작한다.';init();}
});
