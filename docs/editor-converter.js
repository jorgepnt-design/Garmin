/* GitHub build integration adapted from jorgepnt-design/garmindesigner/web. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.JorgeConverter=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const API='https://api.github.com/repos/jorgepnt-design/garmindesigner',REPO='https://github.com/jorgepnt-design/garmindesigner';
 const slugify=s=>String(s||'mein-design').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'mein-design';
 function encode(s){const bytes=new TextEncoder().encode(s);let out='';for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(out);}
 function wait(ms,signal){return new Promise((resolve,reject)=>{const cancel=()=>{clearTimeout(timer);reject(new DOMException('Abgebrochen','AbortError'));};const timer=setTimeout(()=>{signal?.removeEventListener('abort',cancel);resolve();},ms);if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});});}
 async function convert(design,token,name,onStatus=()=>{},{signal,fetcher=fetch,pause=wait,maxPolls=120}={}){
  if(!token)throw Error('Bitte den GitHub-Schlüssel für garmindesigner eintragen.');
  if(!/^[A-F0-9]{8}$/.test(design.buildId||''))throw Error('Die Baukennung fehlt. Bitte den Editor neu laden.');
  if(design.renderVersion!==1||!design.renderAssets)throw Error('Der Entwurf enthält noch keine Editor-Pixel. Bitte den Editor neu laden.');
  const slug=slugify(name||'editor-'+design.name),path='/contents/designs/'+slug+'.json';
  async function gh(path,opts={}){const r=await fetcher(API+path,{...opts,signal,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token,'Content-Type':'application/json'}});if(r.status===404)return null;const body=await r.json().catch(()=>({}));if(!r.ok)throw Error('GitHub '+r.status+': '+(body.message||r.statusText));return body;}
  onStatus('Der aktuelle Entwurf wird zu GitHub übertragen …');
  const existing=await gh(path),upload=await gh(path,{method:'PUT',body:JSON.stringify({message:'Editor-Design '+slug+' bauen',content:encode(JSON.stringify(design)),...(existing?{sha:existing.sha}:{})})});
  const sha=upload?.commit?.sha;if(!sha)throw Error('GitHub hat keinen Commit bestätigt.');
  onStatus('Entwurf übertragen. GitHub baut die PRG – meist dauert das einige Minuten.');
  let run;
  for(let i=0;i<maxPolls;i++){
   await pause(8000,signal);const runs=await gh('/actions/runs?head_sha='+sha+'&per_page=10');run=runs?.workflow_runs?.find(r=>r.path==='.github/workflows/build.yml'&&r.head_sha===sha);
   if(!run){onStatus('Warte auf den Start des PRG-Baus …');continue;}
   if(run.status!=='completed'){onStatus(run.status==='queued'?'Der Bau wartet bei GitHub …':'Die PRG wird für die Venu X1 kompiliert …');continue;}
   if(run.conclusion!=='success')throw Error('Der GitHub-Bau ist '+(run.conclusion==='cancelled'?'abgebrochen':'fehlgeschlagen')+'. Details: '+REPO+'/actions/runs/'+run.id);
   const release=await gh('/releases/tags/build-'+sha);
   if(!release?.body?.includes(sha))throw Error('Der veröffentlichte Download gehört zu einem anderen Bau. Bitte erneut umwandeln.');
   const stem=slug+'-P2-'+design.buildId+'-venux1';
   const asset=release.assets?.find(a=>a.name===stem+'.prg'&&a.size>0),preview=release.assets?.find(a=>a.name===stem+'.png'&&a.size>0),receipt=release.assets?.find(a=>a.name===stem+'.json'&&a.size>0);
   if(!asset||!preview||!receipt)throw Error('Der Bau ist fertig, aber die passende PRG fehlt im Release.');
   const url=new URL(asset.browser_download_url);if(url.origin!=='https://github.com'||!url.pathname.startsWith('/jorgepnt-design/garmindesigner/releases/download/'))throw Error('Unerwartete Downloadadresse.');
   return {url:url.href,name:asset.name,previewUrl:preview.browser_download_url,buildId:design.buildId,appName:(design.name||'Jorge Custom').slice(0,18)+' P2-'+design.buildId,sha,runUrl:REPO+'/actions/runs/'+run.id};
  }
  throw Error('Der Bau läuft länger als erwartet. Fortschritt: '+REPO+'/actions');
 }
 return {convert,slugify,encode};
});
