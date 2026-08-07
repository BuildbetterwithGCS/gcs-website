const puppeteer = require('./node_modules/puppeteer-core');
(async () => {
  const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome', args:['--no-sandbox','--disable-gpu']});
  const p = await b.newPage();
  await p.setViewport({width:1200,height:630,deviceScaleFactor:1});
  await p.goto('http://localhost:8899/.gcsbuild/ogcard.html',{waitUntil:'networkidle2',timeout:30000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,1500));
  await p.screenshot({path:'../assets/og-image.png'});
  await b.close();
  console.log('og image written');
})();
