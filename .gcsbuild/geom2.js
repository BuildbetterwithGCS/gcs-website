const puppeteer=require('./node_modules/puppeteer-core');
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});

// map page geometry
let p=await b.newPage(); await p.setViewport({width:1400,height:1000});
await p.goto('http://localhost:8899/map-intelligence/',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,1200));
console.log('MAP', await p.evaluate(()=>{
  const stage=document.querySelector('.map-stage').getBoundingClientRect();
  const pins=[...document.querySelectorAll('.map-pin')];
  const outside=pins.filter(el=>{const r=el.getBoundingClientRect();return r.left<stage.left-4||r.right>stage.right+4||r.top<stage.top-4||r.bottom>stage.bottom+4;}).length;
  const svg=document.querySelector('.map-svg').getBoundingClientRect();
  return {stage:Math.round(stage.width)+'x'+Math.round(stage.height), pins:pins.length, outsideStage:outside,
    svg:Math.round(svg.width)+'x'+Math.round(svg.height),
    controlsW:Math.round(document.querySelector('.map-controls').getBoundingClientRect().width),
    detailH:Math.round(document.querySelector('.map-detail').getBoundingClientRect().height)};
}));
await p.close();

// nexus tabs
p=await b.newPage(); await p.setViewport({width:1400,height:1000});
await p.goto('http://localhost:8899/nexus/',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,1500));
console.log('NEXUS', await p.evaluate(()=>{
  const tabs=[...document.querySelectorAll('.tabs__tab')];
  const panels=[...document.querySelectorAll('.tabs__panel')];
  const vis=panels.filter(x=>!x.hasAttribute('hidden'));
  const fills=[...document.querySelectorAll('.chart__fill')].map(f=>f.getBoundingClientRect().width);
  const kpis=[...document.querySelectorAll('#panel-exec .kpi')].map(k=>Math.round(k.getBoundingClientRect().height));
  return {tabs:tabs.length, panels:panels.length, visiblePanels:vis.length, visibleId:vis[0]&&vis[0].id,
    chartFillsWithWidth:fills.filter(w=>w>4).length+'/'+fills.length, kpiHeights:[...new Set(kpis)]};
}));
// switch to risks tab
await p.evaluate(()=>document.querySelectorAll('.tabs__tab')[6].click());
await new Promise(r=>setTimeout(r,700));
console.log('NEXUS after tab6', await p.evaluate(()=>{
  const vis=[...document.querySelectorAll('.tabs__panel')].filter(x=>!x.hasAttribute('hidden'));
  const svgs=[...document.querySelectorAll('#panel-risks svg')].map(s=>Math.round(s.getBoundingClientRect().width));
  return {visibleId:vis[0]&&vis[0].id, tables:document.querySelectorAll('#panel-risks .dtable').length, svgWidths:svgs};
}));
await p.close();

// home
p=await b.newPage(); await p.setViewport({width:1400,height:1000});
await p.goto('http://localhost:8899/',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,1500));
console.log('HOME', await p.evaluate(()=>{
  const secs=[...document.querySelectorAll('main > section')].map(s=>s.id||s.className.split(' ')[0]);
  const revealHidden=[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity==='0').length;
  return {sections:secs, reveals:document.querySelectorAll('.reveal').length, revealStillHidden:revealHidden,
    navItems:document.querySelectorAll('.nav__link').length,
    footerLinks:document.querySelectorAll('.site-footer a').length};
}));
await p.close();
await b.close();
})();
