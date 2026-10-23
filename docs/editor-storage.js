(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.JorgeDesignStore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';const KEY='jorge-editor-v1';
 function create({local=localStorage,idb=typeof indexedDB==='undefined'?null:indexedDB}={}){
  let dbPromise;
  const clean=d=>{const copy=JSON.parse(JSON.stringify(d));delete copy.renderAssets;delete copy.renderVersion;return copy;};
  const read=key=>{try{return JSON.parse(local.getItem(key));}catch{return null;}};
  function db(){if(!idb)return Promise.resolve(null);if(!dbPromise)dbPromise=new Promise(resolve=>{const r=idb.open('jorge-watch-designs',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('designs'))r.result.createObjectStore('designs',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=r.onblocked=()=>resolve(null);});return dbPromise;}
  async function request(mode,action){const d=await db();if(!d)return null;return new Promise((resolve,reject)=>{const tx=d.transaction('designs',mode),r=action(tx.objectStore('designs'));let value;r.onsuccess=()=>value=r.result;tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(tx.error||Error('Design konnte nicht gespeichert werden.'));});}
  function legacy(){const map=new Map();for(let i=0;i<local.length;i++){const key=local.key(i);if(key!==KEY&&(!key?.startsWith(KEY+':')||key.includes(':preview:')||key.endsWith(':library')))continue;const d=read(key);if(d?.version!==1||!Array.isArray(d.elements))continue;const id=d.editorId||(key===KEY?d.name?.toLowerCase().replace(/[^a-z0-9]+/g,'-'):key.slice(KEY.length+1))||'sport';map.set(id,{id,name:d.name||'Mein Design',design:clean(d),updated:0,preview:read(KEY+':preview:'+id)?.image});}return [...map.values()];}
  async function records(){const map=new Map(legacy().map(r=>[r.id,r]));for(let i=0;i<local.length;i++){const key=local.key(i);if(key?.startsWith(KEY+':trash:')){const r=read(key);if(r?.id)map.set(r.id,r);}}for(const r of await request('readonly',s=>s.getAll())||[])map.set(r.id,r);return [...map.values()].sort((a,b)=>b.updated-a.updated);}
  async function list(){return (await records()).filter(r=>!r.deletedAt);}
  async function trash(){return (await records()).filter(r=>r.deletedAt);}
  async function get(id){const r=(await records()).find(r=>r.id===id);return r&&!r.deletedAt?r:null;}
  async function put(id,design,preview,restoring=false){
   const old=await request('readonly',s=>s.get(id))||read(KEY+':trash:'+id);
   if(old?.deletedAt&&!restoring)throw Error('Design wurde gelöscht. Bitte im Papierkorb wiederherstellen.');
   const d=clean(design);d.editorId=id;const r={id,name:d.name||'Mein Design',updated:Date.now(),design:d};
   if(preview||old?.preview)r.preview=preview||old.preview;
   if(await db())await request('readwrite',s=>s.put(r));
   else{local.setItem(KEY+':'+id,JSON.stringify(d));try{local.setItem(KEY,JSON.stringify(d));if(r.preview)local.setItem(KEY+':preview:'+id,JSON.stringify({name:r.name,image:r.preview}));}catch{}}
   try{local.removeItem(KEY+':trash:'+id);local.setItem(KEY+':last-active',id);}catch{}
   return r;
  }
  async function remove(id){
   const current=await get(id);if(!current)return;
   const removed={...current,deletedAt:Date.now()};removed.preview=removed.preview||read(KEY+':preview:'+id)?.image;
   if(await db())await request('readwrite',s=>s.put(removed));else local.setItem(KEY+':trash:'+id,JSON.stringify(removed));
   for(const key of [KEY,KEY+':'+id]){const d=read(key);if(d&&(d.editorId===id||key===KEY+':'+id))local.removeItem(key);}
   try{local.removeItem(KEY+':preview:'+id);if(local.getItem(KEY+':last-active')===id)local.removeItem(KEY+':last-active');}catch{}
  }
  async function restore(id){const r=(await trash()).find(r=>r.id===id);if(!r)throw Error('Design nicht im Papierkorb gefunden.');return put(id,r.design,r.preview,true);}
  return {get,list,put,clean,remove,restore,trash};
 }return {create};
});
