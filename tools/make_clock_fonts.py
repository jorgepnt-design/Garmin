"""Create limited digit bitmap fonts for the Venu X1 (Pillow required)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'shared/resources/fonts'
FONTS.mkdir(parents=True, exist_ok=True)
CHARACTERS = '0123456789:'

def make(name, path, height, digit_width, colon_width, italic=False):
    font = ImageFont.truetype(path, 180)
    top = min(font.getbbox(c, anchor='ls')[1] for c in '0123456789')
    bottom = max(font.getbbox(c, anchor='ls')[3] for c in '0123456789')
    scale = height / (bottom-top)
    atlas = Image.new('RGBA', (digit_width*10+colon_width, height), (255,255,255,0))
    rows = []
    x = 0
    for c in CHARACTERS:
        width = colon_width if c == ':' else digit_width
        left, y1, right, y2 = font.getbbox(c, anchor='ls')
        mask = Image.new('L', (right-left+6, bottom-top), 0)
        ImageDraw.Draw(mask).text((3-left,-top), c, font=font, anchor='ls', fill=255)
        mask = mask.resize((width,height), Image.Resampling.LANCZOS)
        if italic:
            # The face uses a condensed slanted athletic numeral style.
            mask = mask.transform(mask.size, Image.Transform.AFFINE, (1,.11,-height*.055,0,1,0), resample=Image.Resampling.BICUBIC)
        glyph = Image.new('RGBA',mask.size,(255,255,255,0))
        glyph.putalpha(mask)
        atlas.paste(glyph,(x,0))
        rows.append(f'char id={ord(c)} x={x} y=0 width={width} height={height} xoffset=0 yoffset=0 xadvance={width} page=0 chnl=15')
        x += width
    atlas.save(FONTS / (name+'.png'))
    content = '\n'.join([f'info face="Jorge {name}" size={height} bold=0 italic={int(italic)} charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=0,0', f'common lineHeight={height} base={height} scaleW={atlas.width} scaleH={atlas.height} pages=1 packed=0', f'page id=0 file="{name}.png"', f'chars count={len(rows)}', *rows])+'\n'
    (FONTS / (name+'.fnt')).write_text(content,encoding='utf-8')

bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
serif='/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf'
for name, path, italic in [('bold',bold,False),('sport',bold,True),('elegant',serif,False)]:
    make(name, path, 132, 74, 24, italic)
    make(name+'-seconds', path, 63, 30, 12, italic)
for slug in ('sport','elegant','tesla','portugal'):
    name=slug if slug in ('sport','elegant') else 'bold'
    (ROOT/f'faces/{slug}/resources/fonts.xml').write_text(f'<resources><font id="ClockMain" filename="../../../shared/resources/fonts/{name}.fnt"/><font id="ClockSeconds" filename="../../../shared/resources/fonts/{name}-seconds.fnt"/></resources>\n',encoding='utf-8')
print('Clock font resources generated for four faces.')
