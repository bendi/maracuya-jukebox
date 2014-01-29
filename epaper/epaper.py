#necessary imports first
from PIL import Image
from epyper.displayCOGProcess import Display
from epyper.displayController import DisplayController
import StringIO
import sys

#create DisplayController instance specifying display type as an argument
display = DisplayController(Display.EPD_TYPE_270)

im = Image.new('RGB', (264, 176), 'white')

import base64
from urlparse import urlparse

#linestring = open('qr.gif', 'r').read()


linestring = sys.argv[1]
up = urlparse(linestring)
(head, data) = up.path.split(',', 1)
bits = head.split(';')
mime_type = bits[0] if bits[0] else 'text/plain'
(charset, b64) = ('ASCII', False)
for bit in bits[1]:
    if bit.startswith('charset='):
        charset = bit[8:]
    elif bit == 'base64':
        b64 = True

# Do something smart with charset and b64 instead of assuming
plaindata = base64.b64decode(data)

#qrr = Image.fromstring("RGB", (164, 164), plaindata)
qrr = Image.open(StringIO.StringIO(plaindata))

im.paste(qrr, (10,10))

#print im
#display it!
display.displayImg(im)

