from PIL import Image
from epyper.displayCOGProcess import Display
from epyper.displayController import DisplayController
import StringIO
import sys
import argparse
import os


file_path = os.path.dirname(__file__)
if file_path != "":
    os.chdir(file_path)


parser = argparse.ArgumentParser()
parser.add_argument('--logo', help='Should i display logo', action='store_true')
parser.add_argument('image', metavar='I', help='Image to display (when no logo option was specified)')
args = parser.parse_args()

#create DisplayController instance specifying display type as an argument
display = DisplayController(Display.EPD_TYPE_270)

im = Image.new('RGB', (264, 176), 'white')

import base64
from urlparse import urlparse
displayQr = not args.logo;

if displayQr:
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

  qrr = Image.open(StringIO.StringIO(plaindata))
else:
  qrr = Image.open('marakuja-logo-epaper.png', 'r').transpose(Image.FLIP_TOP_BOTTOM).transpose(Image.FLIP_LEFT_RIGHT)

im.paste(qrr, (10,10))

#print im
#display it!
display.displayImg(im)

