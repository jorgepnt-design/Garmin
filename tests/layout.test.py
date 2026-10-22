"""Check actual font-atlas widths against the Venu X1 layout, including extremes."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
f=json.loads((ROOT/'docs/assets/fonts/atlas.json').read_text())
def width(font,text): return sum(f[font]['glyphs'][c]['w'] for c in text)
for face in ('sport','elegant','bold'):
    for h in range(24):
        for m in range(60):
            assert width(face,f'{h:02}:{m:02}')+8+width(face+'-seconds',':59')<=412
for day in ('SO','MO','DI','MI','DO','FR','SA'):
    for month in ('JAN','FEB','MAR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'):
        assert 28+width('date',f'{day}, 30. {month}') < 420-width('battery','100%')-44-12
for t in (-50,-20,-1,0,9,16,60): assert width('value',f'{t}°C')<=120
for km in (0,.01,.91,8.42,99.99,100,999.9,1000,9999):
    value=f'{km:.2f}' if km<100 else f'{km:.1f}' if km<1000 else f'{km:.0f}'
    assert width('value',value)<=120,(km,value)
for text in ('WETTER','KM HEUTE','ALARME'): assert width('label',text)<=120
assert f['battery']['height']>=36
assert f['value']['height']>=32 and f['label']['height']>=18
assert 389+f['value']['height']<431 and 431+f['label']['height']<=457
print('All clock times, header, battery, metric extremes and vertical text gaps fit.')
