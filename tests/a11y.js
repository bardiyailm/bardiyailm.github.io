const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const t0=Date.now();await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html',{waitUntil:'domcontentloaded'});const dcl=Date.now()-t0;await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{buildShell();st.set('profile',Object.assign({},profile(),{name:'اختبار',edu:{stage:'sec',grade:3,track:'sci'}}));const bad={};let imgs=0;
 for(const s of SEC){go(s.id);await new Promise(r=>setTimeout(r,300));
  document.querySelectorAll('#b-'+s.id+' button, #b-'+s.id+' [role=button]').forEach(e=>{const n=(e.textContent||'').trim()||e.getAttribute('aria-label')||e.title;if(!n)(bad[s.id]=bad[s.id]||[]).push(e.outerHTML.slice(0,90))});
  document.querySelectorAll('#b-'+s.id+' img:not([alt])').forEach(()=>imgs++);
  document.querySelectorAll('#b-'+s.id+' input:not([type=checkbox]):not([type=hidden]), #b-'+s.id+' select, #b-'+s.id+' textarea').forEach(e=>{if(!e.getAttribute('aria-label')&&!e.id&&!e.closest('label')&&!e.placeholder)(bad[s.id+'#inputs']=bad[s.id+'#inputs']||[]).push(e.outerHTML.slice(0,90))})}
 return {bad,imgs}});
console.log('DCL ms',dcl,JSON.stringify(r,null,1));await b.close()})();
