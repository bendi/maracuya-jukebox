
#!/usr/bin/env bash

# IMPORTANT 
# Protect agaisnt mispelling a var and rm -rf /
set -u
set -e

NODE_VERSION=`node -v`

ARCH=`dpkg --print-architecture`

VERSION=$1

APP_NAME=maracuya-jukebox-epaper-${VERSION}-${ARCH}
SRC=/tmp/${APP_NAME}
SYSROOT=${SRC}/
DEBIAN=${SRC}/DEBIAN

echo "Building Maracuya Jukebox e-paper display support for arch: $ARCH, version: $VERSION"

rm -rf ${SRC}
rsync -a deb-src/DEBIAN ${SRC}/
rsync -a deb-src/sysroot/* ${SRC}/

let SIZE=`du -s ${SYSROOT} | sed s'/\s\+.*//'`+8

sed s"/\$SIZE/${SIZE}/" -i ${DEBIAN}/control
sed s"/\$VERSION/${VERSION}/" -i ${DEBIAN}/control
sed s"/\$ARCH/${ARCH}/" -i ${DEBIAN}/control

chmod 755 ${DEBIAN}/*
 
pushd /tmp/${APP_NAME}
echo 2.0 > ${DEBIAN}/debian-binary
popd

fakeroot dpkg-deb --build /tmp/${APP_NAME}

rsync -a /tmp/${APP_NAME}.deb ./

