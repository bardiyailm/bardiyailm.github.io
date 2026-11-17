const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const out={};
for(const vp of [{width:390,height:800},{width:1280,height:800}]){
const p=await (await b.newContext({viewport:vp})).newPage();const errs=[];p.on('pageerror',e=>errs.push('PE:'+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,160))});
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{buildShell();st.set('fullmode',1);st.set('profile',Object.assign({},profile(),{name:'اختبار',edu:{stage:'sec',grade:3,track:'sci'}}));
 const res=[];for(const s of SEC){try{go(s.id);await new Promise(r=>setTimeout(r,350));const el=document.querySelector('#b-'+s.id);const ov=document.documentElement.scrollWidth>innerWidth+2;res.push([s.id,el?el.textContent.trim().length:-1,ov?'OVERFLOW':''])}catch(e){res.push([s.id,'ERR '+e.message])}}return res});
out[vp.width]={r:r.filter(x=>x[1]<30||x[2]||String(x[1]).startsWith('ERR')),errs:[...new Set(errs)]};await p.close()}
console.log(JSON.stringify(out,null,1));await b.close()})();
