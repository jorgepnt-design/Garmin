"""Generate antialiased pixel-sized fonts plus matching browser atlas metadata."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'shared/resources/fonts'; OUT.mkdir(parents=True,exist_ok=True)
WEB=ROOT/'docs/assets/fonts'; WEB.mkdir(parents=True,exist_ok=True)
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
SANS='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SERIF='/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf'
def make(name,path,height,chars,digit=None,colon=None,italic=False):
    font=ImageFont.truetype(path,240)
    boxes={c:font.getbbox(c,anchor='ls') for c in chars}
    top=min(b[1] for b in boxes.values()); bottom=max(b[3] for b in boxes.values())
    scale=height/(bottom-top)
    widths={c:(colon if c==':' and colon else digit if c.isdigit() and digit else max(4,round(font.getlength(c)*scale))) for c in chars}
    atlas=Image.new('RGBA',(sum(widths.values()),height),(255,255,255,0)); rows=[]; glyphs={}; x=0
    for c in chars:
        w=widths[c]; l,_,r,_=boxes[c]
        mask=Image.new('L',(max(r-l+8,8),bottom-top),0)
        ImageDraw.Draw(mask).text((4-l,-top),c,font=font,anchor='ls',fill=255)
        mask=mask.resize((w,height),Image.Resampling.LANCZOS)
        if italic: mask=mask.transform(mask.size,Image.Transform.AFFINE,(1,.08,-height*.04,0,1,0),resample=Image.Resampling.BICUBIC)
        tile=Image.new('RGBA',(w,height),(255,255,255,0)); tile.putalpha(mask); atlas.paste(tile,(x,0))
        rows.append(f'char id={ord(c)} x={x} y=0 width={w} height={height} xoffset=0 yoffset=0 xadvance={w} page=0 chnl=15'); glyphs[c]={'x':x,'w':w}; x+=w
    atlas.save(OUT/(name+'.png'))
    (OUT/(name+'.fnt')).write_text('\n'.join([f'info face="Jorge {name}" size={height} bold=0 italic=0 unicode=1 smooth=1 aa=1',f'common lineHeight={height} base={height} scaleW={x} scaleH={height} pages=1 packed=0',f'page id=0 file="{name}.png"',f'chars count={len(rows)}',*rows])+'\n')
    shutil.copy(OUT/(name+'.png'),WEB/(name+'.png'))
    return {'height':height,'glyphs':glyphs}
meta={}
for name,path,it in [('bold',BOLD,False),('sport',BOLD,True),('elegant',SERIF,False)]:
    meta[name]=make(name,path,122,'0123456789:',66,20,it)
    meta[name+'-seconds']=make(name+'-seconds',path,56,'0123456789:',25,10,it)
chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:.,%°-+ /'
for name,h,path in [('value',25,BOLD),('label',14,SANS),('date',20,SANS)]: meta[name]=make(name,path,h,chars)
(WEB/'atlas.json').write_text(json.dumps(meta))
for slug in ('sport','elegant','tesla','portugal'):
    name=slug if slug in ('sport','elegant') else 'bold'
    fonts={'ClockMain':name,'ClockSeconds':name+'-seconds','MetricValue':'value','MetricLabel':'label','Header':'date'}
    (ROOT/f'faces/{slug}/resources/fonts.xml').write_text('<resources>'+''.join(f'<font id="{i}" filename="../../../shared/resources/fonts/{f}.fnt" antialias="true"/>' for i,f in fonts.items())+'</resources>\n')
print('Generated shared native/browser antialiased fonts')
