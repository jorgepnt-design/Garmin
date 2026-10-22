"""Exercise image preservation, data fields, and invalid editor input in the PRG generator."""
import sys,json,tempfile,base64,io
from pathlib import Path
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from build_custom import generate,validate
FIXTURES=Path(__file__).resolve().parent/'fixtures/editor'
config=json.loads((FIXTURES/'editor-Sport.json').read_text())
b=io.BytesIO();Image.new('RGBA',(160,100),(255,255,255,128)).save(b,format='PNG')
config['elements'].insert(0,{'type':'image','font':'sans','size':30,'x':140,'y':260,'color':'#ffffff','visible':True,'width':160,'height':100,'data':'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()})
with tempfile.TemporaryDirectory() as t:
 out=generate(config,Path(t));im=Image.open(out/'resources/Image0.png');assert im.size==(160,100);assert im.getpixel((0,0))[3]==128
 code=(out/'source/Custom.mc').read_text();assert 'dc.drawBitmap(140,260' in code;assert code.index('dc.drawBitmap(140,260')<code.index('dc.drawText(28,53')
 assert 'alarmCount' in code and 'AKTIV' in code
for preset in ['Sport','Elegant','Tesla','Portugal','Ocean','Solar','Minimal']:
 with tempfile.TemporaryDirectory() as t:generate(json.loads((FIXTURES/('editor-'+preset+'.json')).read_text()),Path(t))
for value in [-1,float('nan'),500]:
 bad=json.loads(json.dumps(config));bad['elements'][0]['x']=value
 try:validate(bad)
 except ValueError:pass
 else:raise AssertionError('Invalid coordinate accepted')
Path('/tmp/editor-image-test.json').write_text(json.dumps(config))
print('Seven presets, embedded PNG transparency, native layer order and invalid coordinates verified.')
# Native-ready exports must keep the supplied pixel data and integer advances.
from build_custom import font_resource,static_image
import re
portable=json.loads(json.dumps(config));portable['renderVersion']=1;portable['renderAssets']={}
with tempfile.TemporaryDirectory() as t:
 folder=Path(t)
 for i,e in enumerate(portable['elements']):
  if not e.get('visible',True):continue
  if e['type'] in {'image','icon','text'}:
   im=static_image(e);b=io.BytesIO();im.save(b,format='PNG');asset={'kind':'bitmap','x':e['x'],'y':e['y']}
  else:
   font_resource(folder,'Test',e['font'],e['size'],'0123456789:.-% °CkmAKTIVUS');im=Image.open(folder/'Test.png').convert('L');coverage=Image.new('RGBA',im.size,'white');coverage.putalpha(im);b=io.BytesIO();coverage.save(b,format='PNG');glyphs={}
   for line in (folder/'Test.fnt').read_text().splitlines():
    if line.startswith('char id='):
     g={k:int(v) for k,v in re.findall(r'(id|x|width)=(-?\d+)',line)};glyphs[chr(g['id'])]={'x':g['x'],'w':g['width']}
   asset={'kind':'font','height':im.height,'width':im.width,'glyphs':glyphs}
  asset['data']='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode();portable['renderAssets'][str(i)]=asset
 out=generate(portable,folder/'exact');code=(out/'source/Custom.mc').read_text();assert 'drawPixels(dc,pixels[' in code;assert 'fonts["Font' not in code;assert (out/'resources/Exact0.png').read_bytes()
 glyph=Image.open(next((out/'resources').glob('Glyph*.png')));assert glyph.mode=='RGBA'
Path('/tmp/editor-pixel-test.json').write_text(json.dumps(portable))
print('Portable pixel assets bypass font-engine rendering and preserve supplied glyph advances.')
