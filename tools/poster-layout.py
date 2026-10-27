"""Compose approved image_gen originals with editable, deterministic typography.
Pillow is only needed to re-author assets; ordinary npm builds use saved masters.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'assets/posters/masters'
OUT.mkdir(parents=True,exist_ok=True)
FONT=Path('C:/Windows/Fonts/msyh.ttc')
LATIN=Path('C:/Windows/Fonts/arial.ttf')
def font(size,latin=False): return ImageFont.truetype(str(LATIN if latin else FONT),size)
layouts=json.loads((ROOT/'assets/posters/layout.json').read_text(encoding='utf-8'))
overview=Image.new('RGB',(1600,4*460),(24,35,33))
for i,a in enumerate(layouts):
    w,h={'wide':(2048,1024),'portrait':(1024,2048),'square':(1024,1024)}[a['aspect']]
    src=Image.open(ROOT/f"assets/posters/originals/{a['key']}.png").convert('RGBA')
    art=ImageOps.contain(src,(w,h),Image.Resampling.LANCZOS)
    im=Image.new('RGBA',(w,h),(19,30,28,255));im.alpha_composite(art,((w-art.width)//2,h-art.height))
    d=ImageDraw.Draw(im);margin=max(38,w//24)
    d.rectangle((margin,margin,w-margin,h-margin),outline=(193,163,105),width=3)
    # A dark header guarantees contrast regardless of generated highlights.
    header=Image.new('RGBA',(w,int(h*.245)),(17,27,26,245));im.alpha_composite(header,(0,0));d=ImageDraw.Draw(im)
    title_size=min(112,int(w/(len(a['zh'])+2)))
    titlefont=font(title_size);box=d.textbbox((0,0),a['zh'],font=titlefont)
    d.text(((w-(box[2]-box[0]))/2,h*.055),a['zh'],font=titlefont,fill=(241,222,185))
    subfont=font(max(22,w//48),True);en=a['en'].upper();box=d.textbbox((0,0),en,font=subfont)
    d.text(((w-(box[2]-box[0]))/2,h*.055+title_size+30),en,font=subfont,fill=(189,169,128))
    d.line((w*.33,h*.218,w*.67,h*.218),fill=(193,163,105),width=2)
    d.text((margin+12,h-margin-34),'FOOD & TABLE',font=font(20,True),fill=(222,204,168))
    im.save(OUT/f"{a['key']}.png")
    thumb=ImageOps.contain(im.convert('RGB'),(380,400));x=(i%4)*400+(400-thumb.width)//2;y=(i//4)*460+10
    overview.paste(thumb,(x,y));od=ImageDraw.Draw(overview);od.text(((i%4)*400+20,(i//4)*460+420),a['zh'],font=font(24),fill=(236,215,177))
(ROOT/'previews').mkdir(exist_ok=True);overview.save(ROOT/'previews/advertisements.png')
paper=ROOT/'assets/paper-cups';paper.mkdir(exist_ok=True)
for key,color in [('coca_cola_paper_cup','#c52e35'),('pepsi_paper_cup','#2358ac')]:
    im=Image.new('RGBA',(128,128),color);d=ImageDraw.Draw(im);d.rectangle((0,32,31,63),fill='#eee9d9');d.rectangle((0,80,127,127),fill=color)
    if key.startswith('coca'):
        f=font(23,True);d.text((4,87),'Coca-Cola',font=f,fill='white');d.arc((7,110,120,130),0,170,fill='white',width=2)
    else:
        d.ellipse((7,84,44,121),fill='white');d.pieslice((10,87,41,118),180,360,fill='#df3544');d.pieslice((10,87,41,118),0,180,fill='#183b8c');d.line((11,103,40,99),fill='white',width=6);d.text((48,93),'PEPSI',font=font(19,True),fill='white')
    im.save(paper/f'{key}.png')
print('Composed 12 poster masters and 2 private paper-cup labels.')
