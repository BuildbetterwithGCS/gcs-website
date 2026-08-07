const puppeteer = require('./node_modules/puppeteer-core');
const path = require('path');
const AXE = path.resolve('./node_modules/axe-core/axe.min.js');
const urls = ['', 'about/','solutions/','industries/','nexus/','genesis/','founder-command-center/',
  'map-intelligence/','reference/','founder/','request-demo/','contact/','privacy/','terms/',
  'accessibility/','responsible-ai/'];
(async()=>{
  const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
  for (const u of urls) {
    const p = await b.newPage();
    await p.setViewport({width:1440,height:1000});
    await p.goto('http://localhost:8899/'+u,{waitUntil:'domcontentloaded',timeout:30000});
    await new Promise(r=>setTimeout(r,700));
    await p.addScriptTag({path:AXE});
    const res = await p.evaluate(async()=>{
      const r = await window.axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
      return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes[0].target.join(' ')}));
    });
    console.log((u||'/').padEnd(26), res.length? res.map(v=>`${v.id}(${v.impact} x${v.n}) ${v.ex}`).join(' | ') : 'no violations');
    await p.close();
  }
  await b.close();
})();
