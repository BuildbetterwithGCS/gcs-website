const puppeteer = require('./node_modules/puppeteer-core');

const pages = [
  ['home','http://localhost:8899/'],
  ['nexus','http://localhost:8899/nexus/'],
  ['map','http://localhost:8899/map-intelligence/'],
  ['cc','http://localhost:8899/founder-command-center/'],
  ['genesis','http://localhost:8899/genesis/'],
  ['contact','http://localhost:8899/contact/'],
  ['about','http://localhost:8899/about/'],
  ['solutions','http://localhost:8899/solutions/'],
  ['reference','http://localhost:8899/reference/'],
  ['demo','http://localhost:8899/request-demo/'],
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox','--disable-gpu','--hide-scrollbars'] });
  for (const [name, url] of pages) {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
    page.on('requestfailed', r => { if(!r.url().includes('fonts.g')) errs.push('REQFAIL '+r.url()); });
    await page.setViewport({width:1440,height:1000});
    await page.goto(url, {waitUntil:'networkidle2', timeout:30000});
    await new Promise(r=>setTimeout(r,1200));

    // horizontal overflow check
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      const wide = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2)) {
          wide.push(el.className && typeof el.className === 'string' ? el.className.slice(0,50) : el.tagName);
        }
      });
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, offenders: [...new Set(wide)].slice(0,5) };
    });

    await page.screenshot({path:`shots/d-${name}.png`, fullPage:false});

    // mobile
    await page.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,600));
    const mOverflow = await page.evaluate(()=>({scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth}));
    await page.screenshot({path:`shots/m-${name}.png`, fullPage:false});

    console.log(name.padEnd(10), 'desktop', overflow.scrollW+'/'+overflow.clientW,
      '| mobile', mOverflow.scrollW+'/'+mOverflow.clientW,
      overflow.offenders.length? '| offenders: '+overflow.offenders.join(', '):'',
      errs.length? '| ERR: '+errs.slice(0,3).join(' ; '):'');
    await page.close();
  }
  await browser.close();
})();
