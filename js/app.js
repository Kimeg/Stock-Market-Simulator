const $=id=>document.getElementById(id),fm=n=>Math.round(n).toLocaleString('ko-KR');
const POOL=['폭등바이오','테마전자','로봇솔루션','2차전지소재','반도체장비','저가동전주','우주항공','AI반도체','방산부품','신약개발','전기차부품','메타버스','수소에너지','양자컴퓨팅','엔터테인','원전설비','K-푸드','드론테크','핀테크','게임플러스'];
let ST=[];
function newList(){ST=[...POOL].sort(()=>Math.random()-.5).slice(0,6).map(n=>({n,p:snap(Math.exp(Math.log(1200)+Math.random()*Math.log(100))),v:.0014+Math.random()*.0012}));$('stk').innerHTML='';ST.forEach((s,i)=>$('stk').add(new Option(`${s.n} (${fm(s.p)}) 변동성${'★'.repeat(Math.round(s.v*2000))}`,i)))}
const CASH=1e8;
const tk=p=>p<2000?1:p<5000?5:p<20000?10:p<50000?50:p<200000?100:p<500000?500:1000;
const snap=p=>{const t=tk(p);return Math.max(t,Math.round(p/t)*t)};
const g=()=>(Math.random()+Math.random()+Math.random()-1.5)*2;
let S,V,STK=[],ACC={cash:CASH,real:0,fee:0,log:[]},timer=null,state='idle',CW=6;
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,1800)}
const MAS=[[5,'#f5b942'],[10,'#34d399'],[20,'#c084fc'],[60,'#60a5fa'],[120,'#fb923c']].map(([m,c])=>({m,c}));
const DISP=[{m:5,c:'#f59e0b'},{m:10,c:'#22c55e'},{m:20,c:'#a78bfa'},{m:60,c:'#38bdf8'}];
const RSI={period:14,c:'#f472b6',band:'#334155'};
const CCI={period:20,c:'#38bdf8',band:'#334155'};
let indicators=['disp','rsi','cci'];
$('ma').innerHTML='<b>이평</b> '+MAS.map((o,i)=>`<label>MA${o.m} <input aria-label="MA${o.m} 색상" type="color" value="${o.c}" data-kind="ma" data-i="${i}"></label>`).join('')+' <b>이격도 색</b> '+DISP.map((o,i)=>`<label>${o.m} <input aria-label="이격도 ${o.m} 색상" type="color" value="${o.c}" data-kind="disp" data-i="${i}"></label>`).join('')+' <label>RSI 선 <input type="color" value="'+RSI.c+'" data-kind="rsi"></label><label>CCI 선 <input type="color" value="'+CCI.c+'" data-kind="cci"></label><label>영역 <input type="color" value="#334155" data-kind="band"></label><label>봉 폭 <select id="cwz">'+[3,4,6,9,12].map(v=>`<option ${v==6?'selected':''}>${v}</option>`).join('')+'</select></label>';
$('ma').oninput=e=>{if(e.target.id=='cwz')CW=+e.target.value;else if(e.target.dataset.kind=='ma')MAS[e.target.dataset.i].c=e.target.value;else if(e.target.dataset.kind=='disp')DISP[e.target.dataset.i].c=e.target.value;else if(e.target.dataset.kind=='rsi')RSI.c=e.target.value;else if(e.target.dataset.kind=='cci')CCI.c=e.target.value;else if(e.target.dataset.kind=='band'){RSI.band=e.target.value;CCI.band=e.target.value}draw()};
$('chartTools').innerHTML='<b>차트 크기</b> <label>가로 <input id="chartW" type="range" min="360" max="1100" value="650" step="10"></label> <label>세로 <input id="chartH" type="range" min="360" max="1000" value="620" step="10"></label> <button id="chartReset">크기 초기화</button>';
$('chartW').oninput=e=>{document.documentElement.style.setProperty('--chart-width',e.target.value+'px');draw()};$('chartH').oninput=e=>{document.documentElement.style.setProperty('--chart-height',e.target.value+'px');draw()};$('chartReset').onclick=()=>{$('chartW').value=650;$('chartH').value=620;document.documentElement.style.removeProperty('--chart-width');document.documentElement.style.removeProperty('--chart-height');draw()};
function renderIndTools(){const names={disp:'이격도',rsi:'RSI',cci:'CCI'};$('indTools').innerHTML='<b>보조지표</b> '+Object.keys(names).map(k=>`<label><input type="checkbox" data-ind="${k}" ${indicators.includes(k)?'checked':''}>${names[k]}</label>`).join('')+' <span>순서 변경</span> '+indicators.map((k,i)=>`<button data-up="${k}" ${i===0?'disabled':''}>↑ ${names[k]}</button><button data-down="${k}" ${i===indicators.length-1?'disabled':''}>↓ ${names[k]}</button>`).join('');$('indTools').querySelectorAll('[data-ind]').forEach(e=>e.onchange=()=>{if(e.checked&&!indicators.includes(e.dataset.ind))indicators.push(e.dataset.ind);if(!e.checked)indicators=indicators.filter(k=>k!==e.dataset.ind);renderIndTools();draw()});$('indTools').querySelectorAll('[data-up]').forEach(e=>e.onclick=()=>{const i=indicators.indexOf(e.dataset.up);if(i>0)[indicators[i-1],indicators[i]]=[indicators[i],indicators[i-1]];renderIndTools();draw()});$('indTools').querySelectorAll('[data-down]').forEach(e=>e.onclick=()=>{const i=indicators.indexOf(e.dataset.down);if(i<indicators.length-1)[indicators[i+1],indicators[i]]=[indicators[i],indicators[i+1]];renderIndTools();draw()})};renderIndTools();
$('clkColor').oninput=e=>{$('clk').style.color=e.target.value};$('rclkColor').oninput=e=>{$('rclk').style.color=e.target.value};

function mk(s){
 S={s,price:s.p,prev:s.p,cand:[],cur:{o:s.p,h:s.p,l:s.p,c:s.p,v:0},n:0,drift:0,rc:0,pos:0,avg:0,ord:[],fills:[],book:new Map(),vol:0,val:0,day:null,ts:[],lu:true,A:[],B:[]};
 ['cash','real','fee','log'].forEach(k=>Object.defineProperty(S,k,{get:()=>ACC[k],set:v=>{ACC[k]=v},configurable:true}));
 for(let i=0;i<23400;i++)step(true);
 S.pvol=S.vol;S.vol=0;S.val=0;S.prev=S.price;S.ts=[];
 const op=Math.min(snap(S.prev*1.3),Math.max(snap(S.prev*.7),snap(S.prev*(1+(Math.random()-.5)*.08))));
 S.price=op;S.cur={o:op,h:op,l:op,c:op,v:0};S.day={o:op,h:op,l:op};
 const act=s.v/.0018;Object.assign(S,{bid:op,t:S.n,rt:0,lam:45*act,D:Math.max(30,Math.round(1e7/op/Math.sqrt(act))),bias:0,inten:1,nr:0,up:snap(S.prev*1.3),dn:snap(S.prev*.7),trT:[]});
 refreshBook();return S;
}
function init(){
 ACC={cash:CASH,real:0,fee:0,log:[]};
 STK=ST.map(s=>mk(s));S=V=STK[Math.min(STK.length-1,+$('stk').value||0)];
 buildChips();setState('idle');
}
function trade(p,v,uu){const o=S.price,u=uu!=null?uu:p>o?true:p<o?false:S.lu;S.lu=u;S.price=p;const c=S.cur;c.c=p;c.h=Math.max(c.h,p);c.l=Math.min(c.l,p);c.v+=v;S.vol+=v;S.val+=p*v;if(S.day){S.day.h=Math.max(S.day.h,p);S.day.l=Math.min(S.day.l,p)}if(v>0){S.ts.unshift({p,v,u});if(S.ts.length>10)S.ts.pop();if(S.trT)S.trT.push(S.t)}}
function step(q){
 const s=S.s;
 if(--S.rc<=0){S.drift=g()*s.v*.5;S.rc=10+Math.random()*40|0}
 let r=S.drift+s.v*g();
 if(Math.random()<.04)r+=g()*s.v*5;
 let np=snap(S.price*(1+r));
 np=Math.min(snap(S.prev*1.3),Math.max(snap(S.prev*.7),np));
 trade(np,Math.round(2e6/np*(1+Math.abs(r)/s.v*1.5)*(.3+Math.random())));
 if(++S.n%60==0){S.cand.push(S.cur);S.cur={o:S.price,h:S.price,l:S.price,c:S.price,v:0}}
 if(!q){S.fills=S.fills.filter(f=>--f.ttl>0);refreshBook();match()}
}
const nu=b=>b+tk(b),dn=b=>b-tk(b-1);
function levels(){const a=[],b=[];let p=S.bid;for(let i=0;i<10;i++){b.push(p);p=dn(p)}p=S.bid;for(let i=0;i<10;i++){p=nu(p);a.push(p)}return{a,b}}
function qty0(p){let o=S.book.get(p);if(o==null){o=Math.round(S.D*(.3+Math.random()*1.7));S.book.set(p,o)}return o}
function shift(buy,p){
 S.book.set(p,Math.max(5,Math.round(S.D*(.08+Math.random()*.5))));
 let x;
 if(buy){S.bid=p;x=p;for(let i=0;i<10;i++)x=dn(x)}
 else{S.bid=dn(p);x=S.bid;for(let i=0;i<11;i++)x=nu(x)}
 S.book.delete(x);
}
function fillPend(buy,p,take,through){
 const sd=buy?'sell':'buy';
 S.ord=S.ord.filter(o=>{
  if(o.side!=sd||o.p!=p)return true;
  let f=0;
  if(through)f=o.n;else{o.ahead-=take;if(o.ahead<0){f=Math.min(o.n,-o.ahead);o.ahead=0}}
  f=Math.min(f,sd=='sell'?S.pos:Math.floor(S.cash/(p*1.00015)));
  if(f>0){fill(sd,f,p);o.n-=f}
  return !through&&o.n>0;
 });
}
function hit(buy,n,lim,mine){
 let left=n;
 for(let k=0;left>0&&k<60;k++){
  const p=buy?nu(S.bid):S.bid;
  if(lim!=null&&(buy?p>lim:p<lim))break;
  if(buy?p>S.up:p<S.dn)break;
  const q=Math.floor(qty0(p));
  let f=Math.min(q,left);
  if(mine&&buy)f=Math.min(f,Math.floor(S.cash/(p*1.00015)));
  if(f>0){
   if(mine)fill(buy?'buy':'sell',f,p);
   S.book.set(p,qty0(p)-f);left-=f;trade(p,f,buy);
   if(!mine)fillPend(buy,p,f,false);
  }else if(mine&&q>0)break;
  if(Math.floor(qty0(p))<=0){if(!mine)fillPend(buy,p,0,true);shift(buy,p)}
 }
 return n-left;
}
function evTrade(){
 let a=0,b=0,p=S.bid,q=nu(S.bid);
 for(let i=0;i<5;i++){b+=qty0(p);a+=qty0(q);p=dn(p);q=nu(q)}
 const imb=(b-a)/(a+b);
 const buy=Math.random()<Math.min(.9,Math.max(.1,.5+S.bias+.18*imb));
 let n=Math.max(1,Math.round(S.D*.1*-Math.log(1-Math.random())));
 if(Math.random()<.03)n=Math.round(n*(5+Math.random()*25));
 hit(buy,n,null,false);
}
function evBook(){
 const bs=Math.random()<.5,i=Math.min(9,Math.floor(-Math.log(1-Math.random())*2.5));
 let p=bs?S.bid:nu(S.bid);
 for(let k=0;k<i;k++)p=bs?dn(p):nu(p);
 let q=qty0(p);const D=S.D;
 const add=Math.random()<(q<D?.7:q>2.5*D?.25:.5);
 q=add?q+Math.round(D*(.03+Math.random()*.3)):Math.max(5,q-Math.round(q*(.1+Math.random()*.5)));
 S.book.set(p,q);
}
function ev(){
 S.t+=-Math.log(1-Math.random())/(S.lam*S.inten);
 while(S.cand.length<(S.t/60|0)&&S.cand.length<780){S.cand.push(S.cur);S.cur={o:S.price,h:S.price,l:S.price,c:S.price,v:0}}
 if(S.t>S.nr){S.bias=Math.max(-.3,Math.min(.3,g()*.14));S.inten=.6+Math.random()*2;S.nr=S.t+6+Math.random()*30}
 if(Math.random()<.3)evTrade();else evBook();
}
function live(){
 const now=performance.now(),dt=Math.min(.25,(now-S.rt)/1000);S.rt=now;
 const tgt=S.t+dt*$('spd').value;
 for(let k=0;S.t<tgt&&k<8000&&S.cand.length<780;k++)ev();
 S.n=Math.floor(S.t);
 while(S.trT.length&&S.trT[0]<S.t-5)S.trT.shift();
 S.fills=S.fills.filter(f=>now-f.t<5000);
 refreshBook();
}
function qty(p){const bb=Math.max(50,3e7/S.price);let o=S.book.get(p);o=o==null?bb*(.3+Math.random()*1.7):Math.max(5,o*(.85+Math.random()*.3));S.book.set(p,o);return o}
function refreshBook(){const L=levels();S.A=L.a.map(p=>[p,Math.floor(qty0(p))]);S.B=L.b.map(p=>[p,Math.floor(qty0(p))])}
function log(t,c){S.log.unshift(`<div class="${c||''}">${clock(S.cand.length,S.n%60)} [${S.s.n}] ${t}</div>`);S.log.length=Math.min(S.log.length,40);if(S===V)toast(t)}
function fill(side,n,p){
 const amt=n*p,fee=amt*.00015;
 if(side=='buy'){S.cash-=amt+fee;S.avg=(S.avg*S.pos+amt)/(S.pos+n);S.pos+=n;S.fee+=fee}
 else{const tax=amt*.0018;S.cash+=amt-fee-tax;S.real+=(p-S.avg)*n-fee-tax;S.pos-=n;if(!S.pos)S.avg=0;S.fee+=fee+tax}
 log(`${side=='buy'?'매수':'매도'} ${fm(n)}주 @ ${fm(p)}`,side);S.fills.push({p,side,n,t:performance.now()})
}
function mkt(side,n,lim){return hit(side=='buy',n,lim,true)}
function qtyFor(side,p){
 const Z=PZ[side],z=Z.it[Z.sel],v=z.u=='%'?Math.min(100,z.v):z.v;
 if(side=='buy')return Math.floor((z.u=='%'?S.cash*v/100:v)/(p*1.00015));
 if(!S.pos)return 0;
 return Math.max(1,Math.min(S.pos,Math.floor(z.u=='%'?S.pos*v/100:v/p)));
}
function order(side,lim){
 if(state!='run'){log('Play/Resume 상태에서만 주문 가능');render();return}
 let n=qtyFor(side,lim==null?(side=='buy'?S.A[0][0]:S.B[0][0]):lim);if(n<=0){log(side=='sell'&&!S.pos?'보유 수량 없음':'주문 수량 0');render();return}
 if(side=='sell'){if(!S.pos){log('보유 수량 없음');render();return}n=Math.min(n,S.pos)}
 const f=mkt(side,n,lim);
 if(lim!=null&&f<n){S.ord.push({side,n:n-f,p:lim,ahead:Math.floor(qty0(lim))});log(`${side=='buy'?'매수':'매도'} 지정가 접수 ${fm(n-f)}주 @ ${fm(lim)}`)}
 else if(f<n)log(`잔량 ${fm(n-f)}주 미체결(잔량/예수금 부족)`);
 render();
}
function flat(){if(state!='run')return;if(S.pos){const n=S.pos;S.ord=[];const f=mkt('sell',n);if(f<n)log('청산 일부 미체결');}render()}
function match(){S.ord=S.ord.filter(o=>{
 if(o.side=='buy'&&S.price<=o.p||o.side=='sell'&&S.price>=o.p){
  let n=o.n;if(o.side=='sell')n=Math.min(n,S.pos);else n=Math.min(n,Math.floor(S.cash/(o.p*1.00015)));
  if(n>0)fill(o.side,n,o.p);return false}
 return true})}
function q(n){$('qty').value=(+$('qty').value|0)+n}
function clock(i,s=0){const m=i>=780?930:540+i%390;return String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+':'+String(s).padStart(2,'0')}

function setState(s){
 state=s;clearInterval(timer);
 if(s=='run'){STK.forEach(x=>x.rt=performance.now());timer=setInterval(()=>{const c=S;STK.forEach(x=>{S=x;live()});S=c;if(STK.every(x=>x.cand.length>=780)){log('장 마감 15:30');setState('end');return}render()},40)}
 $('play').disabled=s!='idle';$('stop').disabled=s!='run';$('res').disabled=s!='pause';
 $('stk').disabled=false;render();
}
$('play').onclick=()=>setState('run');
$('stop').onclick=()=>setState('pause');
$('res').onclick=()=>setState('run');
$('rst').onclick=()=>{newList();init()};
const PZ={buy:{sel:2,it:[10,25,50,75,100].map(v=>({v,u:'%'}))},sell:{sel:4,it:[10,25,50,75,100].map(v=>({v,u:'%'}))}};
const pzL=z=>z.u=='%'?z.v+'%':fm(z.v)+'원';
function buildPz(){$('pz').innerHTML=['buy','sell'].map(sd=>`<div class="pzt ${sd}">${sd=='buy'?'매수':'매도'} 비중 버튼 (클릭=선택)</div>`+PZ[sd].it.map((z,i)=>`<div class="pz" data-sd="${sd}" data-i="${i}"><button class="${PZ[sd].sel==i?'on':''}">${pzL(z)}</button><input type="number" min="1" value="${z.v}"><select><option ${z.u=='%'?'selected':''}>%</option><option ${z.u=='원'?'selected':''}>원</option></select></div>`).join('')).join('')}
$('pz').onclick=e=>{const r=e.target.closest('.pz');if(!r||e.target.tagName!='BUTTON')return;PZ[r.dataset.sd].sel=+r.dataset.i;buildPz();render()};
$('pz').oninput=e=>{const r=e.target.closest('.pz');if(!r)return;const z=PZ[r.dataset.sd].it[r.dataset.i],t=e.target;
 if(t.tagName=='INPUT')z.v=Math.max(1,+t.value||1);else{z.u=t.value;z.v=z.u=='%'?50:1000000;r.querySelector('input').value=z.v}
 r.querySelector('button').textContent=pzL(z);render()};
buildPz();
function buildChips(){$('wl').innerHTML=STK.map(x=>`<div class="chip"><b>${x.s.n}</b><span></span><span></span></div>`).join('')}
$('wl').onpointerdown=e=>{const c=e.target.closest('.chip');if(!c)return;const i=[...$('wl').children].indexOf(c);S=V=STK[i];$('stk').value=i;render()};
function cancelSide(sd){S.ord=S.ord.filter(o=>o.side!=sd);render()}
$('stk').onchange=()=>{S=V=STK[$('stk').value];render()};
$('spd').onchange=()=>{if(state=='run')setState('run')};
$('bk').onpointerdown=e=>{const r=e.target.closest('[data-p]');if(r){e.preventDefault();order(r.dataset.s,+r.dataset.p)}};

function render(){
 const d=S.price-S.prev,pc=d/S.prev*100,cl=d>0?'up':d<0?'dn':'';
 $('clk').textContent='장중 '+clock(S.cand.length,S.n%60)+(state=='run'?' ●':state=='pause'?' ❚❚':state=='end'?' 마감':'');
 $('hd').innerHTML=`<b>${S.s.n}</b><span class="p ${cl}">${fm(S.price)}</span><span class="${cl}">${d>=0?'▲':'▼'} ${fm(Math.abs(d))} (${pc.toFixed(2)}%)</span><span>거래량 ${fm(S.vol)}</span><span>전일 ${fm(S.prev)}</span><span>체결 ${S.trT?(S.trT.length/5).toFixed(1):0}건/초</span>`;
 const mx=Math.max(1,...S.A.map(x=>x[1]),...S.B.map(x=>x[1]));
 const bdg=(p,sd)=>S.ord.filter(o=>o.p==p&&o.side==sd).map(o=>`<span class="bg ${sd} pend">${fm(o.n)}</span>`).join('')+S.fills.filter(f=>f.p==p&&f.side==sd).map(f=>`<span class="bg ${sd}">${fm(f.n)}</span>`).join('');
 const cc=p=>p>S.prev?'up':p<S.prev?'dn':'';
 const strip=(p,sd)=>`<span class="${sd=='sell'?'sl':'sr'}" data-s="${sd}" data-p="${p}">${bdg(p,sd)}</span>`;
 const D=S.day,ap=S.pos?snap(S.avg):0;
 const info=[['시',D.o],['고',D.h],['저',D.l],['기준',S.prev],['현재',S.price],['전일비'],['거래량'],['대금'],['상한',snap(S.prev*1.3)],['하한',snap(S.prev*.7)]];
 const iv=(k,i)=>i==5?`<b class="${cl}">${d>0?'▲':d<0?'▼':''}${fm(Math.abs(d))} ${pc.toFixed(2)}%</b>`:i==6?`<b>${fm(S.vol)}</b>`:i==7?`<b>${fm(S.val/1e6)}백만</b>`:`<b class="${cc(k[1])}">${fm(k[1])}</b>`;
 let h='';
 for(let i=0;i<10;i++){const[pa,va]=S.A[9-i];h+=`<div class="r">${strip(pa,'sell')}<span></span><span class="qa"><i style="width:${va/mx*100}%"></i><u>${fm(va)}</u></span><span class="pa ${cc(pa)}${pa==S.price?' cur':''}${pa==ap?' avg':''}">${fm(pa)}</span><span class="inf" style="grid-column:span 2"><span>${info[i][0]}</span>${iv(info[i],i)}</span>${strip(pa,'buy')}</div>`}
 for(let i=0;i<10;i++){const[pb,vb]=S.B[i],t=S.ts[i];h+=`<div class="r">${strip(pb,'sell')}<span>${t?fm(t.p):''}</span><span class="${t&&t.u?'up':'dn'}">${t?fm(t.v):''}</span><span class="pb ${cc(pb)}${pb==S.price?' cur':''}${pb==ap?' avg':''}">${fm(pb)}</span><span class="qb"><i style="width:${vb/mx*100}%"></i><u>${fm(vb)}</u></span><span></span>${strip(pb,'buy')}</div>`}
 const sa=S.A.reduce((s,x)=>s+x[1],0),sb=S.B.reduce((s,x)=>s+x[1],0);
 const hdr=`<div class="hr"><span></span><button onclick="cancelSide('sell')">일괄취소</button><b class="dn">매도잔량</b><b>호가</b><b class="up">매수잔량</b><button onclick="cancelSide('buy')">일괄취소</button><span></span></div>`;
 $('bk').innerHTML=hdr+h+`<div class="ft"><span></span><span>총잔량</span><b class="dn">${fm(sa)}</b><span>${clock(S.cand.length,S.n%60)}</span><b class="up">${fm(sb)}</b><span></span><span></span></div>`;
 const ev=(S.price-S.avg)*S.pos,eq=STK.reduce((a,x)=>a+x.pos*x.price,S.cash),rt=S.pos?ev/(S.avg*S.pos)*100:0,tot=eq-CASH;
 const c=v=>v>0?'up':v<0?'dn':'';
 $('ac').innerHTML=`<span>총자산</span><b>${fm(eq)}</b><span>예수금</span><b>${fm(S.cash)}</b><span>보유수량</span><b>${fm(S.pos)}주</b><span>평균단가</span><b>${S.pos?fm(S.avg):'-'}</b><span>평가손익</span><b class="${c(ev)}">${fm(ev)} (${rt.toFixed(2)}%)</b><span>실현손익</span><b class="${c(S.real)}">${fm(S.real)}</b><span>제비용 합계</span><b>${fm(S.fee)}</b><span>총손익</span><b class="${c(tot)}">${fm(tot)} (${(tot/CASH*100).toFixed(2)}%)</b>`;
 $('po').textContent=S.ord.length?'미체결: '+S.ord.map(o=>`${o.side=='buy'?'매수':'매도'} ${fm(o.n)}@${fm(o.p)}`).join(', '):'미체결 주문 없음';
 $('log').innerHTML=S.log.join('').replace(/class="buy"/g,'class="up"').replace(/class="sell"/g,'class="dn"');
 $('est').textContent=`선택 비중 기준 → 매수 ${fm(qtyFor('buy',S.A[0][0]))}주 / 매도 ${fm(qtyFor('sell',S.B[0][0]))}주`;
 STK.forEach((x,i)=>{const c=$('wl').children[i];if(!c)return;const d=x.price-x.prev,k=d>0?'up':d<0?'dn':'',pl=(x.price-x.avg)*x.pos;c.className='chip'+(x===V?' on':'');c.children[1].className=k;c.children[1].textContent=fm(x.price)+' '+(d/x.prev*100).toFixed(2)+'%';c.children[2].className=x.pos?(pl>=0?'up':'dn'):'';c.children[2].textContent=x.pos?`보유 ${fm(x.pos)}주 ${fm(pl)}원`:(x.ord.length?`미체결 ${x.ord.length}건`:'-')});
 draw();
}
function draw(){
 const cv=$('cv'),r=cv.getBoundingClientRect(),dp=devicePixelRatio||1;
 if(!r.width||!r.height)return;
 if(cv.width!=(r.width*dp|0)){cv.width=r.width*dp;cv.height=r.height*dp}
 const x=cv.getContext('2d');x.setTransform(dp,0,0,dp,0,0);
 const W=r.width,H=r.height,cs=getComputedStyle(document.documentElement),C=k=>cs.getPropertyValue(k).trim();
 x.clearRect(0,0,W,H);
 const all=S.cand.concat(S.cur),cw=CW,N=Math.max(5,Math.floor((W-60)/cw)),vis=all.slice(-N),off=all.length-vis.length;
 // Dynamic layout: price, volume, then enabled indicators in user-selected order.
 const right=W-54, priceTop=8, gap=5, volH=H*.105, panelH=indicators.length?Math.max(36,(H*.31-gap*(indicators.length-1))/indicators.length):0, priceH=Math.max(80,H-volH-panelH*indicators.length-gap*(indicators.length+1)-24), volTop=priceTop+priceH+gap;
 let hi=Math.max(...vis.map(c=>c.h)),lo=Math.min(...vis.map(c=>c.l));
 if(S.pos){hi=Math.max(hi,S.avg);lo=Math.min(lo,S.avg)}
 const pad=(hi-lo)*.08||tk(hi);hi+=pad;lo-=pad;
 const Y=p=>priceTop+(hi-p)/(hi-lo)*(priceH-12),mv=Math.max(...vis.map(c=>c.v))||1;
 x.font='11px sans-serif';x.lineWidth=1;
 // Price grid and labels
 for(let i=0;i<=4;i++){const p=lo+(hi-lo)*i/4,y=Y(p);x.strokeStyle=C('--bd');x.beginPath();x.moveTo(0,y);x.lineTo(right,y);x.stroke();x.fillStyle=C('--mu');x.fillText(fm(p),right+3,y+4)}
 vis.forEach((c,i)=>{const cx=i*cw+cw/2+4,up=c.c>=c.o;x.strokeStyle=x.fillStyle=C(up?'--up':'--dn');x.beginPath();x.moveTo(cx,Y(c.h));x.lineTo(cx,Y(c.l));x.stroke();const y1=Y(c.o),y2=Y(c.c),bw=Math.max(1,cw-3);x.fillRect(cx-bw/2,Math.min(y1,y2),bw,Math.max(1,Math.abs(y1-y2)));});
 // Moving averages on price chart
 MAS.forEach(({m,c:col})=>{x.strokeStyle=col;x.beginPath();let started=false;vis.forEach((c,i)=>{const k=off+i;if(k<m-1)return;let sum=0;for(let j=k-m+1;j<=k;j++)sum+=all[j].c;const yy=Y(sum/m),cx=i*cw+cw/2+4;if(started)x.lineTo(cx,yy);else{x.moveTo(cx,yy);started=true}});x.stroke()});
 const hl=(p,col,lb)=>{if(p<lo||p>hi)return;const y=Y(p);x.setLineDash([4,3]);x.strokeStyle=col;x.beginPath();x.moveTo(0,y);x.lineTo(right,y);x.stroke();x.setLineDash([]);x.fillStyle=col;x.fillRect(right,y-8,54,16);x.fillStyle='#111';x.fillText(lb||fm(p),right+2,y+4)};
 hl(S.price,S.price>=S.prev?C('--up'):C('--dn'));if(S.prev>lo&&S.prev<hi)hl(S.prev,C('--mu'),'기준 '+fm(S.prev));if(S.pos)hl(S.avg,C('--ac'),'평단 '+fm(S.avg));
 // Volume panel
 x.strokeStyle=C('--bd');x.beginPath();x.moveTo(0,volTop);x.lineTo(W,volTop);x.stroke();
 vis.forEach((c,i)=>{const cx=i*cw+cw/2+4,bw=Math.max(1,cw-3),bh=c.v/mv*(volH-7);x.fillStyle=C(c.c>=c.o?'--up':'--dn');x.globalAlpha=.65;x.fillRect(cx-bw/2,volTop+volH-bh-3,bw,bh);x.globalAlpha=1;});
 x.fillStyle=C('--mu');x.fillText('거래량',5,volTop+11);
 // Calculate and draw enabled indicator panels in selected order.
 let panelTop=volTop+volH+gap;
 const closes=all.map(c=>c.c);
 function calcRSI(){const vals=Array(closes.length).fill(null),period=RSI.period;if(closes.length>period){let gain=0,loss=0;for(let i=1;i<=period;i++){const d=closes[i]-closes[i-1];gain+=Math.max(0,d);loss+=Math.max(0,-d)}let ag=gain/period,al=loss/period;vals[period]=al===0?100:100-100/(1+ag/al);for(let i=period+1;i<closes.length;i++){const d=closes[i]-closes[i-1];ag=(ag*(period-1)+Math.max(0,d))/period;al=(al*(period-1)+Math.max(0,-d))/period;vals[i]=al===0?100:100-100/(1+ag/al)}}return vals}
 const rsiVals=calcRSI();
 function calcCCI(){const vals=Array(closes.length).fill(null),period=CCI.period;for(let i=period-1;i<all.length;i++){let typical=[];for(let j=i-period+1;j<=i;j++)typical.push((all[j].h+all[j].l+all[j].c)/3);const avg=typical.reduce((a,b)=>a+b,0)/period,md=typical.reduce((a,b)=>a+Math.abs(b-avg),0)/period;const tp=(all[i].h+all[i].l+all[i].c)/3;vals[i]=md? (tp-avg)/(.015*md):0}return vals}
 const cciVals=calcCCI();
 indicators.forEach(kind=>{
  const top=panelTop,h=panelH,bottom=top+h;
  x.strokeStyle=C('--bd');x.beginPath();x.moveTo(0,top);x.lineTo(W,top);x.moveTo(0,bottom);x.lineTo(W,bottom);x.stroke();
  if(kind==='disp'){
   const sets=DISP.map(d=>({name:String(d.m),color:d.c,vals:all.map((c,k)=>{if(k<d.m-1)return null;let sum=0;for(let j=k-d.m+1;j<=k;j++)sum+=all[j].c;const ma=sum/d.m;return ma?((c.c/ma)-1)*100:null})}));
   let max=Math.max(1,...sets.flatMap(a=>a.vals.slice(off).map(v=>v==null?0:Math.abs(v))));max=Math.min(30,Math.ceil(max*1.15));const YI=v=>top+h/2-v/max*(h/2-8);
   x.strokeStyle=C('--mu');x.setLineDash([3,3]);x.beginPath();x.moveTo(0,YI(0));x.lineTo(right,YI(0));x.stroke();x.setLineDash([]);
   sets.forEach(a=>{x.strokeStyle=a.color;x.lineWidth=1.2;x.beginPath();let started=false;vis.forEach((c,i)=>{const v=a.vals[off+i];if(v==null){started=false;return}const xx=i*cw+cw/2+4,yy=YI(v);if(started)x.lineTo(xx,yy);else{x.moveTo(xx,yy);started=true}});x.stroke()});x.fillStyle=C('--mu');x.fillText('이격도 (%)',5,top+11);x.fillText('+'+max,right+3,top+11);x.fillText('-'+max,right+3,bottom-2);
  } else if(kind==='rsi'){
   const YI=v=>top+h-(v/100)*h,y70=YI(70),y30=YI(30);x.fillStyle=RSI.band+'55';x.fillRect(0,y70,right,y30-y70);x.strokeStyle=RSI.band;x.setLineDash([3,3]);[30,50,70].forEach(v=>{x.beginPath();x.moveTo(0,YI(v));x.lineTo(right,YI(v));x.stroke()});x.setLineDash([]);x.strokeStyle=RSI.c;x.lineWidth=1.4;x.beginPath();let started=false;vis.forEach((c,i)=>{const v=rsiVals[off+i];if(v==null){started=false;return}const xx=i*cw+cw/2+4,yy=YI(v);if(started)x.lineTo(xx,yy);else{x.moveTo(xx,yy);started=true}});x.stroke();x.fillStyle=C('--mu');x.fillText('RSI(14)',5,top+11);x.fillText('70',right+3,y70+4);x.fillText('30',right+3,y30+4);
  } else if(kind==='cci'){
   const vals=cciVals.slice(off,off+vis.length),max=Math.max(100,Math.ceil(Math.max(100,...vals.filter(v=>v!=null).map(v=>Math.abs(v)))/50)*50),YI=v=>top+h/2-v/max*(h/2-7);x.strokeStyle=CCI.band;x.setLineDash([3,3]);[-100,0,100].forEach(v=>{x.beginPath();x.moveTo(0,YI(v));x.lineTo(right,YI(v));x.stroke()});x.setLineDash([]);x.strokeStyle=CCI.c;x.lineWidth=1.4;x.beginPath();let started=false;vals.forEach((v,i)=>{if(v==null){started=false;return}const xx=i*cw+cw/2+4,yy=YI(v);if(started)x.lineTo(xx,yy);else{x.moveTo(xx,yy);started=true}});x.stroke();x.fillStyle=C('--mu');x.fillText('CCI(20)',5,top+11);x.fillText('+'+max,right+3,top+11);x.fillText('-'+max,right+3,bottom-2);
  }
  panelTop+=h+gap;
 });
 // Time labels along the bottom indicator panel
 const st=cw<5?30:cw<8?20:10;vis.forEach((c,i)=>{const cx=i*cw+cw/2+4;if((off+i)%st===0){x.fillStyle=C('--mu');x.fillText(clock(off+i).slice(0,5),cx-14,H-2)}if(off+i===390){x.strokeStyle=C('--mu');x.setLineDash([4,4]);x.beginPath();x.moveTo(cx-cw/2,0);x.lineTo(cx-cw/2,H);x.stroke();x.setLineDash([])}});
 x.fillStyle=C('--mu');x.fillText('1분봉',5,priceTop+11);
}
// Drag either clock anywhere in the viewport; retain its position while the simulation updates.
(function enableClockDragging(){
 for(const el of [$('clk'),$('rclk')]){
  let drag=null;
  el.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=el.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};el.style.position='fixed';el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.right='auto';el.style.margin='0';el.classList.add('dragging');el.setPointerCapture(e.pointerId);e.preventDefault()});
  el.addEventListener('pointermove',e=>{if(!drag)return;const x=Math.max(0,Math.min(innerWidth-el.offsetWidth,e.clientX-drag.dx)),y=Math.max(0,Math.min(innerHeight-el.offsetHeight,e.clientY-drag.dy));el.style.left=x+'px';el.style.top=y+'px'});
  const stop=()=>{drag=null;el.classList.remove('dragging')};el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);
 }
})();
new ResizeObserver(()=>S&&draw()).observe($('cv'));
newList();init();
const rc=()=>$('rclk').textContent='현재 '+new Date().toLocaleTimeString('ko-KR',{hour12:false});rc();setInterval(rc,1000);
