const puppeteer=require('./node_modules/puppeteer-core');
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-gpu']});
const p=await b.newPage(); await p.setViewport({width:1400,height:1000});
await p.goto('http://localhost:8899/',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,1200));
console.log('at top hidden:', await p.evaluate(()=>[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity==='0').length));
const h=await p.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){ await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,160)); }
await new Promise(r=>setTimeout(r,900));
console.log('after scroll hidden:', await p.evaluate(()=>[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity==='0').length));
// no-JS check
const p2=await b.newPage(); await p2.setJavaScriptEnabled(false); await p2.setViewport({width:1400,height:1000});
await p2.goto('http://localhost:8899/',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,600));
console.log('NOJS hidden reveals:', await p2.evaluate(()=>[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity==='0').length));
await b.close();
})();
