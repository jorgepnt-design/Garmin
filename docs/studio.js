'use strict';
(async()=>{
 const $=id=>document.getElementById(id),canvas=$('studio-canvas'),ctx=canvas.getContext('2d');
 let meta, images={},savedImages={},car=new Image(),ready=false,holdTimer;
 const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
 const color={sport:'#a8ff24',elegant:'#e8cd91',tesla:'#ff2438',portugal:'#00c765'};
 const fontName=()=>['sport','elegant'].includes($('studio-theme').value)?$('studio-theme').value:'bold';
 const width=(name,text)=>[...text].reduce((w,c)=>w+(meta[name].glyphs[c]?.w||0),0);
 function text(name,str,x,y,fill,align='left'){
  const m=meta[name],w=width(name,str),layer=document.createElement('canvas');layer.width=Math.max(w,1);layer.height=m.height;
  const c=layer.getContext('2d');let p=0;
  for(const ch of str){const g=m.glyphs[ch];if(g){c.drawImage(images[name],g.x,0,g.w,m.height,p,0,g.w,m.height);p+=g.w;}}
  c.globalCompositeOperation='source-in';c.fillStyle=fill;c.fillRect(0,0,w,m.height);
  ctx.drawImage(layer,Math.round(x-(align==='center'?w/2:align==='right'?w:0)),y);
 }
 function line(x,y,a,b,c,w=1){ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke();}
 function icon(x,kind,c){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=3;ctx.beginPath();
  if(kind===0){ctx.arc(x-7,345,9,0,Math.PI*2);ctx.stroke();line(x-7,330,x-7,334,c);ctx.beginPath();ctx.arc(x+2,354,10,0,Math.PI*2);ctx.roundRect(x-15,352,35,15,6);ctx.stroke();}
  else if(kind===1){ctx.arc(x+5,337,5,0,Math.PI*2);ctx.fill();[[0,347,-6,359],[-6,359,5,366],[5,366,1,378],[-6,359,-15,372],[-15,372,-22,374],[-12,350,0,345],[0,345,10,355],[10,355,18,348]].forEach(v=>line(x+v[0],v[1],x+v[2],v[3],c,4));}
  else{ctx.arc(x,352,14,0,Math.PI*2);ctx.stroke();[[0,343,0,352],[0,352,7,356],[-12,335,-18,341],[12,335,18,341],[-9,366,-12,372],[9,366,12,372]].forEach(v=>line(x+v[0],v[1],x+v[2],v[3],c));}
 }
 function draw(){if(!ready)return;const theme=$('studio-theme').value,a=color[theme],gold=theme==='elegant',pt=theme==='portugal';ctx.fillStyle='#000';ctx.fillRect(0,0,448,486);
 try{const saved=(window.JorgeSavedPreviews?.[theme]||JSON.parse(localStorage.getItem('jorge-editor-v1:preview:'+theme)));if(saved&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(saved.image)){
 const old=savedImages[theme];if(!old||old.src!==saved.image){const img=new Image();img.onload=draw;img.src=saved.image;savedImages[theme]=img;}const img=savedImages[theme];if(img.complete)ctx.drawImage(img,0,0,448,486);
 $('studio-download').href='./editor.html?design='+theme;$('studio-download').textContent='Gespeicherten Entwurf bearbeiten / eigene PRG bauen';$('studio-load').textContent='Dein gespeicherter Entwurf · Vorschau mit gespeicherten Beispielwerten. Zum Ändern im Editor öffnen.';return;
 }}catch{}
 $('studio-load').textContent='448 × 486 Pixel · Standarddesign';
 $('studio-download').href='./builds/0.2.3/Jorge-'+theme+'.prg'; $('studio-download').textContent=theme.charAt(0).toUpperCase()+theme.slice(1)+' · PRG 0.2.3 herunterladen';
 const n=$('studio-live').checked?new Date():new Date('2026-10-23T'+($('studio-time').value||'20:35')+':42');
 const pad=x=>String(x).padStart(2,'0'),h=pad(n.getHours()),m=pad(n.getMinutes()),s=pad(n.getSeconds());
 if($('studio-aod').checked){text('value',h+':'+m,224,210,'#777','center');return;}
 const top=pt?94:47;text('date',['So.','Mo.','Di.','Mi.','Do.','Fr.','Sa.'][n.getDay()]+' '+pad(n.getDate())+'.'+pad(n.getMonth()+1)+'.',28,top+6,gold?a:'#fff');const battery=$('studio-battery').value+'%';text('battery',battery,420,top-5,a,'right');const bx=420-width('battery',battery)-44;ctx.strokeStyle=a;ctx.lineWidth=2;ctx.strokeRect(bx,top+3,32,20);ctx.fillStyle=a;ctx.fillRect(bx+33,top+9,3,8);ctx.fillRect(bx+3,top+6,Math.floor(26*Number($('studio-battery').value)/100),14);
 if(pt){line(19,103,19,406,a,4);line(429,103,429,406,'#ef3340',4);ctx.strokeStyle='#e8cd91';ctx.beginPath();ctx.arc(224,50,21,0,7);ctx.stroke();ctx.fillStyle='#ef3340';ctx.fillRect(212,36,24,25);ctx.beginPath();ctx.arc(224,59,12,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(217,40,14,19);ctx.beginPath();ctx.arc(224,57,7,0,7);ctx.fill();ctx.fillStyle='#039';[[222,42],[219,48],[226,48],[222,55]].forEach(p=>ctx.fillRect(...p,4,4));}
 if(gold){line(35,95,413,95,a);line(35,320,413,320,a);}
 const f=fontName(),small=f+'-seconds',main=h+':'+m,sec=':'+s,total=width(f,main)+8+width(small,sec),start=Math.floor((448-total)/2),y=pt?155:theme==='tesla'?104:120;
 text(f,h,start,y,gold?a:'#fff');text(f,':'+m,start+width(f,h),y,gold||!pt?a:'#fff');text(small,sec,start+width(f,main)+8,y+72,a);
 if(theme==='tesla'){line(30,306,418,306,a);ctx.drawImage(car,40,242,368,100);}
 if(theme==='sport'){for(let i=0;i<3;i++){ctx.strokeStyle='#263025';ctx.lineWidth=7;ctx.beginPath();ctx.arc(82+i*142,389,63,0,7);ctx.stroke();ctx.strokeStyle=a;ctx.beginPath();ctx.arc(82+i*142,389,63,-Math.PI/2,Math.PI*.8);ctx.stroke();}line(35,307,413,307,a);}
 else {line(153,365,153,450,gold?a:'#343940');line(295,365,295,450,gold?a:'#343940');}
 const km=Number($('studio-distance').value),dist=km.toFixed(km<100?2:km<1000?1:0),temp=$('studio-missing').checked?'--':$('studio-temp').value;
 [82,224,366].forEach((x,i)=>icon(x,i,pt&&i===2?'#ef3340':a));
 [temp+'°C',dist,String(Number($('studio-alarm-count').value))].forEach((v,i)=>{if(width('value',v)>120)v='--';text('value',v,82+i*142,389,i===1&&!gold?'#fff':pt&&i===2?'#ef3340':a,'center');});
 ['WETTER','KM HEUTE',Number($('studio-alarm-count').value)>0?'AKTIV':'AUS'].forEach((v,i)=>text('label',v,82+i*142,431,'#d9dde1','center'));
 if($('studio-zones').checked){ctx.fillStyle='#ffffff15';ctx.strokeStyle='#ffffff80';[[22,325,131,135],[153,325,142,135],[320,35,106,90]].forEach(r=>{ctx.fillRect(...r);ctx.strokeRect(...r);});}
 }
 function activate(x,y){if($('studio-aod').checked)return;let msg='Hier ist kein bedienbares Datenfeld.';
 if(y>=325&&y<=460){if(x>=22&&x<153)msg='Wetter: Auf der Uhr gedrückt halten, um die Garmin-Wetteransicht zu öffnen.';else if(x<295&&x>=153)msg='Tagesaktivität: Auf der Uhr gedrückt halten. Öffnet die Schritte-Ansicht; die Zahl hier ist die Tagesdistanz.';else msg='Garmin gibt nur die Anzahl der Alarme frei, keine Uhrzeiten. Echte Alarme in Garmins Uhren-App einstellen. Diese Vorschau stellt keinen Wecker.';}
 else if(y>=35&&y<125&&x>=320)msg='Akku: Auf der Uhr gedrückt halten, um die zugehörige Garmin-Ansicht zu öffnen, sofern verfügbar.';
 $('studio-action').textContent=msg;
 }
 canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*448/r.width,y=(e.clientY-r.top)*486/r.height;holdTimer=setTimeout(()=>activate(x,y),650);});
 ['pointerup','pointercancel','pointerleave'].forEach(e=>canvas.addEventListener(e,()=>clearTimeout(holdTimer)));
 document.querySelectorAll('#studio input,#studio select').forEach(e=>e.addEventListener('input',draw));
 document.querySelectorAll('[data-studio-action]').forEach(e=>e.addEventListener('click',()=>activate(Number(e.dataset.studioAction),390)));
 try{meta=await(await fetch('./assets/fonts/atlas.json?v=022')).json();await Promise.all(Object.keys(meta).map(async name=>{images[name]=await load('./assets/fonts/'+name+'.png?v=022');}));car=await load('./assets/car.png');ready=true;draw();setInterval(draw,1000);$('studio-load').textContent='448 × 486 Pixel · gleiche Zeichenformen und Pixelmaße wie im Uhrencode';}
 catch(e){$('studio-load').textContent='Vorschau konnte nicht geladen werden. Bitte Seite neu laden.';}
})();
