const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const {Brain}=require('../src/brain.js'),D=require('../data/connectome.json');
const source=['donghyun.js','brain.js','worker.js'].map(n=>fs.readFileSync(__dirname+'/../src/'+n,'utf8')).join('\n');
const exContext=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/../src/examples.js','utf8').replaceAll('export ','')+';globalThis.EX=examples;',exContext);
let tests=0;const check=(name,fn)=>{fn();tests++;console.log('PASS',name);};
check('Failed new run cannot reuse earlier observations; next valid run is unchanged',()=>{
  const queue=[],messages=[],c=vm.createContext({console,performance,setTimeout:fn=>queue.push(fn),postMessage:m=>messages.push(structuredClone(m))});c.self=c;vm.runInContext(source,c);
  const drain=()=>{let n=0;while(queue.length){queue.shift()();assert(++n<100000);}};
  c.onmessage({data:{type:'init',data:D}});
  c.onmessage({data:{type:'run',code:exContext.EX[0].code}});drain();const first=messages.at(-1);
  assert(first.allSamples.length>0);
  c.onmessage({data:{type:'run',code:'잘못된 시작'}});drain();const failed=messages.at(-1);
  assert.equal(failed.type,'error');assert.equal(failed.samples.length,0);assert.equal((failed.allSamples||[]).length,0);assert.equal(failed.steps,0);
  c.onmessage({data:{type:'run',code:exContext.EX[0].code}});drain();
  assert.deepStrictEqual(messages.at(-1).state,first.state);assert.deepStrictEqual(messages.at(-1).allSamples,first.allSamples);
});
check('Same code run again draws a new random seed; first run keeps the written seed',()=>{
  const queue=[],messages=[],c=vm.createContext({console,performance,setTimeout:fn=>queue.push(fn),postMessage:m=>messages.push(structuredClone(m))});c.self=c;vm.runInContext(source,c);
  const drain=()=>{let n=0;while(queue.length){queue.shift()();assert(++n<100000);}};
  c.onmessage({data:{type:'init',data:D}});const code=exContext.EX[0].code;
  c.onmessage({data:{type:'run',code}});drain();const first=messages.at(-1);assert.equal(first.state.seed,7);
  c.onmessage({data:{type:'run',code,repeat:true}});drain();const again=messages.at(-1);assert.notEqual(again.state.seed,7);assert(again.state.seed>=1&&again.state.seed<=2147483647);
  c.onmessage({data:{type:'run',code,repeat:true}});drain();assert.notEqual(messages.at(-1).state.seed,again.state.seed);
  c.onmessage({data:{type:'run',code}});drain();assert.deepStrictEqual(messages.at(-1).state,first.state);
});
check('CSR indices and counts',()=>{assert.equal(D.indptr.length,D.n+1);assert.equal(D.indptr.at(-1),D.post.length);assert.equal(D.cnt.length,D.post.length);for(let i=0;i<D.n;i++)assert(D.indptr[i]<=D.indptr[i+1]);for(const p of D.post)assert(p>=0&&p<D.n);for(const n of D.cnt)assert(Number.isInteger(n));});
check('No stimulus no spikes',()=>assert(new Brain(D,7).advance(1000).every(x=>x===0)));
check('Chunked state exactly equals uninterrupted model',()=>{const a=new Brain(D,7),b=new Brain(D,7);a.advance(1000,{1:100});for(let i=0;i<50;i++)b.advance(20,{1:100});assert.deepEqual(a.total,b.total);assert.deepEqual(a.v,b.v);});
check('Identical seed identical spikes',()=>assert.deepEqual(new Brain(D,7).advance(1000,{3:100}),new Brain(D,7).advance(1000,{3:100})));
const mean=(counts,indices)=>indices.reduce((a,i)=>a+counts[i],0)/indices.length;
const conditions={sugar:{1:100},bitterMix:{1:100,2:100},loomLeft:{3:100},loomRight:{4:100}};
const model={};
for(const [name,drives]of Object.entries(conditions)){
  model[name]=[];
  for(let seed=1;seed<=10;seed++){
    const b=new Brain(D,seed),t=performance.now(),c=b.advance(1000,drives);
    model[name].push({seed,wallMs:+(performance.now()-t).toFixed(1),MN9:mean(c,b.groups[5]),L:mean(c,b.groups[6]),R:mean(c,b.groups[7]),GF:mean(c,b.groups[8])});
  }
}
check('10 seeds sugar versus bitter',()=>{assert(model.sugar.every(r=>r.MN9>20));assert(model.bitterMix.every(r=>r.MN9<5));});
check('10 seeds looming laterality',()=>{assert(model.loomLeft.every(r=>r.R>20&&r.L===0&&r.GF>60));assert(model.loomRight.every(r=>r.L>20&&r.R===0&&r.GF>60));});
function execute(code,interrupt=false){
  let q=[],messages=[],time=0;
  const c=vm.createContext({console,performance,setTimeout:fn=>q.push(fn),postMessage:m=>messages.push(structuredClone(m))});
  c.self=c;vm.runInContext(source,c);
  c.onmessage({data:{type:'init',data:D}});c.onmessage({data:{type:'run',code}});
  if(interrupt)c.onmessage({data:{type:'halt'}});
  while(q.length){q.shift()();if(++time>200000)throw Error('test iteration guard');}
  return messages;
}
const runs={};
for(const ex of exContext.EX)check('Donghyun end-to-end '+ex.id,()=>{
  const msgs=execute(ex.code),last=msgs.at(-1);assert.equal(last.type,'done',JSON.stringify(last));runs[ex.id]=last;
});
check('Walk to sugar, suppress with bitter, then resume',()=>{const a=runs.taste.allSamples;const avg=r=>r.reduce((s,x)=>s+(x.MN9_L+x.MN9_R)/2,0)/r.length;assert(avg(a.filter(x=>x.ms>=3500&&x.ms<=5000))>20);assert(avg(a.filter(x=>x.ms>=7000))<5);assert(a.at(-1).distance>a.find(x=>x.ms===5000).distance+150);assert(runs.taste.state.encounters.sugar>0&&runs.taste.state.encounters.bitter>0);});
function program(commands){return '나는 동현이냐?\n'+commands.flatMap(a=>a.map(n=>'뿡뿡 '+exContext.number(n)+'~뿡뿡뿡')).join('\n')+'\n동현이구나';}
check('Output block and restoration',()=>{const last=execute(program([[1,7],[5,1,100],[7,2000],[6,5,1],[7,2000],[6,5,0],[7,2000]])).at(-1);const a=last.allSamples;assert(a.filter(x=>x.ms>2100&&x.ms<=4000).every(x=>x.MN9_L===0&&x.MN9_R===0));assert(a.filter(x=>x.ms>4500).some(x=>x.MN9_R>0));});
check('Replay exact trace and samples',()=>assert.deepEqual(execute(exContext.EX.find(x=>x.id==='obstacle').code).at(-1).allSamples,runs.obstacle.allSamples));
check('Every walking example actually walks',()=>{for(const [k,r]of Object.entries(runs))if(k!=='blank')assert(r.state.distance>100,`${k} distance=${r.state.distance}`);});
check('v0.5 wild examples tell their stories',()=>{const e=k=>runs[k].state.encounters,mn9=k=>{const s=runs[k].allSamples.at(-1);return (s.MN9_L+s.MN9_R)/2;};
  assert(runs.gfRush.state.distance>800);assert.equal(e('dineDash').sugar,4);assert.equal(e('ignoreSugar').sugar,5);assert(mn9('ignoreSugar')>10);
  assert(Math.max(...runs.panic.allSamples.map(x=>(x.GF_L+x.GF_R)/2))>100);assert(e('guard').obstacle<=3);assert.equal(e('bitterFeast').sugar,3);
  assert(runs.remote.state.time>20000&&e('remote').obstacle===0);});
check('v0.6 order keeps every example once and blank last',()=>{assert.equal(exContext.EX.length,21);assert.equal(new Set(exContext.EX.map(x=>x.id)).size,21);assert.equal(exContext.EX.at(-1).id,'blank');exContext.EX.forEach((x,i)=>assert(x.title.startsWith(String(i+1).padStart(2,'0')+' · ')));});
check('Blank example: start and end only, no time, movement or activity',()=>{assert.equal(runs.blank.code??exContext.EX.find(x=>x.id==='blank').code,'나는 동현이냐?\n\n동현이구나');assert.equal(runs.blank.state.time,0);assert.equal(runs.blank.state.distance,0);assert(runs.blank.allSamples.every(x=>x.active===0));});
check('Each of the two obstacles is encountered',()=>{for(const o of runs.obstacle.state.obstacles)assert(runs.obstacle.allSamples.some(s=>s.collision&&Math.hypot(s.x-o.x,s.y-o.y)<=o.r+11),'missed obstacle '+JSON.stringify(o));});
check('Two meals: stop, resume, stop again',()=>{const a=runs.twoMeals.allSamples;assert(runs.twoMeals.state.encounters.sugar>=3);assert(a.filter(x=>x.ms>=4000&&x.ms<=5000).every(x=>x.velocity===0));assert(a.some(x=>x.ms>5000&&x.velocity>0));assert.equal(a.at(-1).velocity,0);assert(a.at(-1).x>360);});
check('Two dopamine zones: two separated stimulus intervals',()=>{const a=runs.twoZones.allSamples;let n=0,on=false;for(const s of a){if(s.dopamineStim&&!on)n++;on=s.dopamineStim>0;}assert.equal(n,2);assert.equal(a.at(-1).dopamineStim,0);assert.equal(runs.twoZones.state.encounters.dopamine,2);});
check('Bitter block changes stopping without changing food',()=>{const a=runs.bitterBlock.allSamples;assert(a.filter(x=>x.ms>=4000&&x.ms<=5000).every(x=>x.velocity===0));assert(a.some(x=>x.ms>6000&&x.velocity>0));assert.equal(runs.bitterBlock.state.foods[0].bitter,100);});
check('Bitter then sugar visited physically',()=>{const e=runs.bitter.state.encounters;assert(e.sugar>=2&&e.bitter>=1);});
check('Obstacle encountered, no penetration',()=>{assert(runs.obstacle.state.encounters.obstacle>0);for(const s of runs.obstacle.allSamples)for(const o of runs.obstacle.state.obstacles)assert(Math.hypot(s.x-o.x,s.y-o.y)>=o.r+10-1e-8);});
check('Eight dopamine neurons have matching annotation',()=>{assert.equal(D.groups.dopamine_verified.length,8);for(const r of D.dopamine_metadata.cells){assert(r.known_nt.includes('dopamine')&&D.ids[r.index]===r.id);assert(D.cnt.slice(D.indptr[r.index],D.indptr[r.index+1]).every(x=>x>0));}});
check('Dopamine zone entered and left; measurable response',()=>{const a=runs.dopamine.allSamples;assert(runs.dopamine.state.encounters.dopamine>0);assert(a.filter(x=>x.dopamineStim>0).length>5);assert(a.filter(x=>x.dopamineStim>0).some(x=>x.DA>10));assert.equal(a.at(-1).dopamineStim,0);});
check('Dopamine has no artificial speed modifier',()=>{assert(!fs.readFileSync(__dirname+'/../src/worker.js','utf8').includes('speed*world.rates.DA'));for(const x of runs.dopamine.allSamples)assert(x.velocity<=40*1.2+1e-8);});
const errorCodes=[
  ['bad start','철수냐?\n동현이구나'],
  ['unknown command','나는 동현이냐?\n뿡뿡 도옹ㅠ~뿡뿡뿡\n동현이구나'],
  ['missing args','나는 동현이냐?\n뿡뿡 도오오오오옹~뿡뿡뿡\n동현이구나'],
  ['empty sensor queue','나는 동현이냐?\n동현아 꽥꽥\n동현이구나'],
  ['bad duration','나는 동현이냐?\n뿡뿡 도오오오오오오옹~뿡뿡뿡~뿡뿡 도옹~뿡뿡뿡\n동현이구나'],
  ['infinite loop','나는 동현이냐?\n신중동역 도오옹\n동현이구나']
];
for(const [name,code]of errorCodes)check('Guard '+name,()=>assert.equal(execute(code).at(-1).type,'error'));
check('Emergency Donghyun halt freezes time',()=>{const r=execute(exContext.EX.find(x=>x.id==='loomR').code,true);assert.equal(r.at(-1).type,'halted');assert(!r.slice(r.findIndex(x=>x.type==='halted')+1).length);});
check('Normal Donghyun halt tolerates incomplete packet',()=>assert.equal(execute('나는 동현이냐?\n뿡뿡 도오오오오옹~뿡뿡뿡\n오겡끼데스까\n동현이구나').at(-1).type,'done'));
const report={tests,model,experiments:Object.fromEntries(Object.entries(runs).map(([k,v])=>[k,{time:v.state.time,samples:v.allSamples.length,steps:v.steps,x:v.state.x,y:v.state.y,distance:v.state.distance,encounters:v.state.encounters,
  peakDA:Math.max(...v.allSamples.map(s=>s.DA)),lastDA:v.state.rates.DA}])),dataSHA256:crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/../data/connectome.json')).digest('hex')};
fs.writeFileSync(__dirname+'/core-results.json',JSON.stringify(report,null,2));console.log('TOTAL',tests);
