const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:850}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,120))});
await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{buildShell();const o={};const sl=ms=>new Promise(r=>setTimeout(r,ms||300));
 // توليد: فحص بنية كل سؤال + التكرار
 const stats={};
 for(const st2 of [['prim',5,''],['prep',3,''],['sec',3,'sci'],['bac',3,'med']]){
   st.set('profile',Object.assign({},profile(),{name:'اختبار',edu:{stage:st2[0],grade:st2[1],track:st2[2]}}));
   st.set('mdused',[]);
   const qs=mdBuild(eduOf());
   const bad=qs.filter(q=>!q.q||q.o.length!==4||q.a<0||q.a>3||!q.e||q.o.some(x=>!String(x).trim()||/NaN|undefined/.test(String(x))));
   const dup=qs.length-new Set(qs.map(q=>hbNorm(q.q))).size;
   const dupOpt=qs.filter(q=>new Set(q.o.map(String)).size!==4).length;
   stats[st2[0]]={n:qs.length,want:MD_CFG[st2[0]].n,bad:bad.length,dup,dupOpt,topics:new Set(qs.map(q=>q.t)).size,sample:qs[0].q.slice(0,60)};
 }
 o.gen=stats;
 // ثبات الأسبوع: نفس البذرة = نفس الأسئلة
 st.set('mdused',[]);const a1=mdBuild(eduOf()).map(q=>q.q).join('|');st.set('mdused',[]);const a2=mdBuild(eduOf()).map(q=>q.q).join('|');
 o.stable=a1===a2;
 // لا تكرار مع أسابيع سابقة: نخزن أسئلة الأسبوع ثم نعيد البناء
 st.set('mdused',[]);const w1=mdBuild(eduOf());mdMarkUsed(w1);
 const w2=mdBuild(eduOf());o.overlapAfterUsed=w2.filter(q=>w1.some(x=>hbNorm(x.q)===hbNorm(q.q))).length;
 st.set('mdused',[]);st.set('mddone',{});st.set('mdrun',null);
 return o});
console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);await b.close()})();
