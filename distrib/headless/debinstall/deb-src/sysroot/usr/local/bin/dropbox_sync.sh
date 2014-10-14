#!/bin/bash

VER="@NODE_VERSION"

ARCH=$ARCH
if [ $ARCH == "armhf" ]; then
    NODE_PATH=/opt/node-$VER-linux-arm-pi
else
    NODE_PATH=/opt/node-$VER-linux-$ARCH
fi

rm mypipe
mkfifo mypipe

FILES=""
FOUND=0

MJ_RUN="$NODE_PATH/bin/node /opt/maracuya/maracuya-jukebox/src/run.js -d /home/pi/.virtual-jukebox "

dropbox_uploader.sh -s -f /home/pi/.dropbox_uploader download mp3 /home/pi/ \
  | grep -P "Downloading.*DONE|Skipping already existing file" \
  | perl -nle 's/.*?\"(\/home.*?)".*?$/$1/;print' > mypipe &

while read -r file; do
  echo "running:   $MJ_RUN insert \"$file\""
  $MJ_RUN insert "$file"
  file=${file/\/home\/pi\/mp3\//}
  FILES="$FILES -and -not -name \"$file\""
  FOUND=1
done < mypipe 

if [ $FOUND -ne 0 ] ; then 
  echo "Removing obsolete files"
  sh -c  "find /home/pi/mp3 -type f $FILES -exec $MJ_RUN remove {} \;" 
  sh -c  "find /home/pi/mp3 -type f $FILES -exec rm {} \;" 
else
  echo "No files found exiting"
fi