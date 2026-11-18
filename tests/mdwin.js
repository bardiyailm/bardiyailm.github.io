const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:850}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,120))});
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{buildShell();const o={};const sl=ms=>new Promise(r=>setTimeout(r,ms||250));
 st.set('profile',Object.assign({},profile(),{name:'عبدالرحمن',edu:{stage:'sec',grade:3,track:'sci'}}));
 const reset=()=>{st.set('mdused',[]);st.set('mddone',{});st.set('mdrun',null)};
 // لحظات محدّدة بتوقيت القاهرة (الشتاء +2)
 const T=t=>Date.parse(t);
 const cases={
  'الأربعاء 10ص':T('2026-11-18T08:00:00Z'),
  'الجمعة 7:59م':T('2026-11-20T17:59:00Z'),
  'الجمعة 8:00م':T('2026-11-20T18:00:00Z'),
  'الجمعة 9:30م':T('2026-11-20T19:30:00Z'),
  'الجمعة 10:01م':T('2026-11-20T20:01:00Z'),
  'السبت 1ص':T('2026-11-21T23:00:00Z'),
  'صيفاً: الجمعة 8م القاهرة (يوليو)':T('2026-07-17T17:00:00Z')
 };
 o.win={};for(const k in cases){window.__mdNow=cases[k];const w=mdWindow();
   o.win[k]=w.state+' | جمعة '+w.id+' | يفتح '+new Date(w.open).toISOString().slice(11,16)+'Z';}
 // بوابة البدء خارج النافذة
 reset();window.__mdNow=cases['الأربعاء 10ص'];go('tests');await sl(400);
 o.closedCard=!document.querySelector('[data-a=mdgo]')&&document.body.innerHTML.includes('يفتح الاختبار بعد');
 ACT.mdgo();await sl(200);o.blockedBefore=!EX.on;
 // داخل النافذة
 window.__mdNow=cases['الجمعة 8:00م'];renderSec('tests');await sl(300);
 o.openCard=!!document.querySelector('[data-a=mdgo]');
 ACT.mdgo();await sl(150);document.querySelector('.sheet .btn').click();await sl(600);
 o.started=EX.on;o.endsAt=new Date(EX.meta.md.end).toISOString().slice(11,16)+'Z';
 o.capped=EX.meta.md.end===mdWindow().close;
 // البدء متأخراً: الوقت يُقصّ عند الإغلاق
 reset();EX.on=false;window.__mdNow=cases['الجمعة 9:30م'];renderSec('tests');await sl(250);
 ACT.mdgo();await sl(150);document.querySelector('.sheet .btn').click();await sl(600);
 o.lateEnd=new Date(EX.meta.md.end).toISOString().slice(11,16)+'Z';o.lateCapped=EX.meta.md.end===mdWindow().close;
 // الإغلاق أثناء الغياب: تُصحَّح المحاولة بدل أن تضيع
 EX.ans[0]=EX.qs[0].a;EX.ans[1]=EX.qs[1].a;mdSave();EX.on=false;
 window.__mdNow=cases['السبت 1ص'];renderSec('tests');await sl(400);
 const d=mdDone();o.autoScored=Object.values(d)[0];o.runGone=!mdRun();
 o.afterCard=document.body.innerHTML.includes('الاختبار القادم بعد')||document.body.innerHTML.includes('يفتح الاختبار بعد');
 delete window.__mdNow;reset();
 return o});
console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);await b.close()})();
