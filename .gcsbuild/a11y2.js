const puppeteer = require('./node_modules/puppeteer-core');
const path = require('path');
const AXE = path.resolve('./node_modules/axe-core/axe.min.js');
const urls = ['','nexus/','founder-command-center/','map-intelligence/','privacy/','contact/'];
(async()=>{
  const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
  const agg = {};
  for (const u of urls) {
    const p = await b.newPage();
    await p.setViewport({width:1440,height:1000});
    await p.goto('http://localhost:8899/'+u,{waitUntil:'domcontentloaded'});
    await new Promise(r=>setTimeout(r,700));
    await p.addScriptTag({path:AXE});
    const res = await p.evaluate(async()=>{
      const r = await window.axe.run(document,{runOnly:{type:'rule',values:['color-contrast']}});
      const out=[];
      (r.violations[0]?.nodes||[]).forEach(n=>{
        const d=(n.any&&n.any[0]&&n.any[0].data)||{};
        out.push({sel:n.target.join(' ').slice(0,70), fg:d.fgColor, bg:d.bgColor, ratio:d.contrastRatio, exp:d.expectedContrastRatio, fs:d.fontSize, fw:d.fontWeight});
      });
      return out;
    });
    res.forEach(r=>{
      const key = r.fg+' on '+r.bg+' ('+r.fs+', '+r.fw+') ratio '+r.ratio+' need '+r.exp;
      (agg[key] = agg[key]||[]).push(u+' '+r.sel);
    });
    await p.close();
  }
  Object.entries(agg).sort((a,b)=>b[1].length-a[1].length).forEach(([k,v])=>{
    console.log(v.length.toString().padStart(3), k, '||', v[0]);
  });
  await b.close();
})();
