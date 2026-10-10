# Builds the single-file playpen artifact from src/ and copies the engine into desktop/
import re, shutil, glob, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
ORDER = ['font-data','raster','rex','cat','items','sound','world','jungle','panel']
for f in ORDER: shutil.copy(f'src/{f}.js', f'desktop/engine/{f}.js')
s = open('web/playpen.src.html').read()
s = s.replace('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n','')
s = s.replace('</head>\n<body>\n','').replace('</body>\n</html>\n','')
eng = ''.join(open(f'src/{f}.js').read() + '\n' for f in ORDER)
s = re.sub(r'<!--ENGINE-->.*?<!--/ENGINE-->', lambda m: '<script>\n' + eng.replace('</script', '<\\/script') + '</script>', s, flags=re.S)
s = s.replace("<style>", "<style>\n  @font-face { font-family: 'BoPixel'; src: url(" + "FONTURI" + ") format('truetype'); }", 1)
uri = re.search(r'BZ.FONT_URI = "([^"]+)"', open('src/font-data.js').read()).group(1)
s = s.replace('FONTURI', uri)
open('web/desktop-bo.html','w').write(s)
print('built', len(s))
