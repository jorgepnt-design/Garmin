"use strict";
const REPO = "jorgepnt-design/Garmin";
const designs = [
 {id:"sport",name:"Sport",accent:"#a8ff24",description:"Klare Zahlen, Neongrün und drei Rundanzeigen. Dein sportlicher Begleiter für jeden Tag."},
 {id:"elegant",name:"Elegant",accent:"#e8cd91",description:"Champagnergold auf tiefem Schwarz. Reduzierte Linien und eine ruhige, elegante Aufteilung."},
 {id:"tesla",name:"Tesla",accent:"#ff2438",description:"Rot, Weiß und eine selbst gezeichnete Limousine. Inspiriert von deinem automobilen Stil."},
 {id:"portugal",name:"Portugal",accent:"#00c765",description:"Grün, Rot und goldene Akzente. Ein Stück Portugal an deinem Handgelenk."}
];
let selected = "sport";
try { const saved=localStorage.getItem("jorge-design"); if(designs.some(d=>d.id===saved)) selected=saved; } catch (_) {}
let live = true, aod = false, releaseState = "loading", releaseAssets = new Map(), checkedAt = "";
const el = id => document.getElementById(id);
function escapeXml(value) { return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c])); }
function previewSvg(d) {
 const now = live ? new Date() : new Date(2026,9,20,20,35,42);
 const fmt=n=>String(n).padStart(2,"0");
 const time=fmt(now.getHours())+":"+fmt(now.getMinutes());
 const sec=fmt(now.getSeconds());
 const date=now.toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"short"}).toUpperCase();
 const gold=d.id==="elegant", portugal=d.id==="portugal", sport=d.id==="sport", tesla=d.id==="tesla";
 const c=d.accent;
 const t=(x,y,value,size=22,color="#fff",anchor="middle",weight=500)=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" text-anchor="'+anchor+'" font-weight="'+weight+'">'+escapeXml(value)+'</text>';
 let body="";
 if(aod) {
    body=t(224,255+(now.getMinutes()%5-2)*2,time,76,"#777","middle",400);
 } else {
    if(portugal) body+='<path d="M18 103v303" stroke="#00c765" stroke-width="4"/><path d="M430 103v303" stroke="#ef3340" stroke-width="4"/><circle cx="224" cy="50" r="21" fill="none" stroke="#e8cd91" stroke-width="2"/><path d="M212 36h24v23q-12 24-24 0z" fill="#ef3340"/><path d="M218 41h12v17q-6 13-12 0z" fill="white"/><path d="M222 43h4v4h-4zm-3 7h4v4h-4zm7 0h4v4h-4zm-4 7h4v4h-4z" fill="#039"/>';
    const top=portugal?115:68;
    body+=t(35,top,date,20,gold?c:"#fff","start")+t(411,top,"78%",21,c,"end");
    if(gold) body+='<path d="M35 105h378M35 335h378" stroke="'+c+'" stroke-width="1"/>';
    const y=portugal?263:235;
    body+=t(191,y,time,gold?93:100,gold?c:"#fff","middle",gold?300:650)+t(405,y,":"+sec,35,c,"end",500);
    if(tesla) body+='<path d="M38 304h372" stroke="'+c+'" stroke-width="2"/><g fill="none" stroke="#d9dee5" stroke-width="2"><path d="M65 300l11-16 47-7 39-30 83-3 47 19 55 12 32 12 3 21-35 4-16-19h-24l-16 19H142l-16-19h-24l-14 19-23-4z"/><path d="M137 277l37-23 65-2 41 22zM202 254v48"/><circle cx="114" cy="311" r="17"/><circle cx="319" cy="311" r="17"/></g>';
    if(sport) body+='<g fill="none" stroke="#263025" stroke-width="3"><circle cx="82" cy="397" r="63"/><circle cx="224" cy="397" r="63"/><circle cx="366" cy="397" r="63"/></g><path d="M35 307h378" stroke="'+c+'" stroke-width="2"/>';
    else body+='<path d="M153 365v85M295 365v85" stroke="'+(gold?c:"#343940")+'"/>';
    body+=t(82,396,"16°C",29,c)+t(82,435,"WETTER",16,"#a0a5ac");
    body+=t(224,396,"8,42 km",26,gold?c:"#fff")+t(224,435,"HEUTE",16,"#a0a5ac");
    body+=t(366,396,"06:30",28,portugal?"#ef3340":c)+t(366,435,"MANUELL*",15,"#a0a5ac");
 }
 return '<svg viewBox="0 0 448 486" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+d.name+' – '+(aod?'Ruhemodus '+time:'Vorschau '+time+':'+sec)+'" font-family="Arial, sans-serif"><rect width="448" height="486" fill="#000"/>'+body+'</svg>';
}
function renderCards() {
 el("designs").innerHTML = designs.map((d,i)=>'<article class="design-card'+(selected===d.id?' selected':'')+'" data-design="'+d.id+'"><div class="card-top"><span>0'+(i+1)+' / '+d.name.toUpperCase()+'</span><span class="selected-mark">✓ AUSWAHL</span></div><div class="watch-shell"><div class="watch-case" id="preview-'+d.id+'">'+previewSvg(d)+'</div></div><h3>'+d.name+'</h3><p>'+escapeXml(d.description)+'</p><button class="select-design" type="button" data-select="'+d.id+'" aria-pressed="'+(selected===d.id)+'" aria-label="'+d.name+' auswählen"><span>'+(selected===d.id?'Ausgewählt':'Design wählen')+'</span><span aria-hidden="true">↗</span></button></article>').join("");
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
    el("release-note").textContent="Echte Release-Datei. Ein veröffentlichter Build bestätigt keinen Uhrentest. Release-Hinweise lesen und danach per USB übertragen.";
 } else {
    const messages={loading:"Downloadstatus wird geprüft …",empty:"Noch kein installierbarer Build veröffentlicht.",error:"Status konnte nicht geladen werden. Bitte erneut prüfen.",ready:"Für dieses Design ist noch kein Build verfügbar."};
    el("release-status").textContent=messages[releaseState]+(checkedAt?" · "+checkedAt:"");
    el("release-note").textContent="Der Quellcode ist vorhanden. Zuerst mit dem Garmin SDK kompilieren und auf der Venu X1 testen. Der Browser kann die Datei nicht auf die Uhr installieren.";
 }
 document.querySelectorAll(".guide .notice").forEach(n=>{
    if(!n.dataset.original) n.dataset.original=n.innerHTML;
    if(asset && n.closest("#guide-iphone")===null) n.textContent="Für "+d.name+" wurde eine PRG-Datei im GitHub-Release gefunden. Die Release-Hinweise vor dem Download lesen; ein veröffentlichter Build bestätigt noch keinen Uhrentest. Anschließend die folgenden USB-Schritte verwenden.";
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
el("live-toggle").addEventListener("click",()=>{live=!live;el("live-toggle").setAttribute("aria-pressed",String(live));el("live-toggle").textContent=live?"● Live-Uhrzeit":"Beispiel 20:35:42";tick();});
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
