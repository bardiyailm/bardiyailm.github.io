const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{buildShell();const X='<img src=x onerror=window.__xss=1><svg onload=window.__xss=1>',sl=()=>new Promise(r=>setTimeout(r,250));
 st.set('profile',Object.assign({},profile(),{name:X,edu:{stage:'sec',grade:3,track:'sci'}}));
 st.set('sched',{title:X,name:X,items:[{id:'a',t:X,d:6,s:480,e:570,c:'study'}]});
 st.set('fcards',[{id:'f1',s:X,f:X,b:X,box:0,due:0}]);
 st.set('xmis',[{q:{id:'q1',s:X,t:X,sn:X,q:X,o:[X,'b','c','d'],a:1,e:X},box:0,due:0,n:1,at:1}]);
 st.set('rtc',[{id:'r1',label:X,t:'18:00',len:30,days:[0,1,2,3,4,5,6],tag:'custom'}]);
 st.set('rtov',{bf:{label:X,t:'07:00',len:20}});
 st.set('exam',addDays(td(),10));
 const secs=['home','sched','tests','routine','tasks','notes','log','study','set'];
 for(const s of secs){go(s);await sl()}
 ACT.fcnew();await sl();ACT.fclist();await sl();ACT.fcrev();await sl();
 const injected=document.querySelectorAll('img[src="x"],svg[onload]').length;
 return {xss:window.__xss||0,injected:injected}});
console.log(JSON.stringify(r),errs);await b.close()})();
