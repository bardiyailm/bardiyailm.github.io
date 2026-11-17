const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
const out=await p.evaluate(()=>{
 const res={};const N=400;
 const num=s=>(s.match(/-?\d+(\.\d+)?/g)||[]).map(Number);
 const C=(n,k)=>{let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v)};
 const G=(a,b)=>b?G(b,a%b):Math.abs(a);
 const fr=(n,d)=>{const g=G(n,d)||1;n/=g;d/=g;return d===1?String(n):n+'/'+d};
 const DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
 // مدقّقات مستقلة: تعيد الإجابة الصحيحة من نص السؤال وحده
 const CHK={
  7:q=>{const n=num(q);return String(n[0]*n[1]/(n[0]+n[1]))},                      // معدل الإنجاز
  8:q=>{const n=num(q);const k=n[0],yr=n[1],m=n[2];const s=yr*(m-1)/(k-m);return String(k*s)},
  9:q=>{const n=num(q);const x=n[0],pp=n[1],qq=n[2];return String(x*pp/qq-x)},
  10:q=>{const n=num(q);return String(n[1]/(n[0]-n[2]))},
  11:q=>{const n=num(q);return String(+(((100+n[0])*(100-n[1])/100)-100).toFixed(2))},
  12:q=>{const n=num(q);return String(C(n[0]+n[1],n[2])-C(n[0],n[2]))},
  13:q=>{const n=num(q);const a=n[0],bb=n[1];return fr(a*(a-1),(a+bb)*(a+bb-1))},
  14:q=>{const n=num(q);let g=Math.abs(30*n[0]-5.5*n[1]);if(g>180)g=360-g;return String(+g.toFixed(1))},
  15:q=>{const n=num(q);const d=DAYS.findIndex(x=>q.includes(x));return DAYS[(d+n[0])%7]},
  16:q=>{const n=num(q);return String((n[0]+1)*n[2]-n[0]*n[1])},
  17:q=>{const n=num(q);return String(n[0]-(n[1]+n[2]-n[3]))},
 };
 for(const idx of Object.keys(CHK)){
  const g=MD_GEN[idx-1];let ok=0,bad=[],skip=0;
  for(let i=0;i<N;i++){const r=elRng(1000+i*7919);let x=null;try{x=g.f(r,3)}catch(e){}
   if(!x){skip++;continue}
   const mine=CHK[idx](x.q),theirs=String(x.o[x.a]);
   if(mine===theirs||Math.abs(Number(mine)-Number(theirs))<1e-9)ok++;else if(bad.length<2)bad.push({q:x.q.slice(0,110),app:theirs,calc:mine});
  }
  res[idx]={ok,of:N-skip,bad};
 }
 // 18: الترتيب المنطقي — نتحقق أن الاسم الصحيح يتفق مع سلسلة المقارنات
 {let ok=0,bad=[];for(let i=0;i<N;i++){const r=elRng(55+i*104729);const x=MD_GEN[17].f(r,3);if(!x)continue;
   const cl=x.q.split('. فمن')[0].split('، و').map(s=>s.split(' أطول من '));
   const after={},all=new Set();cl.forEach(([a,c])=>{after[a]=c;all.add(a);all.add(c)});
   const first=[...all].find(n=>!Object.values(after).includes(n));const ord=[first];while(after[ord[ord.length-1]])ord.push(after[ord[ord.length-1]]);
   let want;if(x.q.includes('الأطول'))want=ord[0];else if(x.q.includes('الأقصر'))want=ord[ord.length-1];
   else{const m=['','الأول','الثاني','الثالث','الرابع','الخامس'].findIndex(w=>w&&x.q.includes('الترتيب '+w));want=ord[m-1]}
   if(want===String(x.o[x.a]))ok++;else if(bad.length<2)bad.push({q:x.q.slice(0,120),app:x.o[x.a],calc:want});}
  res[18]={ok,of:N,bad};}
 // 1-6: المتتاليات والأنماط — نتحقق من اتساق الفروق/النِّسب
 {let ok=0,bad=[];for(let i=0;i<N;i++){const r=elRng(9+i*7919);const x=MD_GEN[1].f(r,3);const n=(x.q.match(/\d+/g)||[]).map(Number);
   const q=n[1]/n[0];if(Math.abs(Number(x.o[x.a])-n[4]*q)<1e-9)ok++;else if(bad.length<2)bad.push({q:x.q,app:x.o[x.a]});}
  res['2(هندسية)']={ok,of:N,bad};}
 {let ok=0,bad=[];for(let i=0;i<N;i++){const r=elRng(31+i*6151);const x=MD_GEN[0].f(r,3);const n=(x.q.match(/\d+/g)||[]).map(Number);
   const d=[n[1]-n[0],n[2]-n[1],n[3]-n[2],n[4]-n[3]];const e=d[1]-d[0];
   const okE=d.every((v,j)=>j===0||Math.abs(v-(d[0]+j*e))<1e-9);
   if(okE&&Math.abs(Number(x.o[x.a])-(n[4]+d[3]+e))<1e-9)ok++;else if(bad.length<2)bad.push({q:x.q,app:x.o[x.a]});}
  res['1(حسابية)']={ok,of:N,bad};}
 return res});
console.log(JSON.stringify(out,null,1));await b.close()})();
