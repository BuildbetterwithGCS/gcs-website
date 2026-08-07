const fs = require('fs');
const path = require('path');
const { JSDOM } = require('./node_modules/jsdom');

const js = fs.readFileSync('../js/main.js', 'utf8');
const pages = ['../index.html','../nexus/index.html','../map-intelligence/index.html',
  '../founder-command-center/index.html','../contact/index.html','../request-demo/index.html',
  '../genesis/index.html','../about/index.html'];

(async () => {
for (const p of pages) {
  const errors = [];
  const dom = new JSDOM(fs.readFileSync(p,'utf8'), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://buildbetterwithgcs.com/' });
  dom.window.addEventListener('error', e => errors.push(e.message));
  try { dom.window.eval(js); } catch (e) { errors.push('EVAL: ' + e.message); }

  const w = dom.window, d = w.document;
  const out = [];

  // tabs
  const tabs = d.querySelectorAll('.tabs__tab');
  if (tabs.length) {
    const panels = d.querySelectorAll('.tabs__panel');
    tabs[2].dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
    out.push('tabs: ' + (tabs[2].getAttribute('aria-selected')==='true' && !panels[2].hasAttribute('hidden') && panels[0].hasAttribute('hidden') ? 'OK':'FAIL'));
  }

  // map
  const pin = d.querySelector('.map-pin');
  if (pin) {
    pin.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    const id = pin.getAttribute('data-pin');
    const rec = d.querySelector('[data-detail="'+id+'"]');
    out.push('map pin: ' + (!rec.hasAttribute('hidden') && pin.classList.contains('is-active') ? 'OK':'FAIL'));
    const cb = d.querySelector('.layer-toggle input[data-layer="assets"]');
    cb.checked = false;
    cb.dispatchEvent(new w.Event('change',{bubbles:true}));
    out.push('layer toggle: ' + (d.querySelector('[data-layer-group="assets"]').hasAttribute('hidden')?'OK':'FAIL'));
    const sel = d.querySelector('[data-filter="category"]');
    sel.value='project'; sel.dispatchEvent(new w.Event('change',{bubbles:true}));
    const assetPin = d.querySelector('.map-pin[data-kind="asset"]');
    out.push('filter: ' + (assetPin.classList.contains('is-dimmed')?'OK':'FAIL'));
    const reset = d.querySelector('[data-map-reset]');
    reset.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    out.push('reset: ' + (!assetPin.classList.contains('is-dimmed') && cb.checked ?'OK':'FAIL'));
  }

  // queue
  const qbtn = d.querySelector('[data-queue-action]');
  if (qbtn) {
    qbtn.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    const item = qbtn.closest('.queue__item');
    out.push('queue: ' + (item.classList.contains('is-resolved') && item.querySelector('.queue__result')?'OK':'FAIL'));
  }

  // form
  const form = d.querySelector('[data-honest-form]');
  if (form) {
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    const res = form.parentNode.querySelector('[data-form-result]');
    const errShown = !!form.querySelector('.form-error').textContent;
    out.push('form invalid blocks: ' + (res.hasAttribute('hidden') && errShown ?'OK':'FAIL'));

    form.querySelectorAll('[required]').forEach(f=>{
      if (f.tagName==='SELECT') f.value = f.options[1].value;
      else if (f.type==='email') f.value='ops@example.gov';
      else if (f.tagName==='TEXTAREA') f.value='We cannot produce a defensible capital plan because condition data lives in three places.';
      else f.value='Test Person';
    });
    form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    const summary = res.querySelector('[data-form-summary]').textContent;
    const mailto = res.querySelector('[data-form-mailto]').getAttribute('href');
    out.push('form valid: ' + (!res.hasAttribute('hidden') && summary.includes('ops@example.gov') && mailto.startsWith('mailto:info@buildbetterwithgcs.com?subject=')?'OK':'FAIL'));
  }

  // nav toggle
  const t = d.querySelector('.nav__toggle');
  t.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  out.push('nav: ' + (d.getElementById('nav-menu').classList.contains('open')?'OK':'FAIL'));

  // footer year
  out.push('year: ' + (d.getElementById('footer-year').textContent.length===4?'OK':'FAIL'));

  console.log(path.basename(path.dirname(p))+'/'+path.basename(p), '|', out.join(' | '), errors.length? '| ERRORS: '+errors.join(';') : '');
  dom.window.close();
}
})();
