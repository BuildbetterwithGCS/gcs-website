const puppeteer=require('./node_modules/puppeteer-core');
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
const p=await b.newPage(); await p.setViewport({width:1400,height:1000});
await p.goto('http://localhost:8899/',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,1200));
console.log(await p.evaluate(()=>[...document.querySelectorAll('.reveal')].slice(0,4).map(e=>({t:Math.round(e.getBoundingClientRect().top),h:Math.round(e.getBoundingClientRect().height),vis:e.classList.contains('is-visible')}))));
await b.close();
})();
