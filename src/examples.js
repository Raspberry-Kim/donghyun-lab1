// These are ordinary Donghyun v1.52 programs. Only their output controls the experiment.
export function number(n){
  if(n===0)return '도옹ㅠ';
  if(n<0)return 'ㅠ '+number(-n);
  if(n<=10)return '도'+'오'.repeat(n-1)+'옹';
  for(let a=10;a>=2;a--)if(n%a===0)return number(a)+' '+number(n/a);
  return '도'+'오'.repeat(n-1)+'옹';
}
const out=n=>'뿡뿡 '+(typeof n==='string'?n:number(n))+'~뿡뿡뿡';
const cmd=(op,...args)=>[op,...args].map(out).join('~');
const block=(label,op,...args)=>'ㅋㅋ '+label+'\n'+cmd(op,...args);
const wrap=lines=>['나는 동현이냐?',...lines,'동현이구나'].join('\n');
const reset=block('같은 시드 7이면 같은 산책을 재현한다',1,7);
const start=(x=70,y=200,speed=45)=>[reset,block('왼쪽에서 오른쪽을 향해 출발',2,x,y,0),block('기본 걷기 속도',9,speed)];
// v0.5: 더 거칠게 움직이는 예제 10개. 도우미 이름이 화면 코드와 겹치지 않도록 이 묶음 안에 둔다.
const wildExamples=(()=>{
  const V=n=>'동'.repeat(n)+'현';
  const lit=c=>'도'+'오'.repeat(c-1)+'옹';
  const set=(n,expr,label)=>{if(label&&label.includes('~'))throw Error('주석에 ~: '+label);return (label?'ㅋㅋ '+label+'\n':'')+V(n)+'아 '+expr;};
  const read=(n,sensor,label)=>block(label||('관측 '+sensor+' 요청'),8,sensor)+'\n'+V(n)+'아 꽥꽥';
  const go=label=>'신중동역 @'+label;
  const ifZero=(expr,label)=>'신중동 '+expr+'? 신중동역 @'+label;
  const ifNeg=(expr,label)=>'뭉치 '+expr+'? 신중동역 @'+label;
  // 이동문을 위해 @이름 표시를 실제 문장 번호의 동현랭 식으로 바꾼다. 문장 번호는 줄이 아니라 `~`로 나눈 조각 순번이다.
  function asm(parts){
    const lines=['나는 동현이냐?'],labels={};let count=1;
    for(const p of parts)if(typeof p==='string')for(const l of p.split('\n'))if(l.startsWith('ㅋㅋ')&&l.includes('~'))throw Error('주석에 ~가 있으면 문장이 나뉜다: '+l);
    for(const p of parts){if(typeof p==='object'){labels[p.label]=count+1;continue;}for(const l of p.split('\n')){lines.push(l);count+=l.split('~').length;}}
    lines.push('동현이구나');
    return lines.map(l=>l.replace(/@(\w+)/g,(_,k)=>{if(!labels[k])throw Error('없는 표시 '+k);return number(labels[k]);})).join('\n');
  }
  const L=label=>({label});
  const resetW=(seed=7)=>block('같은 시드 '+seed+'이면 같은 소동을 재현한다',1,seed);
  const begin=(x,y,a,speed,seed=7)=>[resetW(seed),block('출발 위치와 방향',2,x,y,a),block('기본 걷기 속도 '+speed,9,speed)];
  // countdown guard: v = n; at loop head decrement and exit when zero
  const W=[];
  W.push({id:'gfRush',title:'12 · 폭주 / 걸어온 거리로 굴리는 주사위',
   note:'거대섬유(DNp01)를 100 Hz로 계속 자극해 1.6배 빠르기로 달리게 한다. 0.5초마다 동현랭이 지금까지 걸어온 거리를 읽고, 그 값이 짝수면 왼쪽 DNa02, 홀수면 오른쪽 DNa02를 150 Hz로 자극한다. 걸음의 작은 흔들림이 거리를 바꾸므로 주사위처럼 쓸 수 있다. 15초 동안 방 안을 어지럽게 휘젓는다.',
   code:asm([...begin(80,200,0,60,3),block('거대섬유 양쪽 100 Hz',5,8,100),set(1,lit(30),'0.5초씩 30번 = 15초'),set(3,'','왼쪽 횟수'),set(4,'','오른쪽 횟수'),
    L('loop'),read(2,12,'누적 이동 거리 요청'),set(2,V(2)+' 또치 도오옹','2로 나눈 나머지'),
    ifZero(V(2),'left'),go('right'),
    L('left'),block('짝수: 왼쪽 DNa02 150 Hz',5,6,150)+'\n'+cmd(5,7,0),set(3,V(3)+'도옹'),go('run'),
    L('right'),block('홀수: 오른쪽 DNa02 150 Hz',5,7,150)+'\n'+cmd(5,6,0),set(4,V(4)+'도옹'),
    L('run'),block('0.5초 달리기',7,500),set(1,V(1)+'ㅠ'),ifZero(V(1),'done'),go('loop'),
    L('done'),block('왼쪽으로 꺾은 횟수',11,V(3)),block('오른쪽으로 꺾은 횟수',11,V(4)),read(5,12,'누적 이동 거리 요청'),block('누적 이동 거리',11,V(5)),block('직접 자극 해제',10),block('1초 관찰',7,1000)])});
  W.push({id:'zigzag',title:'13 · 좌우 연타 / DNa02 지그재그 난동',
   note:'오른쪽과 왼쪽 DNa02를 0.4초씩 번갈아 150 Hz로 자극하는 일을 8번 되풀이한다. DNa02는 걷는 초파리의 크고 빠른 방향 전환을 예측하는 하강 뉴런이다. 거대섬유도 80 Hz로 함께 자극해 빠르게 달리게 한다. 반복 횟수는 동현랭의 변수와 이동문으로 센다.',
   code:asm([...begin(40,200,0,60),block('거대섬유 80 Hz로 질주 유지',5,8,80),set(1,lit(8),'남은 지그재그 횟수 8'),
    block('처음은 반만: 왼쪽 DNa02 0.2초',5,6,150),block('',7,200),
    L('loop'),block('오른쪽 DNa02 켜고 왼쪽 끄기',5,7,150)+'\n'+cmd(5,6,0),block('0.4초 오른쪽으로 꺾기',7,400),
    block('왼쪽 DNa02 켜고 오른쪽 끄기',5,6,150)+'\n'+cmd(5,7,0),block('0.4초 왼쪽으로 꺾기',7,400),
    set(1,V(1)+'ㅠ','횟수 하나 줄이기'),ifZero(V(1),'done'),go('loop'),
    L('done'),read(2,12,'누적 이동 거리 요청'),block('거리 기록',11,V(2)),block('모든 직접 자극 해제',10),block('1초 관찰',7,1000)])});
  W.push({id:'spiral',title:'14 · 회오리 / 점점 커지는 나선, 그리고 발사',
   note:'오른쪽 DNa02를 100 Hz로 계속 자극해 제자리에서 돌게 하고, 0.6초마다 걷기 속도를 4씩 올린다. 같은 회전에 빠르기만 커지니 원이 점점 커지는 나선이 된다. 속도가 60에 이르면 DNa02를 끄고 거대섬유를 자극해 나선 밖으로 곧게 튀어 나간다.',
   code:asm([resetW(7),block('방 한가운데에서 출발',2,320,200,0),block('오른쪽 DNa02 100 Hz',5,7,100),set(1,lit(8),'처음 걷기 속도 8'),
    L('loop'),block('현재 속도 적용',9,V(1)),block('0.6초 돌기',7,600),set(1,V(1)+lit(4),'속도 4 올리기'),
    set(2,'ㅠ '+number(64)),set(2,V(1)+V(2),'64를 빼서 음수면 아직 덜 빠르다'),ifNeg(V(2),'loop'),
    block('오른쪽 DNa02 끄기',5,7,0),block('거대섬유 150 Hz로 발사',5,8,150),block('2초 직진',7,2000),block('직접 자극 해제',10),block('1초 관찰',7,1000)])});
  // 조향 핵심: V(7)에 목표 방향(도)을 넣어 두면 오차 = (목표 + 540 − 방향) mod 360 − 180을 계산해 DNa02로 꺾는다.
  const steerCore=(tag,hz)=>[set(8,number(540)),set(7,V(7)+V(8)),read(6,4,'방향 요청'),set(9,'ㅠ '+V(6)),set(7,V(7)+V(9)),set(7,V(7)+' 또치 '+V(10),'360으로 나눈 나머지'),
    set(9,'ㅠ '+number(180)),set(7,V(7)+V(9),'방향 오차'),set(8,V(7)+V(11)),ifNeg(V(8),tag+'n'),block('오차가 +: 오른쪽 DNa02',5,7,hz)+'\n'+cmd(5,6,0),go(tag+'e'),
    L(tag+'n'),set(8,V(7)+V(12)),ifNeg(V(8),tag+'l'),block('거의 맞음: 곧게',5,6,0)+'\n'+cmd(5,7,0),go(tag+'e'),
    L(tag+'l'),block('오차가 −: 왼쪽 DNa02',5,6,hz)+'\n'+cmd(5,7,0),L(tag+'e')];
  const steerSetup=[set(10,number(360),'조향용 360'),set(11,'ㅠ '+lit(8),'조향 기준 −8'),set(12,lit(8),'조향 기준 +8')];
  // 줄 따라 걷기: 목표 방향 = (기준 y − 지금 y) ÷ 2도.
  const holdLine=(tag,yLine)=>[read(6,3,'y 요청'),set(9,'ㅠ '+V(6)),set(8,number(yLine)),set(7,V(8)+V(9),yLine+' − y'),set(7,V(7)+' 뚱띠 도오옹','절반을 목표 방향으로'),...steerCore(tag,100)];
  W.push({id:'dineDash',title:'15 · 먹튀 / 한 입 먹고 경보로 달아나기',
   note:'설탕 네 덩이가 한 줄로 놓여 있다. 동현랭이 0.1초마다 먹이 접촉을 읽다가, 접촉하면 1.5초 동안 먹게 둔 뒤 양쪽 LPLC2에 경보를 넣는다. 이 연결망에서는 경보가 MN9를 0으로 떨어뜨리고 거대섬유를 깨워, 초파리가 먹다 말고 달아난다. 걷는 동안에는 동현랭이 높이와 방향을 읽어 DNa02로 줄을 따라가게 한다. 실제 초파리도 머리 위 그림자가 거듭 지나가면 먹다 말고 먹이를 떠난다고 보고되었다(Gibson 등, 2015).',
   code:asm([...begin(50,200,0,60),
    block('설탕 1',3,170,200,28,100,0),block('설탕 2',3,300,200,28,100,0),block('설탕 3',3,430,200,28,100,0),block('설탕 4',3,560,200,28,100,0),
    set(1,'','먹고 달아난 횟수 0'),set(5,number(200),'안전장치: 접촉 확인 최대 200번'),...steerSetup,
    L('poll'),set(5,V(5)+'ㅠ'),ifZero(V(5),'end'),block('0.1초 걷기',7,100),read(2,10,'먹이 접촉 요청'),'신중동 '+V(2)+'? 신중동역 @steer',go('eat'),
    L('steer'),...holdLine('h',200),go('poll'),
    L('eat'),block('조향 끄기',10),set(1,V(1)+'도옹','한 덩이 더'),block('몇 번째 먹이인지 기록',11,V(1)),block('1.5초 동안 먹게 둔다',7,1500),read(3,5,'MN9 평균 Hz 요청'),block('먹는 중 MN9 기록',11,V(3)),
    block('양쪽 LPLC2 경보 100 Hz',5,3,100)+'\n'+cmd(5,4,100),
    L('flee'),block('0.1초 달아나기',7,100),read(2,10,'먹이 접촉 요청'),ifZero(V(2),'away'),go('flee'),
    L('away'),block('0.3초 더 달아나기',7,300),block('경보 끄기',10),
    set(4,'ㅠ '+lit(4)),set(4,V(1)+V(4),'네 덩이를 다 털었는지 확인'),ifZero(V(4),'end'),go('poll'),
    L('end'),block('직접 자극 해제',10),block('1초 관찰',7,1000)])});
  W.push({id:'ignoreSugar',title:'16 · 설탕 무시 질주 / 네 덩이는 지나치고',
   note:'설탕 네 덩이가 한 줄로, 그 끝에 큰 설탕 하나가 놓여 있다. MN9 출력을 막아 두었으므로 단맛 GRN이 반응해도 멈추지 않고 질주한다. 동현랭은 먹이 접촉이 0에서 1로 바뀔 때마다 지나친 설탕을 세고, 높이와 방향을 읽어 DNa02로 줄을 따라가게 한다. 네 덩이를 다 지나치면 MN9를 되살리고 질주를 멈춘다. 마지막 큰 설탕에서 비로소 멈추는지 보자.',
   code:asm([...begin(40,200,0,60),
    block('설탕 1',3,130,200,22,100,0),block('설탕 2',3,220,200,22,100,0),block('설탕 3',3,310,200,22,100,0),block('설탕 4',3,400,200,22,100,0),block('끝의 큰 설탕',3,540,200,45,100,0),
    block('MN9 출력 차단',6,5,1),block('거대섬유 70 Hz로 질주',5,8,70),...steerSetup,set(1,'','지나친 설탕 0'),set(3,'','직전 접촉 0'),set(5,number(120),'안전장치: 최대 12초'),
    L('poll'),block('0.1초',7,100),read(2,10,'먹이 접촉 요청'),
    set(4,'ㅠ '+V(3)),set(4,V(2)+V(4),'지금 − 직전: 1이면 새 설탕에 막 올라섰다'),set(3,V(2)),
    set(4,V(4)+'ㅠ'),'신중동 '+V(4)+'? '+V(1)+'아 '+V(1)+'도옹',
    set(6,V(1)+'ㅠ ',''),set(6,'ㅠ '+lit(4)),set(6,V(1)+V(6),'네 덩이를 다 지나쳤나'),'신중동 '+V(6)+'? 신중동 '+V(3)+'? 신중동역 @done',
    set(5,V(5)+'ㅠ'),ifZero(V(5),'done'),...holdLine('h',200),go('poll'),
    L('done'),block('지나친 설탕 수 기록',11,V(1)),block('질주와 조향 해제',10),block('MN9 출력 복원',6,5,0),
    block('끝까지 4초',7,4000),read(2,5,'MN9 평균 Hz 요청'),block('복원 뒤 MN9 기록',11,V(2)),block('먹는 모습 1초',7,1000)])});
  W.push({id:'pinball',title:'17 · 핀볼 / 부스터와 스핀 패드',
   note:'방에 돌 범퍼 여섯 개, 거대섬유 부스터 패드 세 개(150 Hz), 네 모서리와 양옆 벽의 오른쪽 DNa02 스핀 패드 여섯 개(200 Hz)를 깔았다. 벽을 따라 미끄러지던 초파리가 스핀 패드에 들어서면 방 안쪽으로 튕겨 나온다. 동현랭은 판만 짜고 25초를 흘려보낼 뿐, 어디로 튈지는 회로와 몸체 규칙이 정한다.',
   code:asm([...begin(60,200,0,60,11),
    block('범퍼 1',4,200,120,20),block('범퍼 2',4,320,280,20),block('범퍼 3',4,450,120,20),block('범퍼 4',4,200,290,16),block('범퍼 5',4,460,280,16),block('범퍼 6',4,320,120,14),
    block('부스터 1',12,130,200,36,8,150),block('부스터 2',12,320,200,36,8,150),block('부스터 3',12,510,200,36,8,150),
    block('스핀 왼쪽 위',12,30,30,60,7,200),block('스핀 오른쪽 위',12,610,30,60,7,200),block('스핀 왼쪽 아래',12,30,370,60,7,200),block('스핀 오른쪽 아래',12,610,370,60,7,200),
    block('스핀 위 벽',12,320,10,40,7,200),block('스핀 아래 벽',12,320,390,40,7,200),
    block('25초 동안 판을 돌린다',7,25000),read(1,12,'누적 이동 거리 요청'),block('거리 기록',11,V(1))])});
  W.push({id:'panic',title:'18 · 패닉 / 한쪽에서만 쏟아지는 경보',
   note:'0.25초짜리 경보를 왼쪽 LPLC2에만 8번, 이어서 오른쪽에만 8번 넣고 그 사이 0.25초씩 쉰다. 경보마다 거대섬유가 깨어 달음박질치고, 한쪽 경보는 반대쪽 DNa02를 움직여 경보에서 먼 쪽으로 몸을 튼다. 같은 쪽 경보가 거듭되면 그 꺾임이 쌓인다. 경보 직후 거대섬유 출력을 기록한다. 실제 초파리도 위협이 반복되면 달리기와 도약이 늘고 한동안 이어진다는 보고가 있지만(Gibson 등, 2015) 이 모델에는 그런 지속 상태가 없다.',
   code:asm([...begin(80,90,0,45),set(1,lit(8),'왼쪽 경보 8번'),
    L('left'),block('왼쪽 경보 0.25초',5,3,150),block('',7,240),read(2,8,'거대섬유 Hz 요청'),block('왼쪽 경보 직후 거대섬유',11,V(2)),block('경보 해제',10),block('0.25초 쉼',7,260),
    set(1,V(1)+'ㅠ'),ifZero(V(1),'swap'),go('left'),
    L('swap'),set(1,lit(8),'오른쪽 경보 8번'),
    L('right'),block('오른쪽 경보 0.25초',5,4,150),block('',7,240),read(2,8,'거대섬유 Hz 요청'),block('오른쪽 경보 직후 거대섬유',11,V(2)),block('경보 해제',10),block('0.25초 쉼',7,260),
    set(1,V(1)+'ㅠ'),ifZero(V(1),'done'),go('right'),L('done'),block('2초 관찰',7,2000)])});
  W.push({id:'guard',title:'19 · 벽 앞의 급회전 / 동현랭 반사 신경',
   note:'거대섬유로 빠르게 달리는 초파리의 위치를 동현랭이 0.1초마다 읽는다. 벽에서 80 안쪽으로 들어서면 그 벽의 반대쪽을 목표 방향으로 정하고, 왼쪽이나 오른쪽 DNa02를 200 Hz로 자극해 급히 꺾는다. 안전지대에서는 조향을 끄고 곧게 달린다. 20초 동안 반사가 몇 번 작동했는지 기록한다. 코드가 감각과 운동 사이에 끼어든 인공 반사다.',
   code:asm([...begin(320,200,30,60),block('거대섬유 80 Hz 질주',5,8,80),...steerSetup,set(1,'','반사 작동 횟수 0'),set(5,number(200),'0.1초씩 200번 = 20초'),
    L('loop'),block('0.1초',7,100),read(2,2,'x 요청'),read(3,3,'y 요청'),
    set(9,'ㅠ '+number(80)),set(8,V(2)+V(9),'x − 80'),ifNeg(V(8),'tl'),
    set(9,'ㅠ '+number(560)),set(8,V(2)+V(9),'x − 560'),ifNeg(V(8),'cy'),go('tr'),
    L('cy'),set(9,'ㅠ '+number(80)),set(8,V(3)+V(9),'y − 80'),ifNeg(V(8),'tt'),
    set(9,'ㅠ '+number(320)),set(8,V(3)+V(9),'y − 320'),ifNeg(V(8),'calm'),go('tb'),
    L('tl'),set(7,'','왼쪽 벽: 오른쪽(0°)을 겨눈다'),go('turn'),
    L('tr'),set(7,number(180),'오른쪽 벽: 왼쪽(180°)'),go('turn'),
    L('tt'),set(7,number(90),'위쪽 벽: 아래(90°)'),go('turn'),
    L('tb'),set(7,number(270),'아래쪽 벽: 위(270°)'),go('turn'),
    L('calm'),block('안전지대: 조향 끄기',5,6,0)+'\n'+cmd(5,7,0),go('next'),
    L('turn'),set(1,V(1)+'도옹'),...steerCore('s',200),
    L('next'),set(5,V(5)+'ㅠ'),ifZero(V(5),'done'),go('loop'),
    L('done'),block('반사 작동 횟수 기록',11,V(1)),block('직접 자극 해제',10),block('1초 관찰',7,1000)])});
  W.push({id:'bitterFeast',title:'20 · 쓴 미끼 폭식 / 쓴맛을 끄고 다 먹어 치우기',
   note:'단맛과 쓴맛이 함께 든 미끼 세 개가 놓여 있다. 쓴맛 GRN 출력을 막으면 초파리는 쓴 미끼 앞에서도 멈춰 먹는다. 동현랭은 줄을 따라 걷게 조향하면서 먹이 접촉을 읽다가, 2초 먹으면 그 미끼의 단맛을 0으로 바꿔 "다 먹어 치운" 것으로 만들고, 다음 미끼로 보낸다. 마지막에 쓴맛을 되살린다.',
   code:asm([...begin(50,200,0,55),
    block('쓴 미끼 1',3,180,200,24,100,100),block('쓴 미끼 2',3,330,200,24,100,100),block('쓴 미끼 3',3,480,200,24,100,100),
    block('쓴맛 GRN 출력 차단',6,2,1),...steerSetup,set(1,'','먹어 치운 미끼 0'),set(5,number(250),'안전장치'),
    L('poll'),set(5,V(5)+'ㅠ'),ifZero(V(5),'end'),block('0.1초 걷기',7,100),read(2,10,'먹이 접촉 요청'),'신중동 '+V(2)+'? 신중동역 @steer',go('eat'),
    L('steer'),...holdLine('h',200),go('poll'),
    L('eat'),block('조향 끄기',10),set(1,V(1)+'도옹'),block('2초 먹기',7,2000),read(3,5,'MN9 Hz 요청'),block('먹는 중 MN9 기록',11,V(3)),
    block('이 미끼의 단맛을 0으로: 다 먹었다',13,V(1),0,100),
    L('leave'),block('0.1초',7,100),read(2,10,'먹이 접촉 요청'),ifZero(V(2),'next'),go('leave'),
    L('next'),set(4,'ㅠ '+lit(3)),set(4,V(1)+V(4)),ifZero(V(4),'end'),go('poll'),
    L('end'),block('먹어 치운 미끼 수 기록',11,V(1)),block('쓴맛 출력 복원',6,2,0),block('2초 관찰',7,2000)])});
  // heading controller: steer to target heading T with DNa02 bang-bang; legs by position
  // 방향 오차 e = (목표 + 540 − 현재 방향) mod 360 − 180. e가 +이면 오른쪽(시계 방향), −이면 왼쪽으로 꺾는다.
  function steerLeg(tag,T,axis,bound,dir,name){
    const pass=tag+'s',exit=tag+'x';
    return [L(tag),set(5,V(5)+'ㅠ'),ifZero(V(5),'end'),block('0.1초 달리기',7,100),read(2,2,'x 요청'),read(3,3,'y 요청'),
      set(9,'ㅠ '+number(bound)),set(8,V(axis)+V(9),name+' 경계까지 남은 거리'),
      ...(dir>0?[ifNeg(V(8),pass),go(exit)]:[ifNeg(V(8),exit),go(pass)]),
      L(pass),read(4,4,'방향 요청'),set(9,'ㅠ '+V(4)),set(8,number(T+540)),set(6,V(8)+V(9),'목표 '+T+'° + 540 − 현재 방향'),
      set(6,V(6)+' 또치 '+V(10),'360으로 나눈 나머지'),set(9,'ㅠ '+number(180)),set(6,V(6)+V(9),'오차를 −180부터 179 사이로'),
      set(8,V(6)+'ㅠ '.repeat(0)+V(11)),ifNeg(V(8),tag+'n'),
      block('오차가 +: 오른쪽 DNa02',5,7,120)+'\n'+cmd(5,6,0),go(tag),
      L(tag+'n'),set(8,V(6)+V(12)),ifNeg(V(8),tag+'l'),
      block('거의 맞음: 곧게',5,6,0)+'\n'+cmd(5,7,0),go(tag),
      L(tag+'l'),block('오차가 −: 왼쪽 DNa02',5,6,120)+'\n'+cmd(5,7,0),go(tag),
      L(exit)];
  }
  W.push({id:'remote',title:'21 · 원격 조종 / 돌무더기 둘레 경주',
   note:'동현랭이 0.1초마다 초파리의 위치와 방향을 읽고, 목표 방향과의 차이만큼 왼쪽이나 오른쪽 DNa02를 자극해 운전한다. 오른쪽 → 아래 → 왼쪽 → 위로 방향을 바꾸며 가운데 돌무더기 둘레를 두 바퀴 돈다. 거대섬유 자극으로 속도를 올렸고, 한 바퀴마다 걸린 시간(ms)을 기록한다. 코드가 뇌의 방향 신호를 대신 내는 셈이다.',
   code:asm([resetW(7),block('왼쪽 위에서 오른쪽을 향해 출발',2,110,90,0),block('기본 걷기 속도 60',9,60),
    block('가운데 돌 1',4,300,200,40),block('가운데 돌 2',4,360,190,30),block('가운데 돌 3',4,330,240,24),
    block('거대섬유 70 Hz',5,8,70),set(10,number(360),'나머지 계산용 360'),set(11,'ㅠ '+lit(10),'오른쪽 판정 기준 −10'),set(12,lit(10),'왼쪽 판정 기준 +10'),
    set(5,number(500),'안전장치: 최대 50초'),set(13,lit(2),'남은 바퀴 2'),set(14,'','직전 바퀴 끝 시각'),
    L('lap'),
    ...steerLeg('a',0,2,520,1,'x 520'),...steerLeg('b',90,3,300,1,'y 300'),...steerLeg('c',180,2,120,-1,'x 120'),...steerLeg('d',270,3,100,-1,'y 100'),
    read(15,1,'실험 시간 요청'),set(9,'ㅠ '+V(14)),set(16,V(15)+V(9),'이번 바퀴 시간'),block('바퀴 시간 ms 기록',11,V(16)),set(14,V(15)),
    set(13,V(13)+'ㅠ'),ifZero(V(13),'end'),go('lap'),
    L('end'),block('직접 자극 해제',10),block('1초 관찰',7,1000)])});
  return W;
})();
export const examples=[
 {id:'taste',title:'01 · 설탕을 만난 산책',note:'설탕까지 걸어가 멈춘다. 5초에 같은 먹이에 쓴맛이 더해지면 다시 걷는지 살펴보자.',code:wrap([
   ...start(),block('앞쪽에 설탕을 놓는다',3,230,200,45,100,0),block('5초 동안 만나고 맛보기',7,5000),
   block('첫 번째 먹이에 쓴맛을 섞는다',13,1,100,100),block('8초 더 걸어가는지 관찰',7,8000)])},
 {id:'bitter',title:'02 · 쓴맛을 지나, 달콤한 곳으로',note:'첫 먹이는 단맛과 쓴맛의 혼합, 두 번째는 단맛이다. 두 지점에서 이동과 MN9 신호가 어떻게 다른지 비교해 보자. 냄새를 따라가는 행동은 아니다.',code:wrap([
   ...start(60,200,45),block('먼저 만날 쓴맛 혼합 먹이',3,190,200,45,100,100),block('그다음 단맛 먹이',3,420,200,50,100,0),
   block('11초 산책',7,11000)])},
 {id:'obstacle',title:'03 · 막힌 길을 돌아서',note:'앞을 막은 돌에 닿으면 통과하지 않고 방향을 바꾼다. 이 전환은 뇌의 장애물 회피가 아니라 충돌 처리 규칙이다.',code:wrap([
   ...start(80,180,45),block('첫 번째 돌은 그대로',4,280,180,42),block('첫 충돌 뒤 돌아가는 길에 두 번째 돌',4,240,280,32),block('두 장애물을 만나는 12초 탐색',7,12000)])},
 {id:'loomL',title:'04 · 산책 중 왼쪽 경보',note:'먼저 2초간 걷는다. 왼쪽 시각 경로에 1초 자극을 주었을 때 DNa02 좌우 차이와 회전 방향을 살펴보자.',code:wrap([
   ...start(170,200,30),block('평온한 산책 2초',7,2000),block('왼쪽 LPLC2 자극',5,3,100),
   block('경보가 켜진 1초',7,1000),block('직접 자극 끄기',10),block('경보 뒤 4초 더 걷기',7,4000)])},
 {id:'loomR',title:'05 · 같은 산책, 오른쪽 경보',note:'04번과 같은 출발점·시드다. 이번에는 오른쪽만 자극한다. 자극 방향에 따라 달라지는 궤적과 신경 출력을 비교해 보자.',code:wrap([
   ...start(170,200,30),block('평온한 산책 2초',7,2000),block('오른쪽 LPLC2 자극',5,4,100),
   block('경보가 켜진 1초',7,1000),block('직접 자극 끄기',10),block('경보 뒤 4초 더 걷기',7,4000)])},
 {id:'dopamine',title:'06 · 도파민성 뉴런 자극 구역',note:'보라색 구역 안에서만 선택한 도파민성 뉴런 8개를 자극한다. DA 그래프를 관찰해 보자. 행복·보상 학습·도파민에 의한 속도 증가를 뜻하지 않는다.',code:wrap([
   ...start(70,200,40),block('도파민성 뉴런 자극 구역: x 270, y 200, 반경 65, 그룹 10, 50 Hz',12,270,200,65,10,50),
   block('구역에 들어갔다 나오는 10초 산책',7,10000),block('DA 평균 발화율을 요청',8,11),'동현아 꽥꽥',block('관측값을 기록',11,'동현')])},
 {id:'feedback',title:'07 · 반응을 읽고, 길을 이어 가기',note:'설탕 앞에서 멈춘 초파리의 MN9를 꽥꽥으로 읽는다. 반응이 있으면 동현랭 코드가 MN9 출력을 막아 다시 걷게 한다. 뉴런에 개입하는 실험이다.',code:wrap([
   ...start(70,200,45),block('단맛 먹이',3,230,200,45,100,0),block('5초 관찰',7,5000),block('MN9 평균 Hz 요청',8,5),
   '동현아 꽥꽥',block('읽은 값 기록',11,'동현'),'신중동 동현? 오겡끼데스까',block('반응이 있으면 MN9 출력을 차단',6,5,1),
   block('차단 후 5초 더 걷기',7,5000),block('MN9 출력 복원',6,5,0),block('복원 후 1초 관찰',7,1000)])},
 {id:'twoMeals',title:'08 · 두 번의 달콤한 정류장',note:'첫 설탕 앞에 멈췄다가 쓴맛이 섞이면 다시 걷는다. 더 멀리 놓인 두 번째 설탕에서 다시 멈추는지 살펴보자.',code:wrap([
   ...start(60,200,45),block('첫 번째 설탕 정류장',3,200,200,40,100,0),block('두 번째 설탕 정류장',3,430,200,50,100,0),
   block('첫 정류장까지 5초',7,5000),block('첫 먹이에만 쓴맛을 추가',13,1,100,100),block('다음 정류장까지 8초',7,8000)])},
 {id:'twoZones',title:'09 · 두 구역을 지나는 도파민 산책',note:'같은 50 Hz 자극 구역을 두 번 지난다. DA 그래프에서 두 번의 자극 구간과 그 사이의 휴지기를 찾아보자. 학습이나 보상 선호를 뜻하지 않는다.',code:wrap([
   ...start(60,200,40),block('첫 번째 도파민성 뉴런 자극 구역',12,190,200,45,10,50),block('두 번째 동일 자극 구역',12,400,200,45,10,50),
   block('두 구역을 통과하는 12초 산책',7,12000)])},
 {id:'bitterBlock',title:'10 · 쓴맛 신호를 잠시 막으면',note:'단맛·쓴맛이 섞인 먹이를 향해 걷는다. 3초에 쓴맛 뉴런의 출력을 막았다가 5초에 복원한다. 먹이를 바꾸지 않아도 멈춤과 이동이 달라지는지 보자.',code:wrap([
   ...start(70,200,45),block('단맛과 쓴맛이 섞인 먹이',3,230,200,55,100,100),block('먹이를 향해 3초',7,3000),
   block('쓴맛 감각 뉴런의 출력 차단',6,2,1),block('차단 상태 2초',7,2000),block('쓴맛 출력 복원',6,2,0),block('복원 후 7초 더 관찰',7,7000)])},
 {id:'blank',title:'11 · 빈 실험 / 직접 작성',note:'v0.1의 빈 실험이다. 자극도 기본 보행도 없이 1초를 관찰한다. 여기에 동현랭 코드를 더해 나만의 실험을 만들어 보자.',code:wrap([
   reset,block('1초 대조',7,1000)])},
 ...wildExamples
];
