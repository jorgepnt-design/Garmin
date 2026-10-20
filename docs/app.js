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
 const hh=fmt(now.getHours()),mm=fmt(now.getMinutes()),sec=fmt(now.getSeconds()),time=hh+":"+mm;
 const days=["SO","MO","DI","MI","DO","FR","SA"],months=["JAN","FEB","MÄR","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DEZ"];
 const date=days[now.getDay()]+", "+fmt(now.getDate())+". "+months[now.getMonth()];
 const gold=d.id==="elegant",portugal=d.id==="portugal",sport=d.id==="sport",tesla=d.id==="tesla",c=d.accent,id=d.id;
 const t=(x,y,value,size=22,color="#fff",anchor="middle",weight=500,extra="")=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" text-anchor="'+anchor+'" font-weight="'+weight+'" '+extra+'>'+escapeXml(value)+'</text>';
 const icon=(name,x,y,color,scale=1)=>{
   const paths={
     weather:'<circle cx="-7" cy="-5" r="9" fill="none"/><path d="M-7-20v-5m-13 7-4-4m-2 17h-6m12 10-4 4m28-27 4-4M7-5h5"/><path d="M-11 13h23a9 9 0 0 0 0-18 13 13 0 0 0-24-2 10 10 0 0 0 1 20z" fill="#000"/>',
     run:'<circle cx="6" cy="-19" r="5" fill="'+color+'" stroke="none"/><path d="m-12-10 11-4 10 10 9-5M0-13-5 2l12 9-4 12M-5 2l-8 13-11 2" stroke-width="5"/>',
     alarm:'<circle cx="0" cy="0" r="14"/><path d="M0-9V0l7 4m-16 9-4 7m22-7 4 7M-10-19l-5-4-6 7m31-3 5-4 6 7"/>'
   };
   return '<g transform="translate('+x+' '+y+') scale('+scale+')" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</g>';
 };
 const clock=(y)=>{
   if(gold)return t(26,y,time,126,c,"start",300,'font-family="Georgia, Times New Roman, serif" textLength="318" lengthAdjust="spacingAndGlyphs"')+t(425,y,":"+sec,50,c,"end",300,'font-family="Georgia, serif"');
   const mainColor=sport?"#b0ff22":tesla?"#ff233b":"#fff";
   const extra='textLength="143" lengthAdjust="spacingAndGlyphs"'+(sport?' font-style="italic"':"");
   return t(24,y,hh,139,"#fff","start",900,extra)+t(180,y-6,":",110,mainColor,"middle",800)+t(197,y,mm,139,mainColor,"start",900,extra)+t(425,y,":"+sec,57,sport?"#b0ff22":mainColor,"end",750);
 };
 const shield='<g transform="translate(224 44)"><circle r="22" fill="none" stroke="#d7ba64" stroke-width="2"/><path d="M-13-16h26V3Q12 18 0 23-12 18-13 3z" fill="#df2038" stroke="#f5dc9c"/><path d="M-8-11H8V3Q7 13 0 17-7 13-8 3z" fill="#fff"/><g fill="#154c9d"><rect x="-2" y="-8" width="4" height="5" rx="1"/><rect x="-6" y="-1" width="4" height="5" rx="1"/><rect x="2" y="-1" width="4" height="5" rx="1"/><rect x="-2" y="6" width="4" height="5" rx="1"/></g><g fill="#f4d06c"><circle cx="-10" cy="-13" r="1.5"/><circle cx="0" cy="-13" r="1.5"/><circle cx="10" cy="-13" r="1.5"/><circle cx="-10" cy="1" r="1.5"/><circle cx="10" cy="1" r="1.5"/><circle cy="19" r="1.5"/></g></g>';
 let body="";
 const defs='<defs><linearGradient id="metal-'+id+'" x2="0" y2="1"><stop stop-color="#fafafa"/><stop offset=".24" stop-color="#90999f"/><stop offset=".5" stop-color="#1f262a"/><stop offset=".7" stop-color="#505d65"/><stop offset="1" stop-color="#0c1013"/></linearGradient><linearGradient id="glass-'+id+'" x2=".4" y2="1"><stop stop-color="#8b9da8"/><stop offset=".3" stop-color="#19242d"/><stop offset="1" stop-color="#050a0d"/></linearGradient></defs>';
 if(aod)body=t(224,255+(now.getMinutes()%5-2)*2,time,76,"#777","middle",400);
 else {
  if(portugal){
   body+=shield;
   for(let n=0;n<100;n++){const y=30+(n*47%410),x=14+(n*19%17),r=.5+(n%4)*.6;body+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#00c765" opacity="'+(.2+n%5*.15)+'"/><circle cx="'+(448-x)+'" cy="'+y+'" r="'+r+'" fill="#ef3340" opacity="'+(.2+n%5*.15)+'"/>';}
   body+='<path d="M15 95q-15 128 0 289M433 95q15 128 0 289" fill="none" stroke="#00bf67" stroke-width="3"/><path d="M433 95q15 128 0 289" fill="none" stroke="#ef3340" stroke-width="3"/>';
  }
  const top=portugal?104:57;
  body+=t(28,top,date,23,gold?c:"#fff","start",550);
  body+='<g transform="translate(316 '+(top-20)+')" stroke="'+(gold?c:sport?c:portugal?c:"#fff")+'" stroke-width="2" fill="none"><rect width="31" height="18" rx="3"/><path d="M33 5v8"/><rect x="3" y="3" width="23" height="12" rx="1" fill="'+c+'" stroke="none"/></g>'+t(421,top,"78%",23,gold?c:"#fff","end",500);
  if(gold)body+='<path d="M27 89h394M27 303h394" stroke="#bda264" opacity=".6"/>';
  body+=clock(gold?252:tesla?217:portugal?275:244);
  if(tesla){
    body+='<path d="M15 312h418" stroke="#ef233c" stroke-width="2"/><ellipse cx="226" cy="335" rx="183" ry="9" fill="#222" opacity=".7"/><g><path d="m45 302 14-14 51-9q27-35 68-37l79 1q28 2 61 30l55 13 24 14 4 22-30 3-15-21-25-2-18 25H130l-17-24-25 1-13 22-31-7z" fill="url(#metal-'+id+')" stroke="#adb7bc" stroke-width="1.5"/><path d="m119 279 45-29q42-8 90 0l51 26z" fill="url(#glass-'+id+')" stroke="#c2cbd1"/><path d="M205 248v31m-84 1 2 28m86-27 1 32m96-34-7 34M65 303q158-9 312 0" fill="none" stroke="#7c8992" stroke-width="1"/><path d="m64 290-11 8 28-3m289-6 19 10" stroke="#fafafa" stroke-width="2"/><path d="m387 300 9 5v7" fill="none" stroke="#ff253c" stroke-width="3"/><path d="M214 287h10m73-1h8" stroke="#c1cbd2" stroke-width="2"/>';
    for(const x of [105,345]){
      body+='<g transform="translate('+x+' 319)"><circle r="23" fill="#060708" stroke="#43484b" stroke-width="3"/><circle r="16" fill="#171c20" stroke="#adb4b8"/><path d="M6-11v22" stroke="#ec2842" stroke-width="4"/>';
      for(let n=0;n<10;n++)body+='<path d="M0-3 3-15 5-6z" fill="#a5afb4" transform="rotate('+(n*36)+')"/>';
      body+='<circle r="4" fill="#333e45"/></g>';
    }body+='</g>';
  }
  const centers=[78,224,370],values=["16°C","8,42 km","06:30"],labels=["WETTER","HEUTE","MANUELL*"],icons=["weather","run","alarm"];
  if(sport){
   for(let n=0;n<3;n++){
    const x=centers[n];
    body+='<circle cx="'+x+'" cy="384" r="60" fill="none" stroke="#354047" stroke-width="7"/><circle cx="'+x+'" cy="384" r="60" fill="none" stroke="#b0ff22" stroke-width="7" stroke-dasharray="'+[245,283,215][n]+' 377" transform="rotate(-90 '+x+' 384)"/>';
    body+=icon(icons[n],x,355,n===0?"#f0ce57":"#b0ff22",.75);
    body+=t(x,400,values[n],n===1?25:27,"#fff","middle",650)+t(x,427,labels[n],13,"#d9dde0","middle",500);
   }
  }else{
   if(!gold)body+='<path d="M151 365v86M297 365v86" stroke="'+(tesla?"#a51a2b":"#314737")+'"/>';
   else body+='<path d="M151 330v113M297 330v113" stroke="#bda264" opacity=".65"/>';
   for(let n=0;n<3;n++){
    const color=gold?c:portugal?(n===2?"#ef3340":"#00ce6d"):"#ff2438";
    body+=icon(icons[n],centers[n],gold?349:374,color,.82);
    body+=t(centers[n],gold?399:422,values[n],n===1?25:28,"#fff","middle",550);
    body+=t(centers[n],gold?432:450,labels[n],13,"#b6b9bd","middle",500);
   }
  }
 }
 return '<svg viewBox="0 0 448 486" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+d.name+' – '+(aod?'Ruhemodus '+time:'Vorschau '+time+':'+sec)+'" font-family="Arial, sans-serif">'+defs+'<rect width="448" height="486" fill="#000"/>'+body+'</svg>';
}
function venuFrame() {
 return '<svg class="venu-hardware" viewBox="0 0 500 726" xmlns="http://www.w3.org/2000/svg" aria-label="Garmin Venu X1, schwarzes Gehäuse mit zwei seitlichen Tasten und ComfortFit-Nylonarmband" role="img"><defs><pattern id="nylon" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#20221f"/><path d="m0 1 5 2m-5 1 5-2" stroke="#41443b" stroke-width=".7" opacity=".65"/></pattern><linearGradient id="case" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#686a62"/><stop offset=".08" stop-color="#252923"/><stop offset=".5" stop-color="#151813"/><stop offset=".88" stop-color="#42483c"/><stop offset="1" stop-color="#11150f"/></linearGradient><linearGradient id="button"><stop stop-color="#7b7e73"/><stop offset=".5" stop-color="#343a2d"/><stop offset="1" stop-color="#171c13"/></linearGradient></defs><rect x="110" y="0" width="280" height="726" rx="23" fill="url(#nylon)" stroke="#353a2f" stroke-width="2"/><path d="M122 0v726m256-726v726" stroke="#6a6b5e" stroke-width="2" opacity=".45"/><g fill="url(#button)" stroke="#4c5343"><rect x="480" y="221" width="15" height="58" rx="5"/><rect x="480" y="435" width="15" height="48" rx="5"/></g><rect x="8" y="99" width="478" height="526" rx="57" fill="url(#case)" stroke="#72766a" stroke-width="2"/><rect x="14" y="105" width="466" height="514" rx="53" fill="#0a0b09" stroke="#30352b" stroke-width="2"/><rect x="24" y="119" width="448" height="486" rx="43" fill="#000"/><text transform="translate(479 211) rotate(90)" font-family="Arial,sans-serif" font-size="5" letter-spacing="1" fill="#a1a696">START / STOP</text><text transform="translate(479 424) rotate(90)" font-family="Arial,sans-serif" font-size="5" letter-spacing="1" fill="#a1a696">BACK</text><text x="248" y="617" text-anchor="middle" fill="#7f8576" font-family="Arial,sans-serif" font-size="6" letter-spacing="2">GARMIN</text></svg>';
}
function renderCards() {
 el("designs").innerHTML = designs.map((d,i)=>'<article class="design-card'+(selected===d.id?' selected':'')+'" data-design="'+d.id+'"><div class="card-top"><span>0'+(i+1)+' / '+d.name.toUpperCase()+'</span><span class="selected-mark">✓ AUSWAHL</span></div><div class="watch-shell">'+venuFrame()+'<div class="watch-case" id="preview-'+d.id+'">'+previewSvg(d)+'</div></div><div class="hardware-label">GARMIN VENU X1</div><h3>'+d.name+'</h3><p>'+escapeXml(d.description)+'</p><button class="select-design" type="button" data-select="'+d.id+'" aria-pressed="'+(selected===d.id)+'" aria-label="'+d.name+' auswählen"><span>'+(selected===d.id?'Ausgewählt':'Design wählen')+'</span><span aria-hidden="true">↗</span></button></article>').join("");
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
