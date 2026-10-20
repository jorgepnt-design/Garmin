import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const html=readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../docs/app.js',import.meta.url),'utf8');
async function open(releases=[],ok=true) {
 const dom=new JSDOM(html,{url:'https://example.com/Garmin/',runScripts:'outside-only',pretendToBeVisual:true});
 dom.window.fetch=async()=>({ok,status:ok?200:403,json:async()=>releases});
 dom.window.eval(script);
 await new Promise(r=>setTimeout(r,20));
 return dom;
}
test('four previews, selection and persisted choice',async()=>{
 const dom=await open();try{
 const w=dom.window,d=w.document;
 assert.equal(d.querySelectorAll('.design-card').length,4);
 d.querySelector('[data-select="portugal"]').click();
 assert.equal(d.getElementById('detail-heading').textContent,'Portugal');
 assert.equal(w.localStorage.getItem('jorge-design'),'portugal');
 assert.equal(d.querySelectorAll('.design-card.selected').length,1);
 assert.equal(d.querySelector('[data-select="portugal"]').getAttribute('aria-pressed'),'true');
 }finally{dom.window.close();}
});
test('sample seconds and reduced always-on mode',async()=>{
 const dom=await open();try{
 const d=dom.window.document;
 assert.match(d.getElementById('preview-sport').textContent,/:42/);
 d.getElementById('live-toggle').click();
 assert.equal(d.getElementById('live-toggle').getAttribute('aria-pressed'),'true');
 d.getElementById('live-toggle').click();
 assert.match(d.getElementById('preview-sport').textContent,/:42/);
 d.getElementById('aod-toggle').click();
 assert.doesNotMatch(d.getElementById('preview-sport').textContent,/:42|78%|WETTER/);
 assert.match(d.getElementById('preview-sport').textContent,/20:35/);
 d.getElementById('aod-toggle').click();
 assert.match(d.getElementById('preview-sport').textContent,/78%/);
 }finally{dom.window.close();}
});
test('installation tabs work with keyboard',async()=>{
 const dom=await open();try{
 const w=dom.window,d=w.document;
 const tab=d.getElementById('tab-iphone');tab.click();
 assert.equal(d.getElementById('guide-iphone').hidden,false);
 assert.equal(d.getElementById('guide-windows').hidden,true);
 tab.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
 assert.equal(d.getElementById('tab-windows').getAttribute('aria-selected'),'true');
 assert.equal(d.getElementById('guide-windows').hidden,false);
 }finally{dom.window.close();}
});
test('missing builds never provide a fake download',async()=>{
 const dom=await open();try{
 const d=dom.window.document;
 assert.equal(d.getElementById('download').hasAttribute('href'),false);
 assert.equal(d.getElementById('download').getAttribute('aria-disabled'),'true');
 assert.match(d.getElementById('release-status').textContent,/Noch kein/);
 }finally{dom.window.close();}
});
test('matching genuine release asset enables only its design',async()=>{
 const url='https://github.com/jorgepnt-design/Garmin/releases/download/v1/Jorge-sport.prg';
 const dom=await open([{tag_name:'v1',assets:[{name:'Jorge-sport.prg',size:1024,browser_download_url:url}]}]);try{
 const d=dom.window.document;
 assert.equal(d.getElementById('download').href,url);
 assert.equal(d.getElementById('download').getAttribute('aria-disabled'),'false');
 d.querySelector('[data-select="tesla"]').click();
 assert.equal(d.getElementById('download').hasAttribute('href'),false);
 }finally{dom.window.close();}
});
test('drafts, external URLs and empty assets are rejected',async()=>{
 const releases=[
 {draft:true,assets:[{name:'Jorge-sport.prg',size:100,browser_download_url:'https://github.com/jorgepnt-design/Garmin/releases/download/x/Jorge-sport.prg'}]},
 {assets:[{name:'Jorge-sport.prg',size:100,browser_download_url:'https://example.com/Jorge-sport.prg'},{name:'Jorge-elegant.prg',size:0,browser_download_url:'https://github.com/jorgepnt-design/Garmin/releases/download/x/Jorge-elegant.prg'}]}
 ];
 const dom=await open(releases);try{
 assert.equal(dom.window.document.getElementById('download').hasAttribute('href'),false);
 }finally{dom.window.close();}
});
test('API failure stays safe and explains retry',async()=>{
 const dom=await open([],false);try{
 const d=dom.window.document;
 assert.match(d.getElementById('release-status').textContent,/nicht geladen/);
 assert.equal(d.getElementById('retry').disabled,false);
 assert.equal(d.getElementById('download').hasAttribute('href'),false);
 }finally{dom.window.close();}
});

test('original artwork is the default for all four watch previews',async()=>{
 const dom=await open();try{
 const d=dom.window.document;
 assert.equal(d.getElementById('live-toggle').getAttribute('aria-pressed'),'false');
 assert.equal(d.querySelectorAll('.watch-case svg image').length,4);
 for(const image of d.querySelectorAll('.watch-case svg image')) assert.equal(image.getAttribute('href'),'./assets/original-designs.jpg');
 }finally{dom.window.close();}
});
