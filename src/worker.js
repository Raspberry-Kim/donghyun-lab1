let slow=false;
/* Only the Donghyun VM's numeric output stream can mutate experiment state.
   Host messages: load data, run source, execute an emergency DH halt. */
let D,world,brain,vm,runId=0,running=false,pending=0,steps=0,elapsed=0,queue=[],packet=[],token='',history=[],logs=[],samples=[],wallStart=0;
const arity={1:1,2:3,3:5,4:3,5:2,6:2,7:1,8:1,9:1,10:0,11:1,12:5,13:3};
const names={1:'처음부터 시작',2:'출발 위치',3:'먹이 놓기',4:'장애물 놓기',5:'뉴런 자극',6:'뉴런 출력 차단',7:'관찰 시간',8:'관측값 읽기',9:'기본 걷기 속도',10:'직접 자극 끄기',11:'관측 기록',12:'자극 구역 놓기',13:'먹이 맛 바꾸기'};
function assert(ok,msg){if(!ok)throw new Error(msg);}
function bounded(v,a,b,label){assert(Number.isSafeInteger(v)&&v>=a&&v<=b,`${label}: ${a}~${b} 정수가 필요하다 (${v}).`);}
function reset(seed){
  brain=new FlyBrain.Brain(D,seed);world={time:0,x:320,y:200,angle:0,speed:0,foods:[],obstacles:[],zones:[],drives:{},seed,
    feed:0,jump:0,contact:false,mode:'출발 대기',rates:{MN9_L:0,MN9_R:0,DNa02_L:0,DNa02_R:0,GF_L:0,GF_R:0,DA:0},trace:[],active:0,
    distance:0,velocity:0,zoneContacts:[],foodContacts:[],collision:false,encounters:{sugar:0,bitter:0,obstacle:0,dopamine:0}};
  world.rng=FlyBrain.random(seed+12345);history=[];samples=[];queue=[];
}
function log(text){logs.push({time:world?.time||0,text});if(logs.length>150)logs.shift();}
/* Seed: the first run uses the seed written in code. Running the same code again shifts every seed by one random offset,
   so a repeat run draws new luck while seeds that are equal inside one program stay equal. */
let seedOffset=0,seedsUsed=[];
function pickSeedOffset(){const u=new Uint32Array(1);if(typeof crypto!=='undefined'&&crypto.getRandomValues)crypto.getRandomValues(u);else u[0]=Math.floor(Math.random()*4294967296);return 1+u[0]%2147483646;}
function runSeed(s){return seedOffset?(s-1+seedOffset)%2147483647+1:s;}
function command(p){
  const [op,...a]=p;
  if(op===1){bounded(a[0],1,2147483647,'난수 시드');const s=runSeed(a[0]);reset(s);seedsUsed.push(s);if(seedOffset)log(`다시 실행 · 새 시드 ${s} (코드의 시드 ${a[0]} 대신)`);}
  if(op===2){
    bounded(a[0],12,628,'x');bounded(a[1],12,388,'y');bounded(a[2],0,359,'방향');
    assert(!world.obstacles.some(o=>Math.hypot(a[0]-o.x,a[1]-o.y)<o.r+10),'시작 위치가 장애물과 겹친다.');
    [world.x,world.y]=a;world.angle=a[2]*Math.PI/180;world.trace=[];
  }
  if(op===3){
    bounded(a[0],0,640,'먹이 x');bounded(a[1],0,400,'먹이 y');bounded(a[2],5,200,'접촉 반경');
    bounded(a[3],0,200,'단맛 Hz');bounded(a[4],0,200,'쓴맛 Hz');assert(world.foods.length<20,'먹이는 최대 20개다.');
    world.foods.push({x:a[0],y:a[1],r:a[2],sugar:a[3],bitter:a[4]});
  }
  if(op===4){
    bounded(a[0],0,640,'장애물 x');bounded(a[1],0,400,'장애물 y');bounded(a[2],5,100,'장애물 반경');
    assert(Math.hypot(a[0]-world.x,a[1]-world.y)>=a[2]+10,'초파리와 겹치는 장애물은 놓을 수 없다.');
    assert(world.obstacles.length<20,'장애물은 최대 20개다.');world.obstacles.push({x:a[0],y:a[1],r:a[2]});
  }
  if(op===5){bounded(a[0],1,10,'그룹');bounded(a[1],0,200,'자극 Hz');world.drives[a[0]]=a[1];}
  if(op===6){bounded(a[0],1,10,'그룹');bounded(a[1],0,1,'차단 여부');for(const i of brain.groups[a[0]])brain.block[i]=a[1];}
  if(op===7){bounded(a[0],20,60000,'시간 ms');assert(a[0]%20===0,'시간은 20 ms의 배수로 써라.');assert(elapsed+a[0]<=120000,'한 실행의 실험 시간은 120초까지다.');pending=a[0];}
  if(op===8){
    bounded(a[0],1,12,'센서');
    const r=world.rates,values=[world.time,world.x,world.y,(world.angle*180/Math.PI%360+360)%360,
      (r.MN9_L+r.MN9_R)/2,r.DNa02_L,r.DNa02_R,(r.GF_L+r.GF_R)/2,world.active,world.contact?1:0,r.DA,world.distance];
    assert(queue.length<256,'관측 입력 큐가 가득 찼다. 꽥꽥으로 읽어라.');queue.push(Math.round(values[a[0]-1]));
  }
  if(op===9){bounded(a[0],0,70,'보행 속도');world.speed=a[0];}
  if(op===10)world.drives={};
  if(op===11)log(`동현랭 기록: ${a[0]}`);
  if(op===12){
    bounded(a[0],0,640,'구역 x');bounded(a[1],0,400,'구역 y');bounded(a[2],5,200,'구역 반경');bounded(a[3],1,10,'그룹');bounded(a[4],0,200,'자극 Hz');
    assert(world.zones.length<20,'자극 구역은 최대 20개다.');world.zones.push({x:a[0],y:a[1],r:a[2],group:a[3],hz:a[4]});
  }
  if(op===13){
    bounded(a[0],1,world.foods.length,'먹이 번호');bounded(a[1],0,200,'단맛 Hz');bounded(a[2],0,200,'쓴맛 Hz');
    const f=world.foods[a[0]-1];f.sugar=a[1];f.bitter=a[2];world.foodContacts=[];
  }
  if(op!==8&&op!==11)log(`${names[op]} ${a.join(', ')}`);
}
function accept(t){
  assert(/^[+-]?\d+$/.test(t),'실험 출력에는 줄바꿈으로 구분한 정수만 써라.');
  const n=Number(t);assert(Number.isSafeInteger(n),'출력 정수가 범위를 벗어났다.');
  if(!packet.length)assert(Object.hasOwn(arity,n),`알 수 없는 실험 명령 번호: ${n}`);
  packet.push(n);if(packet.length===arity[packet[0]]+1){const p=packet;packet=[];command(p);}
}
function write(s){
  for(const c of s){
    if(/\s/.test(c)){if(token){const t=token;token='';accept(t);}}
    else {token+=c;assert(token.length<=20,'출력 정수가 너무 길다. 뿡뿡뿡으로 줄을 나눠라.');}
  }
}
function tick(){
  const drives={...world.drives};world.contact=false;
  const foods=[],zones=[];
  for(const [i,f] of world.foods.entries())if(Math.hypot(world.x-f.x,world.y-f.y)<=f.r){
    foods.push(i);world.contact=true;drives[1]=Math.min(200,(drives[1]||0)+f.sugar);drives[2]=Math.min(200,(drives[2]||0)+f.bitter);
    if(!world.foodContacts.includes(i)){if(f.sugar)world.encounters.sugar++;if(f.bitter)world.encounters.bitter++;log(`먹이 ${i+1} 접촉 · ${f.bitter?'쓴맛':'단맛'}`);}
  }
  for(const [i,z] of world.zones.entries())if(Math.hypot(world.x-z.x,world.y-z.y)<=z.r){
    zones.push(i);drives[z.group]=Math.min(200,(drives[z.group]||0)+z.hz);
    if(!world.zoneContacts.includes(i)){if(z.group===10)world.encounters.dopamine++;log(`자극 구역 ${i+1} 진입 · ${z.group===10?'도파민성 뉴런':`그룹 ${z.group}`} ${z.hz} Hz`);}
  }
  world.foodContacts=foods;world.zoneContacts=zones;
  const counts=brain.advance(20,drives);history.push(counts);if(history.length>5)history.shift();
  const seconds=history.length*.02;
  for(const [k,ii]of Object.entries(D.read)){
    world.rates[k]=ii.reduce((sum,i)=>sum+(brain.block[i]?0:history.reduce((z,c)=>z+c[i],0)/seconds),0)/ii.length;
  }
  world.active=counts.reduce((s,c)=>s+(c>0),0);
  const r=world.rates,feeding=(r.MN9_L+r.MN9_R)/2>10,escaping=(r.GF_L+r.GF_R)/2>60;
  world.feed=feeding?1:0;world.jump=escaping?1:0;
  const turn=Math.max(-3,Math.min(3,(r.DNa02_R-r.DNa02_L)*.025));
  // Body mapping is a declared illustration. Baseline exploration is not connectome-derived.
  world.angle+=turn*.02+(world.speed>0?(world.rng()-.5)*.035:0);
  // v0.5: 같은 속도 값에서 이전보다 20% 더 멀리 걷는다. 명령 9의 범위는 0~70이다.
  const speed=feeding?0:world.speed*1.2*(escaping?1.6:1);
  const x=world.x+Math.cos(world.angle)*speed*.02,y=world.y+Math.sin(world.angle)*speed*.02;
  const blocked=x<12||x>628||y<12||y>388||world.obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+10);
  world.velocity=0;
  if(!blocked){world.distance+=Math.hypot(x-world.x,y-world.y);world.x=x;world.y=y;world.velocity=speed;}else if(speed>0)world.angle+=.04;
  if(blocked&&speed>0&&!world.collision){world.encounters.obstacle++;log('벽·장애물 접촉 · 몸체 규칙으로 방향 전환');}
  world.collision=blocked&&speed>0;
  world.mode=feeding?'단맛 반응 · 주둥이 들기':escaping?'도피 신호 · 방향 전환':blocked&&speed>0?'막힌 길에서 방향 전환':speed>0?'걷는 중':'잠깐 멈춤';
  world.time+=20;elapsed+=20;
  if(world.time%100===0){
    world.trace.push([world.x,world.y]);if(world.trace.length>1200)world.trace.shift();
    samples.push({ms:world.time,...world.rates,x:world.x,y:world.y,active:world.active,distance:world.distance,velocity:world.velocity,
      dopamineStim:drives[10]||0,sugarStim:drives[1]||0,bitterStim:drives[2]||0,collision:world.collision?1:0});
  }
}
function snapshot(type='frame',extra={}){
  const {rng,...state}=world;
  postMessage({type,state,logs:logs.slice(-12),samples:samples.slice(-100),steps,line:vm?.currentLine||1,phys:vm&&!vm.done?(vm.stmts?.[vm.pc]?.phys||0):0,slow,...extra});
}
function fail(e){running=false;log(`오류: ${e.message}`);snapshot('error',{error:e.message,line:e.line||vm?.currentLine});}
function loop(id){
  if(!running||id!==runId)return;
  const start=performance.now();
  try{
    if(pending){tick();pending-=20;}
    else{
      let budget=0;
      while(running&&!pending&&!vm.done&&budget++<(slow?1:500)){
        vm.step(1);steps++;assert(steps<=1000000,'100만 문장 한도에 도달했다. 반복 조건을 확인하라.');
      }
      if(vm.done){
        if(vm.halted){running=false;packet=[];token='';pending=0;log(`오겡끼데스까 · 종료 코드 ${vm.exitCode}`);}
        else {
          if(token){const t=token;token='';accept(t);}
          assert(!packet.length,'명령 인수가 부족하다. 조작 규약의 인수 개수를 확인하라.');
          if(!pending){running=false;log('프로그램 완료 · 동현이구나');}
        }
      }
    }
    if(slow||world.time%100===0||!running)snapshot(running?'frame':'done',running?{}:{allSamples:samples,wallMs:performance.now()-wallStart});
    if(running)setTimeout(()=>loop(id),pending?Math.max(0,20-(performance.now()-start)):(slow?260:0));
  }catch(e){fail(e);}
}
onmessage=({data:m})=>{
  try{
    if(m.type==='speed'){slow=!!m.slow;return;}
    if(m.type==='init'){D=m.data;reset(1);snapshot('ready');return;}
    if(m.type==='halt'){
      // A fixed, visible Donghyun program is interpreted, rather than a direct movement control.
      const h=new Donghyun.VM('나는 동현이냐?\n오겡끼데스까\n동현이구나');h.run();
      if(h.halted){running=false;runId++;pending=0;packet=[];token='';log('오겡끼데스까 · 긴급 중단 코드 실행');snapshot('halted',{allSamples:samples});}return;
    }
    if(m.type==='run'){
      runId++;running=false;seedOffset=m.repeat?pickSeedOffset():0;seedsUsed=[];reset(runSeed(1));logs=[];steps=0;elapsed=0;pending=0;packet=[];token='';vm=null;slow=!!m.slow;
      assert(typeof m.code==='string'&&m.code.length<=100000,'코드는 100,000자까지다.');
      const candidate=new Donghyun.VM(m.code,{write,readInt:()=>{assert(queue.length>0,'먼저 명령 8로 관측값을 요청하고 꽥꽥으로 읽어라.');return queue.shift();}});
      // Each run is a fresh experiment session; no automatic simulation before code advances time.
      vm=candidate;
      running=true;wallStart=performance.now();log(seedOffset?'동현랭 프로그램 시작 · 같은 코드를 다시 실행해 새 시드를 쓴다':'동현랭 프로그램 시작');snapshot();loop(runId);
    }
  }catch(e){fail(e);}
};
