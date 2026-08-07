const puppeteer=require('./node_modules/puppeteer-core');
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const jobs=[['home','',0],['nexus-dash','nexus/',1500],['cc','founder-command-center/',900],['map','map-intelligence/',1200],['contact','contact/',600],['solutions','solutions/',600]];
for(const [n,u,scroll] of jobs){
  const p=await b.newPage();
  await p.setViewport({width:1400,height:1050});
  await p.goto('http://localhost:8899/'+u,{waitUntil:'domcontentloaded'});
  await new Promise(r=>setTimeout(r,1400));
  if(scroll) await p.evaluate(y=>window.scrollTo(0,y), scroll);
  await new Promise(r=>setTimeout(r,900));
  await p.screenshot({path:`shots/f-${n}.png`});
  await p.close();
}
await b.close(); console.log('done');
})();
