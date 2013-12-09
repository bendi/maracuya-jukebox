
#!/usr/bin/env bash

# IMPORTANT 
# Protect agaisnt mispelling a var and rm -rf /
set -u
set -e

SRC=/tmp/maracuya-jukebox-deb-src
DIST=/tmp/maracuya-jukebox-deb-dist
SYSROOT=${SRC}/sysroot
DEBIAN=${SRC}/DEBIAN
NODE_VERSION=`node -v`

ARCH=`dpkg --print-architecture`

VERSION=$1

echo "Building Maracuya Jukebox for arch: $ARCH, version: $VERSION"

rm -rf ${DIST}
mkdir -p ${DIST}/

rm -rf ${SRC}
rsync -a deb-src/ ${SRC}/
mkdir -p ${SYSROOT}/opt/maracuya/maracuya-jukebox/

rsync -a ../../../maracuya/ ${SYSROOT}/opt/maracuya/maracuya-jukebox/ --delete

pushd ${SYSROOT}/opt/maracuya/maracuya-jukebox/
npm install --production
popd

find ${SRC}/ -type d -exec chmod 0755 {} \;
find ${SRC}/ -type f -exec chmod go-w {} \;

let SIZE=`du -s ${SYSROOT} | sed s'/\s\+.*//'`+8
pushd ${SYSROOT}/
tar czf ${DIST}/data.tar.gz [a-z]*
popd

sed s"/\$SIZE/${SIZE}/" -i ${DEBIAN}/control
sed s"/\$VERSION/${VERSION}/" -i ${DEBIAN}/control
sed s"/\$ARCH/${ARCH}/" -i ${DEBIAN}/control
sed s"/\@NODE_VERSION/${NODE_VERSION}/" -i ${DEBIAN}/preinst
 
pushd ${DEBIAN}
tar czf ${DIST}/control.tar.gz *
popd

pushd ${DIST}/
echo 2.0 > ./debian-binary

find ${DIST}/ -type d -exec chmod 0755 {} \;
find ${DIST}/ -type f -exec chmod go-w {} \;

ar r ${DIST}/maracuya-jukebox-${VERSION}-${ARCH}.deb debian-binary control.tar.gz data.tar.gz
popd
rsync -a ${DIST}/maracuya-jukebox-${VERSION}-${ARCH}.deb ./
