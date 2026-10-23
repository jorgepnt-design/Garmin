import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import storage from '../docs/editor-storage.js';
test('deleted designs stay deleted across reopening, reject stale autosaves, and restore images and layout',async()=>{
 const dom=new JSDOM('',{url:'https://example.org'}),local=dom.window.localStorage;
 let store=storage.create({local,idb:null});
 const design={version:1,name:'Mein Bild',elements:[{type:'image',data:'data:image/png;base64,AAA=',width:120,height:90,x:14,y:21}]};
 await store.put('mine',design,'data:image/png;base64,AAA=');await store.remove('mine');
 store=storage.create({local,idb:null});
 assert.deepEqual(await store.list(),[]);assert.equal(await store.get('mine'),null);assert.equal((await store.trash()).length,1);
 await assert.rejects(()=>store.put('mine',design),/gelöscht/);
 await store.restore('mine');const restored=await store.get('mine');
 assert.deepEqual(restored.design.elements,design.elements);assert.equal(restored.name,'Mein Bild');assert.equal((await store.trash()).length,0);
 assert.equal(JSON.parse(local.getItem('jorge-editor-v1:preview:mine')).image,'data:image/png;base64,AAA=');dom.window.close();
});
