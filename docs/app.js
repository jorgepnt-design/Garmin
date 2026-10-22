"use strict";
const REPO = "jorgepnt-design/Garmin";
const designs = [
 {id:"sport",name:"Sport",accent:"#a8ff24",description:"Klare Zahlen, Neongrün und drei Rundanzeigen. Dein sportlicher Begleiter für jeden Tag."},
 {id:"elegant",name:"Elegant",accent:"#e8cd91",description:"Champagnergold auf tiefem Schwarz. Reduzierte Linien und eine ruhige, elegante Aufteilung."},
 {id:"tesla",name:"Tesla",accent:"#ff2438",description:"Dein weißer Model 3 mit schwarzem Seitenstreifen und roten Akzenten. Inspiriert von deinem automobilen Stil."},
 {id:"portugal",name:"Portugal",accent:"#00c765",description:"Grün, Rot und goldene Akzente. Ein Stück Portugal an deinem Handgelenk."}
];
let selected = "sport";
try { const saved=localStorage.getItem("jorge-design"); if(designs.some(d=>d.id===saved)) selected=saved; } catch (_) {}
let live = false, aod = false, releaseState = "loading", releaseAssets = new Map(), checkedAt = "";
const el = id => document.getElementById(id);
function escapeXml(value) { return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c])); }
function previewSvg(d) {
 const config={
 sport:{crop:[98,74,440,510],screen:[115,129,398,391],clock:[134,207,365,138],base:331},
 elegant:{crop:[674,74,440,510],screen:[689,131,400,390],clock:[708,223,368,128],base:342},
 tesla:{crop:[98,639,440,510],screen:[113,695,402,386],clock:[128,766,370,116],base:869},
 portugal:{crop:[674,639,440,510],screen:[690,696,401,385],clock:[714,811,357,132],base:932}
 }[d.id];
 const now=live?new Date():new Date(2026,9,20,20,35,42),fmt=n=>String(n).padStart(2,"0");
 const hh=fmt(now.getHours()),mm=fmt(now.getMinutes()),ss=fmt(now.getSeconds()),time=hh+":"+mm;
 const [x,y,w,h]=config.crop;
 let content='<image href="./assets/original-designs.jpg" x="0" y="0" width="1206" height="1249"/>';
 if(aod){
  const [sx,sy,sw,sh]=config.screen;
  content+='<rect x="'+sx+'" y="'+sy+'" width="'+sw+'" height="'+sh+'" rx="35" fill="#000"/><text x="'+(sx+sw/2)+'" y="'+(sy+sh*.56)+'" text-anchor="middle" fill="#777" font-size="66" font-family="Arial,sans-serif">'+time+'</text>';
 }else if(live){
  const [cx,cy,cw,ch]=config.clock,gold=d.id==="elegant",sport=d.id==="sport";
  content+='<rect x="'+cx+'" y="'+cy+'" width="'+cw+'" height="'+ch+'" fill="#000"/>';
  if(gold){
   content+='<text x="'+cx+'" y="'+config.base+'" fill="#e8cd91" font-family="Georgia,serif" font-size="119" font-weight="300" textLength="274" lengthAdjust="spacingAndGlyphs">'+time+'</text><text x="'+(cx+cw)+'" y="'+config.base+'" fill="#e8cd91" font-family="Georgia,serif" text-anchor="end" font-size="66">:'+ss+'</text>';
  }else{
   const c=d.id==="sport"?"#b0ff22":d.id==="tesla"?"#ff233b":"#fff";
   content+='<g font-family="Arial Black,Arial,sans-serif" font-weight="900"'+(sport?' font-style="italic"':"")+'>';
   content+='<text x="'+cx+'" y="'+config.base+'" fill="#fff" font-size="127" textLength="132" lengthAdjust="spacingAndGlyphs">'+hh+'</text>';
   content+='<text x="'+(cx+140)+'" y="'+config.base+'" fill="'+c+'" font-size="127" textLength="145" lengthAdjust="spacingAndGlyphs">:'+mm+'</text>';
   content+='<text x="'+(cx+cw)+'" y="'+config.base+'" fill="'+c+'" font-size="68" text-anchor="end">:'+ss+'</text></g>';
  }
 }
 const label=d.name+' – '+(aod?'Ruhemodus '+time:live?'Live-Vorschau '+time+':'+ss:'Originaldesign 20:35:42');
 // Accessible example values are kept outside the raster image as SVG metadata.
 return '<svg viewBox="'+[x,y,w,h].join(" ")+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+label+'"><title>'+label+'</title><desc>'+(aod?time:'78% Akku; 16°C WETTER; 8,42 km HEUTE; 06:30 manuelle Weckzeit; '+time+':'+ss)+'</desc>'+content+'</svg>';
}
function renderCards() {
 el("designs").innerHTML = designs.map((d,i)=>'<article class="design-card'+(selected===d.id?' selected':'')+'" data-design="'+d.id+'"><div class="card-top"><span>0'+(i+1)+' / '+d.name.toUpperCase()+'</span><span class="selected-mark">✓ AUSWAHL</span></div><div class="watch-shell"><div class="watch-case" id="preview-'+d.id+'">'+previewSvg(d)+'</div></div><div class="hardware-label">GARMIN VENU X1</div><h3>'+d.name+'</h3><p>'+escapeXml(d.description)+'</p><button class="select-design" type="button" data-select="'+d.id+'" aria-pressed="'+(selected===d.id)+'" aria-label="'+d.name+' auswählen"><span>'+(selected===d.id?'Ausgewählt':'Design wählen')+'</span><span aria-hidden="true">↗</span></button></article>').join("");
}
function tick() { if(!document.hidden) designs.forEach(d=>el("preview-"+d.id).innerHTML=previewSvg(d)); }
function selectDesign(id) {
 if(!designs.some(d=>d.id===id)) return;
 selected=id; try{localStorage.setItem("jorge-design",id);}catch(_){}
 document.querySelectorAll(".design-card").forEach(card=> {
 const active=card.dataset.design===selected;
 card.classList.toggle("selected",active);
 const button=card.querySelector("button");button.setAttribute("aria-pressed",String(active));
 button.querySelector("span").textContent=active?"Ausgewählt":"Design wählen";
 });
 updateDetails();
}
function updateDetails() {
 const d=designs.find(d=>d.id===selected);
 el("detail-heading").textContent=d.name;
 el("detail-description").textContent=d.description;
 const asset=releaseAssets.get(selected);
 const link=el("download");
 link.removeAttribute("href");
 link.classList.add("disabled");
 link.setAttribute("aria-disabled","true");
 link.tabIndex=-1;
 link.textContent="Noch keine PRG-Datei ↓";
 if(asset) {
    link.href=asset.url;
    link.classList.remove("disabled");
    link.setAttribute("aria-disabled","false");
    link.tabIndex=0;
    link.textContent=d.name+" · PRG herunterladen ↓";
    el("release-status").textContent="Build verfügbar · "+asset.tag+(asset.pre?" · Vorabversion":"");
    el("release-note").textContent="Version 0.2.1: kräftige, größere Schriften, deutlich größere Akkuanzeige, klare Linien und Garmin-Alarmanzahl. Kompiliert, aber noch nicht im Garmin-Simulator oder auf deiner Uhr bestätigt. Erst ein Design testen.";
 } else {
    const messages={loading:"Downloadstatus wird geprüft …",empty:"Noch kein installierbarer Build veröffentlicht.",error:"Status konnte nicht geladen werden. Bitte erneut prüfen.",ready:"Für dieses Design ist noch kein Build verfügbar."};
    el("release-status").textContent=messages[releaseState]+(checkedAt?" · "+checkedAt:"");
    el("release-note").textContent="Der Quellcode ist vorhanden. Zuerst mit dem Garmin SDK kompilieren und auf der Venu X1 testen. Der Browser kann die Datei nicht auf die Uhr installieren.";
 }
 document.querySelectorAll(".guide .notice").forEach(n=>{
    if(!n.dataset.original) n.dataset.original=n.innerHTML;
    if(asset && n.closest("#guide-iphone")===null) n.textContent="Für "+d.name+" ist ein kompilierter Testbuild verfügbar. Ein kompilierter Build bestätigt noch keinen Uhrentest. Anschließend die folgenden USB-Schritte verwenden.";
    else n.innerHTML=n.dataset.original;
 });
}
function validAsset(a,slug) {
 try {
    const url=new URL(a.browser_download_url);
    return a.name==="Jorge-"+slug+".prg" && a.size>0 &&
       url.protocol==="https:" && url.hostname==="github.com" &&
       url.pathname.startsWith("/"+REPO+"/releases/download/");
 } catch(_) { return false; }
}
async function checkReleases() {
 if (window.JORGE_CURRENT_BUILD) {
  releaseAssets=new Map(designs.map(d=>[d.id,{url:"./builds/0.2.1/Jorge-"+d.id+".prg",tag:"0.2.1",pre:true}]));
  releaseState="ready";el("retry").disabled=false;updateDetails();return;
 }
 releaseState="loading";checkedAt="";el("retry").disabled=true;updateDetails();
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
 try {
    const response=await fetch("https://api.github.com/repos/"+REPO+"/releases?per_page=100",{signal:controller.signal,headers:{Accept:"application/vnd.github+json"}});
    if(!response.ok) throw new Error("HTTP "+response.status);
    const releases=await response.json();if(!Array.isArray(releases)) throw new Error("Invalid response");
    const found=new Map();
    for(const release of releases) {
      if(release.draft || !Array.isArray(release.assets))continue;
      for(const d of designs) {
        if(found.has(d.id)) continue;
        const asset=release.assets.find(a=>validAsset(a,d.id));
        if(asset)found.set(d.id,{url:asset.browser_download_url,tag:String(release.tag_name||"Release"),pre:Boolean(release.prerelease)});
      }
    }
    releaseAssets=found;
    releaseState=found.size?"ready":"empty";
    checkedAt="geprüft um "+new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
 } catch(_) { releaseAssets=new Map();releaseState="error"; }
 finally {clearTimeout(timer);el("retry").disabled=false;updateDetails();}
}
el("designs").addEventListener("click",event=>{const b=event.target.closest("[data-select]");if(b) selectDesign(b.dataset.select);});
el("live-toggle").addEventListener("click",()=>{live=!live;el("live-toggle").setAttribute("aria-pressed",String(live));el("live-toggle").textContent=live?"● Live-Uhrzeit":"Originaldesign";tick();});
el("aod-toggle").addEventListener("click",()=>{aod=!aod;el("aod-toggle").setAttribute("aria-pressed",String(aod));tick();});
function activateTab(tab) {
 document.querySelectorAll('[role="tab"]').forEach(t=>{
 const active=t===tab;t.setAttribute("aria-selected",String(active));t.tabIndex=active?0:-1;
 el(t.getAttribute("aria-controls")).hidden=!active;
 });
}
document.querySelectorAll('[role="tab"]').forEach((tab,index,tabs)=>{
 tab.addEventListener("click",()=>activateTab(tab));
 tab.addEventListener("keydown",event=>{
 let next=index;
 if(event.key==="ArrowRight")next=(index+1)%tabs.length;
 else if(event.key==="ArrowLeft")next=(index+tabs.length-1)%tabs.length;
 else if(event.key==="Home")next=0;
 else if(event.key==="End")next=tabs.length-1;
 else return;
 event.preventDefault();activateTab(tabs[next]);tabs[next].focus();
 });
});
let toastTimer;
function toast(message){el("toast").textContent=message;el("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el("toast").classList.remove("show"),3500);}
document.querySelectorAll("[data-copy]").forEach(button=>button.addEventListener("click",async()=>{
 try{await navigator.clipboard.writeText(button.dataset.copy);toast("Kopiert.");}
 catch(_){toast("Kopieren nicht möglich. Text bitte markieren und kopieren.");}
}));
el("retry").addEventListener("click",checkReleases);
renderCards();updateDetails();checkReleases();setInterval(tick,1000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick();});
