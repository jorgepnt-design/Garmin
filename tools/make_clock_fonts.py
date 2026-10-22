"""Render pixel-sized font masks: opaque grayscale for Garmin, alpha masks for web.

Garmin's bitmap-font antialias import needs luminance information in RGB, not
white RGB with coverage only in alpha. The web export uses the same coverage
mask as alpha. Glyphs keep their advance/bearings rather than stretching ink.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'shared/resources/fonts'; OUT.mkdir(parents=True,exist_ok=True)
WEB=ROOT/'docs/assets/fonts'; WEB.mkdir(parents=True,exist_ok=True)
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
SANS='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SERIF='/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf'
def make(name,path,height,chars,digit=None,colon=None):
    # Choose a real raster size; never resize glyphs vertically after rendering.
    font=None
    for size in range(1,350):
        probe=ImageFont.truetype(path,size)
        boxes=[probe.getbbox(c,anchor='ls') for c in chars]
        if max(b[3] for b in boxes)-min(b[1] for b in boxes)>height: break
        font=probe
    boxes={c:font.getbbox(c,anchor='ls') for c in chars}
    top=min(b[1] for b in boxes.values())
    widths={c:(colon if c==':' and colon else digit if c.isdigit() and digit else max(4,round(font.getlength(c))+2)) for c in chars}
    mask_atlas=Image.new('L',(sum(widths.values()),height),0);rows=[];glyphs={};x=0
    for c in chars:
        w=widths[c]
        # Keep side bearings and the normal tabular cell. A narrow '1' remains
        # narrow inside its cell, unlike the former per-ink-box stretching.
        source_w=max(4,round(font.getlength(c))+2)
        mask=Image.new('L',(source_w,height),0)
        ImageDraw.Draw(mask).text((1,-top),c,font=font,anchor='ls',fill=255)
        if source_w!=w:
            mask=mask.resize((w,height),Image.Resampling.BICUBIC)
        mask_atlas.paste(mask,(x,0))
        rows.append(f'char id={ord(c)} x={x} y=0 width={w} height={height} xoffset=0 yoffset=0 xadvance={w} page=0 chnl=15')
        glyphs[c]={'x':x,'w':w};x+=w
    # IMPORTANT: compiler reads gray edge coverage from RGB; background is black.
    mask_atlas.convert('RGB').save(OUT/(name+'.png'))
    web=Image.new('RGBA',mask_atlas.size,(255,255,255,0));web.putalpha(mask_atlas);web.save(WEB/(name+'.png'))
    (OUT/(name+'.fnt')).write_text('\n'.join([f'info face="Jorge {name}" size={height} bold=0 italic=0 unicode=1 smooth=1 aa=1',f'common lineHeight={height} base={height} scaleW={x} scaleH={height} pages=1 packed=0 alphaChnl=4 redChnl=0 greenChnl=0 blueChnl=0',f'page id=0 file="{name}.png"',f'chars count={len(rows)}',*rows])+'\n')
    return {'height':height,'glyphs':glyphs}
meta={}
for name,path in [('bold',BOLD),('sport',BOLD),('elegant',SERIF)]:
    meta[name]=make(name,path,128,'0123456789:',74 if name=='elegant' else 76,24)
    meta[name+'-seconds']=make(name+'-seconds',path,56,'0123456789:',25,10)
chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:.,%°-+ /'
for name,h,path in [('value',32,BOLD),('label',18,SANS),('date',22,SANS),('battery',36,SANS)]:meta[name]=make(name,path,h,chars)
(WEB/'atlas.json').write_text(json.dumps(meta))
for slug in ('sport','elegant','tesla','portugal'):
    name=slug if slug in ('sport','elegant') else 'bold'
    fonts={'ClockMain':name,'ClockSeconds':name+'-seconds','MetricValue':'value','MetricLabel':'label','Header':'date','Battery':'battery'}
    (ROOT/f'faces/{slug}/resources/fonts.xml').write_text('<resources>'+''.join(f'<font id="{i}" filename="../../../shared/resources/fonts/{f}.fnt" antialias="true"/>' for i,f in fonts.items())+'</resources>\n')
print('Generated Garmin RGB grayscale fonts and matching web coverage masks.')
