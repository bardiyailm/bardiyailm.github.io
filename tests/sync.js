const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>{CLOUD.on=true;CLOUD.user={id:'u1'};CLOUD.flush=async()=>true;CLOUD.q={};
 const keys=['sched','rtc','rtov','xmis','fcards','fclast','exlessons','lbon','xtheme','xhist','exam'];keys.forEach(k=>st.set(k,{a:1}));
 return {queued:Object.keys(CLOUD.q),notQueued:keys.filter(k=>!CLOUD.q[k]),localOnly:LOCAL_ONLY}})));await b.close()})();
