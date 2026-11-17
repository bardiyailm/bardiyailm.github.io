const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800},acceptDownloads:true});const p=await ctx.newPage();
const errs=new Map();const add=m=>errs.set(m,(errs.get(m)||0)+1);
p.on('pageerror',e=>add('PE:'+e.message.slice(0,140)));p.on('console',m=>{if(m.type()==='error')add('C:'+m.text().slice(0,140))});
p.on('dialog',d=>d.dismiss().catch(()=>{}));p.on('download',d=>d.cancel().catch(()=>{}));p.on('popup',pp=>pp.close().catch(()=>{}));
const setup=async(first)=>{
 if(first){await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html')}
 await p.waitForTimeout(1500);
await p.evaluate(()=>{buildShell();st.set('fullmode',1);localStorage.setItem('ab:full','1');st.set('profile',Object.assign({},profile(),{name:'اختبار',edu:{stage:'sec',grade:3,track:'sci'}}));
 window.open=()=>null;window.__skip=/(reset|clear|wipe|delete|logout|signout|quit|exit|pinset|unlock|forget|erase|cmlogout|account|danger|restore|import|export|install|share|notif|sub|rate|bye|out)/i;
 window.__rand=(()=>{let s=12345+Math.floor(performance.now())%99991;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}})();
 window.__t0=performance.now();window.__ls=()=>{let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=(localStorage.getItem(k)||'').length}return n}});
};
await setup(true);
const navs=[];let lastLog='';
const N=1000;let acts=0,heap0=null;const samples=[];
for(let i=1;i<=N;i++){
 const r=await p.evaluate(async()=>{
  const R=window.__rand;const ids=SEC.map(s=>s.id);let log='';
  const pickSec=()=>ids[Math.floor(R()*ids.length)];
  const mode=R();
  if(mode<.25){const s=pickSec();go(s);log='go:'+s}
  else if(mode<.75){
   const root=document.querySelector('.sec.on')||document;
   const els=[...root.querySelectorAll('[data-a]')].filter(e=>!e.disabled&&!window.__skip.test(e.dataset.a)&&e.offsetParent!==null);
   if(els.length){const e=els[Math.floor(R()*els.length)];log='a:'+e.dataset.a;sessionStorage.setItem('__last',log);try{e.click()}catch(x){}}
  }else{
   const root=document.querySelector('.sec.on')||document;
   const els=[...root.querySelectorAll('input[data-c],select[data-c],textarea[data-c]')].filter(e=>!window.__skip.test(e.dataset.c)&&e.offsetParent!==null&&!e.disabled);
   if(els.length){const e=els[Math.floor(R()*els.length)];
     if(e.tagName==='SELECT'){e.selectedIndex=Math.floor(R()*e.options.length)}
     else if(e.type==='checkbox'){e.checked=!e.checked}
     else if(e.type==='number'){e.value=String(Math.floor(R()*200)-20)}
     else if(e.type==='time'){e.value=String(Math.floor(R()*24)).padStart(2,'0')+':'+String(Math.floor(R()*60)).padStart(2,'0')}
     else if(e.type==='date'){e.value='2026-12-'+String(1+Math.floor(R()*27)).padStart(2,'0')}
     else e.value=['<b>x</b>','"'+"'"+'><img src=x onerror=window.__xss=1>','','عربي '+Math.floor(R()*999),'a'.repeat(300)][Math.floor(R()*5)];
     e.dispatchEvent(new Event('change',{bubbles:true}));log='c:'+e.dataset.c}
  }
  // close sheets so they don't pile up
  try{if(document.querySelectorAll('.sheet,.sh-back,[data-close]').length>6)closeSheet()}catch(x){}
  await new Promise(r=>setTimeout(r,15));
  return {log,nodes:document.getElementsByTagName('*').length,ls:window.__ls()};
 }).catch(async e=>{if(/destroyed|navigation/.test(e.message)){await p.waitForLoadState('load').catch(()=>{});await setup(false);navs.push(i+':'+(await p.evaluate(()=>sessionStorage.getItem('__last')).catch(()=>'?')))}else add('EVAL:'+e.message.slice(0,100));return null});
 if(r){lastLog=r.log;acts++;if(i%100===0)samples.push([i,r.nodes,r.ls])}
}
console.log('actions',acts,'navigations',JSON.stringify(navs));console.log('samples [iter,domNodes,lsChars]',JSON.stringify(samples));
console.log('errors',JSON.stringify([...errs.entries()],null,1));
const m=await p.evaluate(()=>performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):-1);console.log('heapMB',m);
await b.close()})();
