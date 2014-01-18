
#!/usr/bin/env bash

# IMPORTANT 
# Protect agaisnt mispelling a var and rm -rf /
set -u
set -e

NODE_VERSION="0.10.24"

VERSION=$1

APP_NAME=maracuya-jukebox-dev-${VERSION}
SRC=/tmp/${APP_NAME}
SYSROOT=${SRC}/
DEBIAN=${SRC}/DEBIAN

echo "Building Maracuya Jukebox for, version: $VERSION"

rm -rf ${SRC}
rsync -a deb-src/DEBIAN ${SRC}/

rsync -a ../../../maracuya/build/* ${SYSROOT}/opt/maracuya/maracuya-jukebox/ --exclude=node_modules/grunt* --delete

let SIZE=`du -s ${SYSROOT} | sed s'/\s\+.*//'`+8

sed s"/\$SIZE/${SIZE}/" -i ${DEBIAN}/control
sed s"/\$VERSION/${VERSION}/" -i ${DEBIAN}/control
sed s"/\@NODE_VERSION/${NODE_VERSION}/" -i ${DEBIAN}/preinst

chmod 755 ${DEBIAN}/*
 
pushd /tmp/${APP_NAME}
echo 2.0 > ${DEBIAN}/debian-binary
popd

fakeroot dpkg-deb --build /tmp/${APP_NAME}

rsync -a /tmp/${APP_NAME}.deb ./

