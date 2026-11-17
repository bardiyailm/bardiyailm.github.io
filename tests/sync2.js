const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>{CLOUD.on=true;CLOUD.user={id:'u1'};CLOUD.flush=async()=>true;CLOUD.q={};
 const keys=['mdused','mdrun','mddone','mdshare','fcards','xmis'];keys.forEach(k=>st.set(k,{a:1}));
 return {queued:Object.keys(CLOUD.q),notQueued:keys.filter(k=>!CLOUD.q[k])}})));await b.close()})();
