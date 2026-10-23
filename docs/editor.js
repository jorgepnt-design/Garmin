'use strict';
(async()=>{
 const $=id=>document.getElementById(id),canvas=$('design'),ctx=canvas.getContext('2d'),KEY='jorge-editor-v1',requested=new URLSearchParams(location.search).get('design'),original=new URLSearchParams(location.search).get('template'),slots={sport:'Sport',elegant:'Elegant',tesla:'Tesla',portugal:'Portugal',ocean:'Ocean',solar:'Solar',minimal:'Minimal'},SLOT=slots[requested]?KEY+':'+requested:KEY;
 const labels={time:'Uhrzeit',hours:'Stunden',minutes:':Minuten',seconds:'Sekunden',date:'Datum',battery:'Akku',temperature:'Temperatur',distance:'Tagesdistanz',alarmCount:'Alarmanzahl',alarmStatus:'Alarmstatus',text:'Text',icon:'Symbol',image:'Bild'};
 let CAR_DATA,LEGACY_CAR_DATA;
 // Reconstruct the exact historical damaged image for a lossless migration.
 const LEGACY_CAR_CHANGES=[[2417,"9"],[2733,"9"],[5336,"9"],[6021,"9"],[6968,"9"],[9193,"9"],[9531,"9"],[12296,"3"],[12484,"9"],[12573,"3"],[13505,"9"],[14330,"9"],[15265,"9"],[18412,"9"],[20072,"9"],[20689,"9"],[22449,"9"],[22528,"9"],[23217,"9"],[24450,"9"],[24688,"9"],[25142,"9"],[27484,"9"],[29282,"9"],[29722,"9"],[30786,"3"],[31717,"9"],[32811,"9"],[33070,"9"],[33087,"9"],[35074,"9"],[35177,"9"],[35779,"9"],[36964,"9"],[39343,"9"],[39482,"9"],[39780,"3"]];
 async function loadCarArtwork(){
  const response=await fetch('assets/car.png?v=1');
  if(!response.ok)throw Error('Tesla-Bild konnte nicht geladen werden. Bitte den Editor neu laden.');
  const bytes=new Uint8Array(await response.arrayBuffer());let binary='';
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  CAR_DATA='data:image/png;base64,'+btoa(binary);
  const previous=CAR_DATA.split('');for(const [i,ch] of LEGACY_CAR_CHANGES)previous[i]=ch;LEGACY_CAR_DATA=previous.join('');
 }

 const designStore=JorgeDesignStore.create();let activeId=requested||null,saveQueue=Promise.resolve(),saveVersion=0;
 const fonts=['bold','sans','serif','mono']; let atlas,atlasImages={},state,selected=0,history=[],future=[],drag=null,images=new Map(),clean=false;
 const clone=v=>JSON.parse(JSON.stringify(v));
 const element=(type,x,y,size,color='#ffffff',font='sans',text='')=>({type,x,y,size,color,font,text,visible:true,icon:'alarm'});
 function preset(name){const a={Sport:'#a8ff24',Elegant:'#e8cd91',Tesla:'#ff2438',Portugal:'#00c765',Ocean:'#53d5ff',Solar:'#ffbe54',Minimal:'#eeeeee'}[name];const elegant=name==='Elegant',minimal=name==='Minimal';let e=[element('date',28,38,21,a),element('battery',316,34,30,a),element('time',24,125,elegant?108:96,a,elegant?'serif':'bold'),element('seconds',337,173,37,a,elegant?'serif':'mono')];
 if(name==='Portugal')e.unshift({...element('icon',16,80,4,a),icon:'line',width:4,height:340},{...element('icon',428,80,4,'#ef3340'),icon:'line',width:4,height:340});
 if(name==='Tesla'){e[2].y=103;e[3].y=151;e.push({...element('icon',28,294,3,a),icon:'line',width:392,height:3},{...element('image',40,232,30),width:368,height:100,data:CAR_DATA});}
 if(name==='Ocean'){e[2].font='mono';e[2].size=94;e.push(element('text',28,275,16,a,'mono','ATLANTIC / VENU X1'));}
 if(name==='Solar')e.push({...element('icon',195,270,42,a),icon:'sun'});
 if(!minimal){e.push({...element('icon',48,340,33,a),icon:'sun'},{...element('icon',203,340,33,a),icon:'run'},{...element('icon',358,340,33,a),icon:'alarm'},element('temperature',29,386,27,a,'bold'),element('distance',167,386,27,'#ffffff','bold'),element('alarmCount',366,386,27,a,'bold'),element('text',31,429,16,'#d9dde1','sans','WETTER'),element('text',166,429,16,'#d9dde1','sans','KM HEUTE'),element('alarmStatus',345,429,16,'#d9dde1'));}else{e[2].y=174;e[3].y=222;e.push(element('alarmCount',343,396,24,a),element('alarmStatus',337,429,15,a));}
 if(['Sport','Elegant','Tesla','Portugal'].includes(name)){
 const f=name==='Elegant'?'elegant':name==='Sport'?'sport':'bold',pt=name==='Portugal',top=pt?94:47,y=pt?155:name==='Tesla'?104:120;
 e=[element('date',28,top+6,22,elegant?a:'#ffffff','original-date'),element('battery',326,top-5,36,a,'original-battery'),element('hours',26,y,128,elegant?a:'#ffffff','original-'+f),element('minutes',178,y,128,pt?'#ffffff':a,'original-'+f),element('seconds',362,y+72,56,a,'original-'+f)];
 // Seconds use the matching smaller original font atlas.
 e[4].font='original-'+f+'-seconds';if(elegant){e[2].x=30;e[4].x=358;}
 if(elegant)e.push({...element('icon',35,95,2,a),icon:'line',width:378,height:1},{...element('icon',35,320,2,a),icon:'line',width:378,height:1});
 if(name==='Sport')e.push({...element('icon',35,307,2,a),icon:'line',width:378,height:1});
 if(name==='Tesla')e.push({...element('image',40,242,30),width:368,height:100,data:CAR_DATA});
 if(pt)e.push({...element('icon',19,103,4,a),icon:'line',width:4,height:303},{...element('icon',429,103,4,'#ef3340'),icon:'line',width:4,height:303});
 for(let i=0;i<3;i++){const x=82+i*142,c=pt&&i===2?'#ef3340':a;e.push({...element('icon',x-20,333,40,c),icon:['sun','run','alarm'][i]});}
 e.push(element('temperature',29,389,32,a,'original-value'),element('distance',164,389,32,elegant?a:'#ffffff','original-value'),element('alarmCount',354,389,32,pt?'#ef3340':a,'original-value'),element('text',31,431,18,'#d9dde1','original-label','WETTER'),element('text',168,431,18,'#d9dde1','original-label','KM HEUTE'),element('alarmStatus',333,431,18,'#d9dde1','original-label'));
 }
 return{version:1,name,templateId:slotId(name),background:'#000000',elements:e};}
 function validate(v){if(!v||v.version!==1||!Array.isArray(v.elements)||v.elements.length>40||!/^#[0-9a-f]{6}$/i.test(v.background))throw Error('Ungültige Designdatei (Version 1, höchstens 40 Elemente).');v.name=String(v.name||'Mein Design').slice(0,40);for(const e of v.elements){if(e.type==='image'&&e.data===LEGACY_CAR_DATA)e.data=CAR_DATA;if(!labels[e.type]||!(fonts.includes(e.font)||/^original-(sport|elegant|bold|sport-seconds|elegant-seconds|bold-seconds|date|battery|value|label)$/.test(e.font))||!/^#[0-9a-f]{6}$/i.test(e.color)||!Number.isFinite(e.x)||!Number.isFinite(e.y)||!Number.isFinite(e.size)||e.size<12&&e.type!=='icon'||e.size>150)throw Error('Ungültiges Element.');if(e.x<0||e.x>447||e.y<0||e.y>485)throw Error('Elementposition außerhalb der Uhr.');if(e.type==='text'&&(!/^[\x20-\x7eÄÖÜäöüß°]*$/.test(e.text)||e.text.length>35))throw Error('Text: maximal 35 Zeichen, lateinische Zeichen und deutsche Umlaute.');if(e.type==='icon'&&!['alarm','sun','run','heart','battery','line'].includes(e.icon))throw Error('Unbekanntes Symbol.');if(e.type==='image'&&(!/^data:image\/png;base64,/.test(e.data)||e.data.length>1500000||e.width<8||e.width>448||e.height<8||e.height>486))throw Error('Ungültiges Bild.');}return v;}
 function remember(){history.push(JSON.stringify(state));if(history.length>35)history.shift();future=[];}
 function slotId(name){return Object.keys(slots).find(k=>slots[k]===name)||({Ocean:'ocean',Solar:'solar',Minimal:'minimal'}[name])||'custom-'+Date.now().toString(36);}
 async function updateSavedList(){const rows=await designStore.list();$('saved-designs').replaceChildren(...[new Option('Gespeicherten Entwurf wählen …',''),...rows.map(r=>new Option(r.name,r.id))]);$('saved-designs').value=activeId;}
 function save(){
  if(lastBuiltState&&lastBuiltState!==JSON.stringify(state)){$('convert-download').hidden=true;const link=document.getElementById('convert-preview');if(link)link.hidden=true;$('convert-status').textContent='Entwurf geändert. Bitte erneut umwandeln, damit die PRG diesen Änderungen entspricht.';lastBuiltState=null;}
  activeId=activeId||state.editorId||slotId(state.name);state.editorId=activeId;const id=activeId,snapshot=designStore.clean(state),version=++saveVersion;
  $('save-state').textContent='Wird gespeichert …';
  saveQueue=saveQueue.catch(()=>{}).then(()=>designStore.put(id,snapshot)).then(()=>{if(version===saveVersion)$('save-state').textContent='Design gespeichert · in diesem Browser';return updateSavedList();}).catch(e=>{if(version===saveVersion)$('save-state').textContent='Speichern fehlgeschlagen – Designdatei sichern';throw e;});saveQueue.catch(()=>{});
  $('undo').disabled=!history.length;$('redo').disabled=!future.length;return saveQueue;
 }
 async function templateRow(row,id){
  if(!row)return null;
  const origin=row.design.templateId,named=Object.keys(slots).find(k=>slots[k]===row.design.name);
  if(origin===id||(!origin&&(!named||named===id)))return row;
  const recovered='recovered-'+crypto.randomUUID();
  await designStore.put(recovered,row.design,row.preview);
  return null;
 }
 async function openSaved(id,fallback,template=false){await saveQueue.catch(()=>{});let row=await designStore.get(id);if(template)row=await templateRow(row,id);remember();activeId=!row&&(await designStore.trash()).some(r=>r.id===id)?'custom-'+Date.now().toString(36):id;state=row?validate(row.design):preset(fallback);selected=0;const url=new URL(location.href);url.searchParams.set('design',activeId);historyAPI(url);if([...$('preset').options].some(o=>o.value===state.name))$('preset').value=state.name;refresh();await saveQueue;}
 function historyAPI(url){window.history.replaceState(null,'',url.href);}
 $('saved-designs').onchange=async()=>{const id=$('saved-designs').value;if(!id)return;try{await openSaved(id,'Sport');message('Gespeicherten Entwurf geöffnet.');}catch(e){message('Öffnen fehlgeschlagen: '+e.message);}};

 function sample(e){const n=$('live').checked?new Date():new Date(2026,9,23,20,35,42),p=v=>String(v).padStart(2,'0');return{time:p(n.getHours())+':'+p(n.getMinutes()),hours:p(n.getHours()),minutes:':'+p(n.getMinutes()),seconds:':'+p(n.getSeconds()),date:['So.','Mo.','Di.','Mi.','Do.','Fr.','Sa.'][n.getDay()]+' '+p(n.getDate())+'.'+p(n.getMonth()+1)+'.',battery:'78%',temperature:'16°C',distance:'8.42',alarmCount:'2',alarmStatus:'AKTIV',text:e.text}[e.type]||'';}
 function box(e){if(e.type==='image')return[e.x,e.y,e.width,e.height];if(e.type==='icon')return[e.x,e.y,e.icon==='line'?(e.width||e.size):e.size,e.icon==='line'?(e.height||2):e.size];if(e.font.startsWith('original-')){const m=atlas[e.font.slice(9)],scale=e.size/m.height;return[e.x,e.y,[...sample(e)].reduce((w,c)=>w+Math.max(1,Math.round((m.glyphs[c]?.w||0)*scale)),0),e.size];}ctx.font=e.size+'px Editor-'+e.font;return[e.x,e.y,[...sample(e)].reduce((w,c)=>w+Math.max(2,Math.round(ctx.measureText(c).width)),0),Math.ceil(e.size*1.17)];}
 function icon(e){const x=e.x,y=e.y,s=e.size;ctx.strokeStyle=e.color;ctx.lineWidth=2;ctx.beginPath();const line=(a,b,c,d)=>{ctx.moveTo(x+a*s,y+b*s);ctx.lineTo(x+c*s,y+d*s);};if(e.icon==='line'){ctx.fillStyle=e.color;ctx.fillRect(x,y,e.width||s,e.height||2);return;}if(e.icon==='sun'){ctx.arc(x+s/2,y+s/2,s*.23,0,7);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(.5+Math.cos(a)*.34,.5+Math.sin(a)*.34,.5+Math.cos(a)*.48,.5+Math.sin(a)*.48);}}else if(e.icon==='alarm'){ctx.arc(x+s*.5,y+s*.5,s*.3,0,7);line(.5,.3,.5,.5);line(.5,.5,.7,.6);line(.15,.1,.02,.25);line(.85,.1,.98,.25);line(.3,.78,.2,.98);line(.7,.78,.8,.98);}else if(e.icon==='battery'){ctx.rect(x+s*.06,y+s*.3,s*.8,s*.4);ctx.rect(x+s*.88,y+s*.42,s*.08,s*.15);}else if(e.icon==='heart'){ctx.moveTo(x+s*.5,y+s*.9);ctx.bezierCurveTo(x-s*.3,y+s*.3,x+s*.1,y-s*.2,x+s*.5,y+s*.2);ctx.bezierCurveTo(x+s*.9,y-s*.2,x+s*1.3,y+s*.3,x+s*.5,y+s*.9);}else{ctx.arc(x+s*.6,y+s*.12,s*.08,0,7);line(.5,.3,.35,.6);line(.35,.6,.6,.72);line(.6,.72,.5,.98);line(.35,.6,.08,.93);line(.18,.4,.5,.3);line(.5,.3,.75,.5);line(.75,.5,.95,.35);}ctx.stroke();}
 const imageLoads=new Map();
 function loadImage(data){
  const cached=images.get(data);if(cached?.complete&&cached.naturalWidth!==0)return Promise.resolve(cached);
  if(imageLoads.has(data))return imageLoads.get(data);
  const promise=new Promise((resolve,reject)=>{const img=cached||new Image();images.set(data,img);img.onload=()=>{if(img.naturalWidth===0){imageLoads.delete(data);images.delete(data);reject(Error('Bild enthält keine lesbaren Pixel.'));return;}resolve(img);};img.onerror=()=>{images.delete(data);imageLoads.delete(data);reject(Error('Bild konnte nicht gelesen werden. Bitte PNG, JPG oder WebP verwenden; HEIC gegebenenfalls als JPG exportieren.'));};if(!cached)img.src=data;});
  imageLoads.set(data,promise);return promise;
 }
 async function loadDesignImages(d){await Promise.all(d.elements.filter(e=>e.visible&&e.type==='image').map(e=>loadImage(e.data)));}
 function paint(e){if(e.type==='image'){const im=images.get(e.data);if(im?.complete)ctx.drawImage(im,e.x,e.y,e.width,e.height);else if(!im){loadImage(e.data).then(draw).catch(error=>message(error.message));}}else if(e.type==='icon')icon(e);else if(e.font.startsWith('original-')){const name=e.font.slice(9),m=atlas[name],scale=e.size/m.height,w=box(e)[2],c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=e.size;const t=c.getContext('2d');let x=0;for(const ch of sample(e)){const g=m.glyphs[ch];if(g){t.drawImage(atlasImages[name],g.x,0,g.w,m.height,x,0,Math.max(1,Math.round(g.w*scale)),e.size);x+=Math.max(1,Math.round(g.w*scale));}}t.globalCompositeOperation='source-in';t.fillStyle=e.color;t.fillRect(0,0,c.width,c.height);ctx.drawImage(c,e.x,e.y);}else{ctx.font=e.size+'px Editor-'+e.font;ctx.fillStyle=e.color;ctx.textBaseline='alphabetic';let px=Math.round(e.x);for(const ch of sample(e)){ctx.fillText(ch,px,Math.round(e.y)+Math.round(e.size*.93));px+=Math.max(2,Math.round(ctx.measureText(ch).width));}}}
 function draw(){ctx.fillStyle=state.background;ctx.fillRect(0,0,448,486);state.elements.forEach((e,i)=>{if(!e.visible)return;paint(e);if(!clean&&i===selected){const [x,y,w,h]=box(e);ctx.strokeStyle='#72adff';ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.strokeRect(x-2,y-2,w+4,h+4);ctx.setLineDash([]);}});const e=state.elements[selected];$('bounds').textContent=e&&e.visible&&(box(e)[0]+box(e)[2]>448||box(e)[1]+box(e)[3]>486)?'Dieses Element ragt über den Displayrand. Position oder Größe anpassen.':'';}
 function refresh(){$('preset').value=[...$('preset').options].some(o=>o.value===state.name)?state.name:'';const e=state.elements[selected];$('name').value=state.name;$('background').value=state.background;$('elements').replaceChildren(...state.elements.map((e,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+'. '+labels[e.type]+(e.type==='text'?' · '+e.text:'')+(e.visible?'':' (aus)');return o;}));$('elements').value=selected;$('inspector').disabled=!e;if(e){for(const k of ['font','size','x','y','color','text','icon'])$(k).value=e[k]??'';$('visible').checked=e.visible;$('text-wrap').hidden=e.type!=='text';$('icon-wrap').hidden=e.type!=='icon';$('image-controls').hidden=!(e.type==='image'||e.type==='icon'&&e.icon==='line');$('font').disabled=['image','icon'].includes(e.type);$('size').disabled=e.type==='image';$('image-width').value=e.width||100;$('image-height').value=e.height||100;}save();draw();}
 function change(fn){remember();fn();refresh();}
 $('elements').onchange=()=>{selected=Number($('elements').value);refresh();};
 for(const k of ['font','size','x','y','color','text','icon','visible'])$(k).onchange=()=>{const e=state.elements[selected];if(!e)return;let v=k==='visible'?$(k).checked:['size','x','y'].includes(k)?Number($(k).value):$(k).value;if(k==='size')v=Math.max(12,Math.min(150,v));if(k==='x')v=Math.max(0,Math.min(447,v));if(k==='y')v=Math.max(0,Math.min(485,v));if(k==='text'&&!/^[\x20-\x7eÄÖÜäöüß°]*$/.test(v)){$('message').textContent='Bitte lateinische Zeichen und deutsche Umlaute verwenden.';return;}change(()=>e[k]=v);};
 for(const k of ['size','x','y','color','text'])$(k).addEventListener('input',()=>{const e=state.elements[selected];if(!e)return;const numeric=['size','x','y'].includes(k),raw=$(k).value,v=numeric?Number(raw):raw;if(numeric&&(raw===''||!Number.isFinite(v)||v<0||v>(k==='size'?150:k==='x'?447:485)||k==='size'&&v<12))return;if(k==='text'&&!/^[\x20-\x7eÄÖÜäöüß°]*$/.test(v))return;if(e[k]!==v){remember();e[k]=v;save();draw();}});
 for(const k of ['width','height'])$('image-'+k).onchange=()=>{const e=state.elements[selected],v=Math.max(8,Math.min(k==='width'?448:486,Number($('image-'+k).value)));change(()=>{if($('ratio').checked){const ratio=e.width/e.height;if(k==='width')e.height=Math.max(8,Math.min(486,Math.round(v/ratio)));else e.width=Math.max(8,Math.min(448,Math.round(v*ratio)));}e[k]=v;});};
 $('name').onchange=()=>{const name=$('name').value.trim();if(name)change(()=>state.name=name);};$('rename-design').onclick=async()=>{const name=$('name').value.trim();if(!name)return message('Bitte einen Designnamen eingeben.');try{if(state.name!==name)change(()=>state.name=name);await save();await updateSavedList();message('Design umbenannt: '+name);}catch(e){message('Umbenennen fehlgeschlagen: '+e.message);}};$('background').onchange=()=>change(()=>state.background=$('background').value);
 $('add').onclick=()=>{if(state.elements.length>=40)return message('Höchstens 40 Elemente.');change(()=>{state.elements.push(element($('add-type').value,40,260,30));selected=state.elements.length-1;});};
 const message=t=>$('message').textContent=t;
 $('delete').onclick=()=>change(()=>{state.elements.splice(selected,1);selected=Math.max(0,selected-1);});$('duplicate').onclick=()=>{if(state.elements.length>=40)return;change(()=>{const e=clone(state.elements[selected]);e.x=Math.min(447,e.x+8);e.y=Math.min(485,e.y+8);state.elements.push(e);selected=state.elements.length-1;});};
 $('front').onclick=()=>change(()=>{const e=state.elements.splice(selected,1)[0];state.elements.push(e);selected=state.elements.length-1;});$('back').onclick=()=>change(()=>{const e=state.elements.splice(selected,1)[0];state.elements.unshift(e);selected=0;});
 $('undo').onclick=()=>{if(!history.length)return;future.push(JSON.stringify(state));state=JSON.parse(history.pop());activeId=state.editorId||slotId(state.name);const u=new URL(location.href);u.searchParams.set('design',activeId);historyAPI(u);selected=0;refresh();};$('redo').onclick=()=>{if(!future.length)return;history.push(JSON.stringify(state));state=JSON.parse(future.pop());activeId=state.editorId||slotId(state.name);const u=new URL(location.href);u.searchParams.set('design',activeId);historyAPI(u);selected=0;refresh();};
 $('load-original').onclick=async()=>{
  const name=$('preset').value||slots[state.templateId]||'Sport';
  await saveQueue.catch(()=>{});remember();state=preset(name);activeId='custom-'+crypto.randomUUID();selected=0;
  const url=new URL(location.href);url.searchParams.delete('template');url.searchParams.set('design',activeId);historyAPI(url);
  refresh();await saveQueue;message('Originalvorlage als neuen Entwurf geöffnet. Deine gespeicherten Designs bleiben erhalten.');
 };
 $('preset').onchange=async()=>{const name=$('preset').value;$('preset').disabled=true;try{await openSaved(slotId(name),name,true);message('Entwurf geöffnet. Gespeicherte Änderungen bleiben erhalten.');}catch(e){message(e.message);}finally{$('preset').disabled=false;}};
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*448/r.width,y:(e.clientY-r.top)*486/r.height};};
 canvas.onpointerdown=e=>{const p=point(e);for(let i=state.elements.length-1;i>=0;i--){const el=state.elements[i],[x,y,w,h]=box(el);if(el.visible&&p.x>=x-5&&p.y>=y-5&&p.x<=x+w+5&&p.y<=y+h+5){selected=i;remember();drag={x:p.x-el.x,y:p.y-el.y};canvas.setPointerCapture(e.pointerId);refresh();break;}}};canvas.onpointermove=e=>{if(!drag)return;const p=point(e),el=state.elements[selected],snap=$('grid').checked?4:1;el.x=Math.max(0,Math.min(447,Math.round((p.x-drag.x)/snap)*snap));el.y=Math.max(0,Math.min(485,Math.round((p.y-drag.y)/snap)*snap));$('x').value=el.x;$('y').value=el.y;draw();};canvas.onpointerup=canvas.onpointercancel=()=>{if(drag){drag=null;refresh();}};
 function download(data,name,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function savePreview(){
  await loadDesignImages(state);await save();clean=true;draw();const slot=activeId;
  try{const preview=canvas.toDataURL('image/png');await designStore.put(activeId,state,preview);try{localStorage.setItem(KEY+':preview:'+slot,JSON.stringify({name:state.name,image:preview}));}catch{}await updateSavedList();message('Design gespeichert. Unter Meine gespeicherten Designs und auf der Landingpage wieder öffnen.');}finally{clean=false;draw();}
 }
 $('delete-design').onclick=async()=>{try{await saveQueue;await designStore.remove(activeId);window.location.assign('./#saved-collection');}catch(e){message('Löschen fehlgeschlagen: '+e.message);}};
 $('keep').onclick=()=>savePreview().catch(e=>message('Speichern fehlgeschlagen: '+e.message));
 $('save-as').onclick=async()=>{remember();activeId='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);state=clone(state);state.editorId=activeId;state.name=state.name+' Kopie';const u=new URL(location.href);u.searchParams.set('design',activeId);historyAPI(u);refresh();try{await savePreview();message('Neues Design gespeichert. Den Namen kannst du im Feld Designname ändern.');}catch(e){message(e.message);}};
 let lastBuiltState=null;
 async function portable(){
 const d=clone(state);d.buildId=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();d.renderVersion=1;d.renderAssets={};await loadDesignImages(d);
 for(let i=0;i<d.elements.length;i++){
  const e=d.elements[i];if(!e.visible)continue;
  if(['image','icon','text'].includes(e.type)){
   ctx.clearRect(0,0,448,486);paint(e);const b=box(e),x=Math.max(0,Math.floor(b[0])-2),y=Math.max(0,Math.floor(b[1])-2),w=Math.max(1,Math.min(448-x,Math.ceil(b[2])+4)),h=Math.max(1,Math.min(486-y,Math.ceil(b[3])+4));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(canvas,x,y,w,h,0,0,w,h);d.renderAssets[i]={kind:'bitmap',x,y,width:w,height:h,data:c.toDataURL('image/png')};
  }else{
   const original=e.font.startsWith('original-'),m=original?atlas[e.font.slice(9)]:null,chars=original?Object.keys(m.glyphs).join(''):'0123456789:.-% °CkmAKTIVUSSoMDiFra',height=original?e.size:Math.ceil(e.size*1.17),c=document.createElement('canvas'),t=c.getContext('2d');t.font=e.size+'px Editor-'+e.font;const glyphs={};let width=0;
   for(const ch of chars){const w=original?Math.max(1,Math.round(m.glyphs[ch].w*e.size/m.height)):Math.max(2,Math.round(t.measureText(ch).width));glyphs[ch]={x:width,w};width+=w;}
   c.width=width;c.height=height;t.font=e.size+'px Editor-'+e.font;t.fillStyle='#fff';t.textBaseline='alphabetic';
   for(const ch of chars){const g=glyphs[ch];if(original){const q=m.glyphs[ch];t.drawImage(atlasImages[e.font.slice(9)],q.x,0,q.w,m.height,g.x,0,g.w,height);}else t.fillText(ch,g.x,Math.round(e.size*.93));}
   d.renderAssets[i]={kind:'font',height,width,glyphs,data:c.toDataURL('image/png')};
  }
 }
 draw();return d;
 }
 $('json').onclick=async()=>{try{save();const d=await portable();await savePreview();download(JSON.stringify(d,null,2),'mein-design.json','application/json');message('Gespeichert: Layout und identische Schrift-/Bildpixel für den PRG-Bau.');}catch(e){draw();message('Speichern fehlgeschlagen: '+e.message);}};$('png').onclick=async()=>{try{await loadDesignImages(state);}catch(e){message(e.message);return;}clean=true;draw();canvas.toBlob(b=>{download(b,'mein-design.png','image/png');clean=false;draw();});};
 let conversionController=null;
 function tokenState(){let has=false;try{has=!!localStorage.getItem('gd_token');}catch{}$('convert-token-state').textContent=has?'GitHub-Schlüssel aus Garmin Designer ist in diesem Browser gespeichert.':'Noch kein GitHub-Schlüssel gespeichert.';}
 tokenState();
 $('convert-save-token').onclick=()=>{const token=$('convert-token').value.trim();if(!token){message('Bitte einen GitHub-Schlüssel eintragen.');return;}try{localStorage.setItem('gd_token',token);$('convert-token').value='';tokenState();}catch{message('Der Schlüssel konnte nicht gespeichert werden. Du kannst ihn zum einmaligen Umwandeln im Feld belassen.');}};
 $('convert-cancel').onclick=()=>conversionController?.abort();
 $('convert-now').onclick=async()=>{
  let token=$('convert-token').value.trim();try{token=token||localStorage.getItem('gd_token')||'';}catch{}
  const status=t=>$('convert-status').textContent=t;
  if(!token){status('Bitte unter „GitHub-Zugang einrichten“ deinen Schlüssel für garmindesigner eintragen.');return;}
  $('convert-now').disabled=true;$('convert-cancel').hidden=false;$('convert-download').hidden=true;const previousPreview=document.getElementById('convert-preview');if(previousPreview)previousPreview.hidden=true;conversionController=new AbortController();
  try{status('Der aktuelle Entwurf wird vorbereitet …');const builtState=JSON.stringify(state);const design=await portable();await savePreview();const result=await JorgeConverter.convert(design,token,$('convert-name').value,status,{signal:conversionController.signal});if(builtState!==JSON.stringify(state))throw Error('Der Entwurf wurde während des Baus verändert. Bitte erneut umwandeln.');lastBuiltState=builtState;const a=$('convert-download');a.href=result.url;a.textContent=result.name+' herunterladen · '+result.renderer+'-'+design.buildId;a.hidden=false;let previewLink=document.getElementById('convert-preview');if(!previewLink){previewLink=document.createElement('a');previewLink.id='convert-preview';previewLink.target='_blank';previewLink.rel='noopener';a.after(previewLink);}previewLink.hidden=false;previewLink.href=result.previewUrl;previewLink.textContent='Vorschau dieser PRG · '+result.renderer+'-'+design.buildId;status('Fertig · '+design.elements.filter(e=>e.type==='image'&&e.visible).length+' Bild(er) eingebettet. Auf der Uhr dieses Zifferblatt wählen: '+result.appName+'. Nur dieser Bau enthält den gerade umgewandelten Entwurf.');}
  catch(e){status(e.name==='AbortError'?'Warten beendet. Ein bereits gestarteter GitHub-Bau läuft dort weiter.':e.message);}
  finally{$('convert-now').disabled=false;$('convert-cancel').hidden=true;conversionController=null;}
 };
 $('import').onchange=async()=>{try{const f=$('import').files[0];if(!f)return;if(f.size>8000000)throw Error('Datei ist zu groß (max. 8 MB).');const v=validate(JSON.parse(await f.text()));await loadDesignImages(v);change(()=>{state=v;delete state.renderAssets;delete state.renderVersion;activeId='custom-'+Date.now().toString(36);state.editorId=activeId;const u=new URL(location.href);u.searchParams.set('design',activeId);historyAPI(u);selected=0;});message('Design einschließlich Bilder geladen.');}catch(e){message(e.message);}$('import').value='';};
 async function addImageFile(f){
  if(state.elements.length>=40)throw Error('Höchstens 40 Elemente.');
  if(f.size>20000000)throw Error('Bild zu groß (max. 20 MB).');
  message('Bild wird geladen …');
  const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Datei konnte nicht gelesen werden.'));reader.readAsDataURL(f);});
  const im=await loadImage(source),iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
  if(!iw||!ih)throw Error('Bild hat keine lesbare Größe.');
  const factor=Math.min(1,448/iw,486/ih),c=document.createElement('canvas');c.width=Math.max(8,Math.round(iw*factor));c.height=Math.max(8,Math.round(ih*factor));c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  const data=c.toDataURL('image/png');if(data.length>1500000)throw Error('Bild enthält zu viele Daten. Bitte ein kleineres Bild wählen.');if(JSON.stringify(state).length+data.length>7000000)throw Error('Design ist voll. Bitte ein anderes Bild entfernen und erneut versuchen.');
  await loadImage(data);if(source!==data){images.delete(source);imageLoads.delete(source);}
  change(()=>{state.elements.push({...element('image',0,0,30),width:c.width,height:c.height,data,filename:f.name});selected=state.elements.length-1;});
  await savePreview();message('Bild eingebettet: '+f.name+' ('+c.width+' × '+c.height+' Pixel). Zum Übertragen auf die Uhr jetzt eine neue PRG bauen. Mit „In den Hintergrund“ hinter die Uhrzeit legen.');
 }
 $('image-upload').onchange=async()=>{const input=$('image-upload'),f=input.files[0];if(!f)return;input.disabled=true;try{await addImageFile(f);}catch(e){message(e.message);}finally{input.disabled=false;input.value='';}};
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));$('edit').hidden=b.dataset.tab!=='edit';$('export').hidden=b.dataset.tab!=='export';});$('live').onchange=draw;
 await loadCarArtwork();
 atlas=await(await fetch('assets/fonts/atlas.json?v=022')).json();await Promise.all(Object.keys(atlas).map(name=>new Promise((r,j)=>{const i=new Image();i.onload=r;i.onerror=j;i.src='assets/fonts/'+name+'.png?v=022';atlasImages[name]=i;})));
 await Promise.all(fonts.map(async f=>{const font=new FontFace('Editor-'+f,'url(assets/editor-fonts/'+f+'.ttf)');document.fonts.add(await font.load());}));
 try{if(original&&slots[original]){state=preset(slots[original]);activeId='custom-'+crypto.randomUUID();}else{let id=requested;try{id=id||localStorage.getItem(KEY+':last-active');}catch{}let row=id?await designStore.get(id):null;if(requested&&slots[requested])row=await templateRow(row,requested);if(!row&&id&&(await designStore.trash()).some(r=>r.id===id)){if(slots[id]){id='custom-'+Date.now().toString(36);}else{window.location.replace('./#saved-collection');return;}}if(!row&&!requested){try{const d=validate(JSON.parse(localStorage.getItem(KEY)));row={id:d.editorId||slotId(d.name),design:d};}catch{}}if(row){state=validate(row.design);activeId=row.id;}else{state=preset(slots[requested]||'Sport');activeId=id||requested||slotId(state.name);}}}catch{state=preset(slots[requested]||'Sport');activeId='custom-'+crypto.randomUUID();}if(original||requested&&requested!==activeId){const u=new URL(location.href);u.searchParams.delete('template');u.searchParams.set('design',activeId);historyAPI(u);}if([...$('preset').options].some(o=>o.value===state.name))$('preset').value=state.name;refresh();setInterval(draw,1000);
})().catch(e=>{document.getElementById('message').textContent='Editor konnte nicht starten. Bitte neu laden. '+e.message;});
