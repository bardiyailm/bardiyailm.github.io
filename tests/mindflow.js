const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:850}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,120))});
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{buildShell();const o={};const sl=ms=>new Promise(r=>setTimeout(r,ms||300));
 st.set('profile',Object.assign({},profile(),{name:'عبدالرحمن',edu:{stage:'sec',grade:3,track:'sci'}}));
 st.set('mdused',[]);st.set('mddone',{});st.set('mdrun',null);
 go('tests');await sl(400);o.card=document.body.innerHTML.includes('اختبار العقل الأسبوعي');
 document.querySelector('[data-a=mdgo]').click();await sl(200);
 document.querySelector('.sheet [data-a=askyes],.sheet .btn')?.click();await sl(600);
 o.started=EX.on;o.n=EX.qs.length;o.clock=!!document.getElementById('mdclock');o.saved=!!mdRun();
 // إجابة جزئية ثم خروج واستئناف
 EX.ans[0]=EX.qs[0].a;EX.ans[1]=EX.qs[1].a;EX.i=1;mdSave();
 ACT.exquit&&(EX.on=false);renderSec('tests');await sl(1200);
 o.clockGone=!document.getElementById('mdclock');o.resumeBtn=!!document.querySelector('[data-a=mdres]');
 document.querySelector('[data-a=mdres]').click();await sl(400);
 o.resumed=EX.on&&EX.ans[0]===EX.qs[0].a&&EX.i===1;
 // إنهاء بنسبة عالية
 EX.ans=EX.qs.map((q,i)=>i<55?q.a:-1);EX.force=1;ACT.exfinish();await sl(500);
 o.done=EX.done;const d=mdDone()[mdWeek()];o.rec=d;o.runCleared=!mdRun();
 EX.on=false;renderSec('tests');await sl(400);
 o.afterCard=document.body.innerHTML.includes('المرتبة');o.certBtn=!!document.querySelector('[data-a=mdcert]');
 o.blockRetake=(document.querySelector('[data-a=mdgo]')===null);
 const cv=await certCanvas({name:'عبدالرحمن',title:'اختبار العقل الأسبوعي',score:d.score,total:d.total,pct:d.pct,head:'شهادة اختبار العقل',sub:d.rank+' · عقل ذهبي',tier:[0,'عقل ذهبي','#c9962a','#f6e3a4']});
 o.cert=cv.width+'x'+cv.height;o.img=cv.toDataURL('image/jpeg',.6);
 return o});
const img=r.img;delete r.img;console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);
require('fs').writeFileSync('/tmp/out/mindcert.jpg',Buffer.from(img.split(',')[1],'base64'));await b.close()})();
